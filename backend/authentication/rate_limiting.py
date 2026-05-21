import redis
from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework import status
import time
import hashlib


class RateLimiter:
    def __init__(self):
        self.redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True
        )
    
    def is_allowed(self, key, limit, period):
        """
        Check if request is allowed based on rate limit.
        Returns tuple (allowed, remaining, reset_time)
        """
        current_time = int(time.time())
        window_start = current_time - period
        
        try:
            # Remove old entries
            self.redis_client.zremrangebyscore(key, 0, window_start)
            
            # Count current requests
            current_count = self.redis_client.zcard(key)
            
            if current_count < limit:
                # Add current request
                self.redis_client.zadd(key, {str(current_time): current_time})
                self.redis_client.expire(key, period)
                remaining = limit - current_count - 1
                return True, remaining, current_time + period
            else:
                # Get oldest request time for reset time
                oldest = self.redis_client.zrange(key, 0, 0, withscores=True)
                reset_time = int(oldest[0][1]) + period if oldest else current_time + period
                return False, 0, reset_time
        except Exception:
            # Fallback when Redis is unavailable (e.g. in test envs)
            return True, limit, current_time + period


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def rate_limit(limit, period, key_func=None):
    """
    Rate limiting decorator.
    limit: maximum number of requests
    period: time period in seconds
    key_func: function to generate unique key (defaults to IP-based)
    """
    def decorator(view_func):
        def wrapped_view(request, *args, **kwargs):
            limiter = RateLimiter()
            
            if key_func:
                key = key_func(request)
            else:
                ip = get_client_ip(request)
                key = f"rate_limit:{ip}:{view_func.__name__}"
            
            allowed, remaining, reset_time = limiter.is_allowed(key, limit, period)
            
            if not allowed:
                return Response(
                    {'error': 'Rate limit exceeded', 'retry_after': reset_time - int(time.time())},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Add rate limit headers
            response = view_func(request, *args, **kwargs)
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(limit)
                response.headers['X-RateLimit-Remaining'] = str(remaining)
                response.headers['X-RateLimit-Reset'] = str(reset_time)
            
            return response
        return wrapped_view
    return decorator


class DeduplicationLock:
    """
    Redis-based deduplication lock to prevent duplicate payment processing.
    """
    def __init__(self):
        self.redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True
        )
    
    def acquire(self, lock_key, ttl=30):
        """
        Try to acquire a lock. Returns True if successful, False otherwise.
        """
        try:
            # Use SET with NX (only set if not exists) and EX (expiration)
            result = self.redis_client.set(lock_key, 'locked', nx=True, ex=ttl)
            return result is not None
        except Exception:
            # Fallback when Redis is unavailable: fail open to allow payment processing
            return True
    
    def release(self, lock_key):
        """
        Release the lock.
        """
        try:
            self.redis_client.delete(lock_key)
        except Exception:
            pass
    
    def is_locked(self, lock_key):
        """
        Check if a lock exists.
        """
        try:
            return self.redis_client.exists(lock_key) > 0
        except Exception:
            return False


def generate_payment_lock_key(wallet_id, amount, timestamp):
    """
    Generate a unique key for payment deduplication.
    """
    data = f"{wallet_id}:{amount}:{timestamp}"
    return f"payment_lock:{hashlib.md5(data.encode()).hexdigest()}"


def check_duplicate_payment(wallet_id, amount, timestamp):
    """
    Check if this payment has already been processed.
    """
    lock = DeduplicationLock()
    lock_key = generate_payment_lock_key(wallet_id, amount, timestamp)
    return lock.is_locked(lock_key)

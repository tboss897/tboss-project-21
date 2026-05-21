import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, ArrowLeft, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);

    try {
      await api.post('/auth/password/reset/', { email });
      toast.success('If an account exists with this email, a reset link has been sent.');
      setEmail('');
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-surface-950 via-surface-900 to-primary-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft ambient lights */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h2>
          <p className="text-sm text-surface-400 mt-2">Enter your email to receive a password reset link</p>
        </div>

        {/* glass-card wrapper */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-950/50 border border-white/10 rounded-2xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  placeholder="e.g. user@school.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 active:scale-[0.99] transition duration-150 shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-400 hover:text-accent-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

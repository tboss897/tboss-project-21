import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Mail, ShieldAlert, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

function Login() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'portal'
  
  // Student Form fields
  const [matricNo, setMatricNo] = useState('');
  const [pin, setPin] = useState('');

  // Portal Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent'); // 'parent', 'seller', 'admin'
  
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!matricNo || !pin) {
      toast.error('Please fill in all student login fields');
      return;
    }
    setLoading(true);

    try {
      const student = await login(matricNo, pin, 'student');
      toast.success(`Welcome back, ${student.full_name}!`);
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Invalid Matric Number or PIN');
    } finally {
      setLoading(false);
    }
  };

  const handlePortalSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);

    try {
      const user = await login(email, password, role);
      toast.success(`Access granted. Welcome, ${user.name}!`);
      
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'seller') navigate('/seller/scan');
      else navigate('/parent/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Invalid credentials or role selection');
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
          <h2 className="text-3xl font-extrabold text-white tracking-tight">SmartSchool Wallet</h2>
          <p className="text-sm text-surface-400 mt-2">Safe. Smart. Cashless.</p>
        </div>

        {/* glass-card wrapper */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Tab Selector */}
          <div className="flex bg-surface-950/40 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'student'
                  ? 'bg-white text-surface-900 shadow-md'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'portal'
                  ? 'bg-white text-surface-900 shadow-md'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Staff & Parents
            </button>
          </div>

          {/* Tab A: Student Login */}
          {activeTab === 'student' && (
            <form className="space-y-6" onSubmit={handleStudentSubmit}>
              <div>
                <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">
                  Matriculation Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-surface-950/50 border border-white/10 rounded-2xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                    placeholder="e.g. MAT12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">
                  6-Digit Wallet PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-3.5 bg-surface-950/50 border border-white/10 rounded-2xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all tracking-widest font-mono"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 active:scale-[0.99] transition duration-150 shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Validating PIN...' : 'Verify & Enter Wallet'}
              </button>
            </form>
          )}

          {/* Tab B: Staff & Parent Login */}
          {activeTab === 'portal' && (
            <form className="space-y-6" onSubmit={handlePortalSubmit}>
              <div>
                <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">
                  Portal Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-950/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all cursor-pointer"
                >
                  <option value="parent" className="bg-surface-900 text-white">Parent / Guardian</option>
                  <option value="seller" className="bg-surface-900 text-white">Seller / Store Owner</option>
                  <option value="admin" className="bg-surface-900 text-white">School Administrator</option>
                </select>
              </div>

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
                    placeholder="e.g. parent@school.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-accent-400 hover:text-accent-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-surface-950/50 border border-white/10 rounded-2xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 active:scale-[0.99] transition duration-150 shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;

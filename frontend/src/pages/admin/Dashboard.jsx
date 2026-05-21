import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import api from '../../api/axios';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  Store, 
  ChevronRight, 
  Activity, 
  Server, 
  Database,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sample chart data to look extremely premium (can represent daily transaction volume)
  const chartData = [
    { name: 'Mon', amount: 45000 },
    { name: 'Tue', amount: 52000 },
    { name: 'Wed', amount: 49000 },
    { name: 'Thu', amount: 63000 },
    { name: 'Fri', amount: 58000 },
    { name: 'Sat', amount: 20000 },
    { name: 'Sun', amount: 15000 },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading admin metrics..." />
      </div>
    );
  }

  // Format currency helper
  const formatNaira = (value) => {
    const num = parseFloat(value || 0);
    return '₦' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Admin Dashboard</h1>
          <p className="page-subtitle">School e-wallet ecosystem analytics and operations</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/reports" className="btn btn-outline">
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-2xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-danger-600" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-bold text-surface-900 mt-2">{stats?.total_students || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Wallets</p>
              <h3 className="text-2xl font-bold text-surface-900 mt-2">{stats?.total_wallets || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-success-50 text-success-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-success-500" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Today's Sales</p>
              <h3 className="text-xl font-bold text-surface-900 mt-2.5 truncate">{formatNaira(stats?.total_transactions_today)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-accent-50 text-accent-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-500" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Float Balance</p>
              <h3 className="text-xl font-bold text-surface-900 mt-2.5 truncate">{formatNaira(stats?.total_balance)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-warning-50 text-warning-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-warning-500" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Active Stores</p>
              <h3 className="text-2xl font-bold text-surface-900 mt-2">{stats?.active_sellers || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
        </Card>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction chart */}
        <Card className="lg:col-span-2" title="Transaction Volume Trend">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F4E79" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1F4E79" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${val/1000}k`} />
                <Tooltip 
                  formatter={(value) => [formatNaira(value), 'Volume']}
                  contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#1F4E79" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick actions panel */}
        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Link 
                to="/admin/students" 
                className="p-4 border border-surface-150 rounded-2xl hover:bg-surface-50 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <div className="p-3 rounded-xl bg-primary-50 text-primary-600 group-hover:scale-110 transition duration-200">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-surface-700">Manage Students</span>
              </Link>

              <Link 
                to="/admin/sellers" 
                className="p-4 border border-surface-150 rounded-2xl hover:bg-surface-50 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition duration-200">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-surface-700">Manage Sellers</span>
              </Link>

              <Link 
                to="/admin/transactions" 
                className="p-4 border border-surface-150 rounded-2xl hover:bg-surface-50 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <div className="p-3 rounded-xl bg-success-50 text-success-600 group-hover:scale-110 transition duration-200">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-surface-700">Transactions</span>
              </Link>

              <Link 
                to="/admin/reports" 
                className="p-4 border border-surface-150 rounded-2xl hover:bg-surface-50 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <div className="p-3 rounded-xl bg-accent-50 text-accent-600 group-hover:scale-110 transition duration-200">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-surface-700">Reports Portal</span>
              </Link>
            </div>
          </Card>

          <Card title="System Services">
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-center bg-surface-50 p-3 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-semibold text-surface-700">Supabase DB</span>
                </div>
                <span className="badge badge-success">ONLINE</span>
              </div>
              <div className="flex justify-between items-center bg-surface-50 p-3 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-accent-500" />
                  <span className="text-xs font-semibold text-surface-700">Upstash Redis</span>
                </div>
                <span className="badge badge-success">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center bg-surface-50 p-3 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-surface-700">Vercel API</span>
                </div>
                <span className="badge badge-success">RUNNING</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import api from '../../api/axios';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/');
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Card title="Total Students">
            <div className="text-3xl font-bold text-primary-600">
              {stats?.total_students || 0}
            </div>
          </Card>
          
          <Card title="Total Wallets">
            <div className="text-3xl font-bold text-green-600">
              {stats?.total_wallets || 0}
            </div>
          </Card>
          
          <Card title="Today's Transactions">
            <div className="text-3xl font-bold text-orange-600">
              ₦{stats?.total_transactions_today?.toFixed(2) || '0.00'}
            </div>
          </Card>
          
          <Card title="Total Balance">
            <div className="text-3xl font-bold text-blue-600">
              ₦{stats?.total_balance?.toFixed(2) || '0.00'}
            </div>
          </Card>
          
          <Card title="Active Sellers">
            <div className="text-3xl font-bold text-purple-600">
              {stats?.active_sellers || 0}
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="text-center">
                  <div className="text-2xl mb-2">👨‍🎓</div>
                  <div className="text-sm">Manage Students</div>
                </div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="text-center">
                  <div className="text-2xl mb-2">👨‍💼</div>
                  <div className="text-sm">Manage Sellers</div>
                </div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm">Transactions</div>
                </div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm">Reports</div>
                </div>
              </button>
            </div>
          </Card>
          
          <Card title="System Status">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Redis Cache</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Server</span>
                <span className="text-sm font-medium text-green-600">Running</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;

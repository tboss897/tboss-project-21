import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import api from '../../api/axios';

function StudentDashboard() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      // TODO: Get wallet ID from user context or API
      // For now, this is a placeholder
      setLoading(false);
    } catch (err) {
      setError('Failed to load wallet data');
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Wallet Balance">
            <div className="text-3xl font-bold text-primary-600">
              ₦{wallet?.balance || '0.00'}
            </div>
          </Card>
          
          <Card title="Status">
            <div className="text-lg font-medium text-gray-900">
              {wallet?.status || 'Active'}
            </div>
          </Card>
          
          <Card title="QR Code">
            <div className="text-sm text-gray-600">
              View your QR code for payments
            </div>
          </Card>
        </div>
        
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm">View QR Code</div>
              </div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm">Transactions</div>
              </div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="text-sm">Profile</div>
              </div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm">Settings</div>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default StudentDashboard;

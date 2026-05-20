import { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../api/axios';

function ManualEntry() {
  const [formData, setFormData] = useState({
    wallet_id: '',
    amount: '',
    pin: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setReceipt(null);
    setLoading(true);

    try {
      const response = await api.post('/payments/process/', {
        wallet_id: parseInt(formData.wallet_id),
        amount: parseFloat(formData.amount),
        pin: formData.pin,
        description: formData.description,
      });
      setReceipt(response.data);
      setSuccess(true);
      setFormData({ wallet_id: '', amount: '', pin: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manual Payment Entry</h1>
        
        {success && receipt && (
          <Card title="Payment Successful" className="bg-green-50 border-green-200">
            <div className="space-y-2">
              <div><strong>Transaction ID:</strong> {receipt.transaction_id}</div>
              <div><strong>Amount:</strong> ₦{receipt.amount}</div>
              <div><strong>Remaining Balance:</strong> ₦{receipt.remaining_balance}</div>
            </div>
          </Card>
        )}
        
        <Card title="Enter Payment Details">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Wallet ID"
              type="number"
              value={formData.wallet_id}
              onChange={(e) => setFormData({...formData, wallet_id: e.target.value})}
              required
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
            <Input
              label="Student PIN"
              type="password"
              maxLength="6"
              value={formData.pin}
              onChange={(e) => setFormData({...formData, pin: e.target.value})}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Payment description"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <Button type="submit" loading={loading}>
              Process Payment
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default ManualEntry;

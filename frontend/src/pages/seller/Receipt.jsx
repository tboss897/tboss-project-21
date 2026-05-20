import { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import api from '../../api/axios';

function Receipt() {
  const [transactionId, setTransactionId] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setReceipt(null);
    setLoading(true);

    try {
      const response = await api.get(`/payments/${transactionId}/`);
      setReceipt(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Receipt not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">View Receipt</h1>
        
        <Card title="Search Receipt">
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <Button type="submit" loading={loading}>
              Search
            </Button>
          </form>
        </Card>
        
        {receipt && (
          <Card title="Receipt Details">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="text-sm text-gray-600">Transaction ID</div>
                <div className="text-lg font-semibold">{receipt.transaction_id}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Student Name</div>
                  <div className="font-medium">{receipt.student_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Matric Number</div>
                  <div className="font-medium">{receipt.student_matric_no}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Seller</div>
                  <div className="font-medium">{receipt.seller_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-medium">
                    {new Date(receipt.transaction_date).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">Amount</div>
                <div className="text-3xl font-bold text-primary-600">
                  ₦{receipt.amount}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">Description</div>
                <div className="font-medium">{receipt.description}</div>
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">Remaining Balance</div>
                <div className="text-xl font-semibold text-green-600">
                  ₦{receipt.remaining_balance}
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => window.print()}>Print Receipt</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default Receipt;

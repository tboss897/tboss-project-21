import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import api from '../../api/axios';

function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // TODO: Get seller transactions from API
      setLoading(false);
    } catch (err) {
      setError('Failed to load transaction history');
      setLoading(false);
    }
  };

  const columns = [
    { key: 'transaction_date', label: 'Date' },
    { key: 'student_name', label: 'Student' },
    { key: 'amount', label: 'Amount' },
    { key: 'type', label: 'Type' },
    { key: 'payment_status', label: 'Status' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <Loading />
        ) : (
          <Card>
            <Table
              columns={columns}
              data={transactions}
              emptyMessage="No transactions found"
            />
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default History;

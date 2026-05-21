import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { RefreshCw, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments/');
      // Handle standard paginated response vs raw list response
      const data = response.data.results ? response.data.results : response.data;
      setTransactions(data);
    } catch (err) {
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (value) => {
    const num = parseFloat(value || 0);
    return '₦' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Calculate today's aggregate sales total
  const getTodayTotal = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return transactions
      .filter(tx => tx.transaction_date?.slice(0, 10) === todayStr && tx.payment_status === 'successful')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
  };

  const columns = [
    { key: 'transaction_id', label: 'ID' },
    { 
      key: 'transaction_date', 
      label: 'Timestamp',
      render: (val) => (
        <span className="text-surface-500 font-semibold text-xs">
          {formatDate(val)}
        </span>
      )
    },
    { 
      key: 'student_name', 
      label: 'Student Account',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-surface-900">{val || `Wallet Owner #${row.wallet_id}`}</p>
          <p className="text-xs text-surface-400 font-semibold">{row.wallet_id ? `Wallet Account ID: ${row.wallet_id}` : 'Manual Charge'}</p>
        </div>
      )
    },
    { 
      key: 'amount', 
      label: 'Sales Revenue',
      render: (val) => (
        <span className="font-bold text-surface-900">
          {formatNaira(val)}
        </span>
      )
    },
    { 
      key: 'payment_status', 
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'successful' ? 'success' : 'danger'}>
          {val ? val.toUpperCase() : 'UNKNOWN'}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Sales Dashboard</h1>
          <p className="page-subtitle">Track, monitor, and export today's store sales activities and transaction history</p>
        </div>
        <button onClick={fetchTransactions} className="btn btn-outline gap-2.5">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Today's Store Sales</p>
              <h3 className="text-2xl font-black text-primary-600 mt-2">{formatNaira(getTodayTotal())}</h3>
            </div>
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total Sales Count</p>
              <h3 className="text-2xl font-bold text-surface-900 mt-2">{transactions.length} sales</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
        </Card>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loading size="lg" text="Loading store transactions history..." />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            data={transactions}
            emptyMessage="No sales transactions processed yet"
          />
        </Card>
      )}
    </div>
  );
}

export default History;

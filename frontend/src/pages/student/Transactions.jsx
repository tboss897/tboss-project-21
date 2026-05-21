import { useState, useEffect, useContext } from 'react';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { RefreshCw, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

function StudentTransactions() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive target student and wallet ID from auth context
  const walletId = user?.wallet_id || user?.student?.wallet_id;

  useEffect(() => {
    if (walletId) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [walletId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/wallets/${walletId}/transactions/`);
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
      key: 'seller_name', 
      label: 'Store / Channel',
      render: (val, row) => (
        <span className="font-semibold text-surface-800">
          {val || (row.type === 'topup' ? 'Secure Credit Topup' : 'POS Checkout')}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
          val === 'payment' ? 'text-primary-600' : 'text-success-600'
        }`}>
          {val}
        </span>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (val, row) => (
        <span className={`font-bold ${row.type === 'topup' ? 'text-success-600' : 'text-surface-900'}`}>
          {row.type === 'topup' ? '+' : '-'}{formatNaira(val)}
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
    { key: 'description', label: 'Reference / Info' },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Transaction Ledgers</h1>
          <p className="page-subtitle font-medium">Verify your direct purchases, canteen bills and instant deposit allowances</p>
        </div>
        {walletId && (
          <button onClick={fetchTransactions} className="btn btn-outline gap-2.5">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Feed</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-[45vh] flex items-center justify-center">
          <Loading size="lg" text="Retrieving transaction activities..." />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            data={transactions}
            emptyMessage="No wallet activities logged yet for this account."
          />
        </Card>
      )}
    </div>
  );
}

export default StudentTransactions;

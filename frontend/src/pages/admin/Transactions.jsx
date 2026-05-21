import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { ShieldAlert, RefreshCw, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/transactions/', { params: filters });
      // Handle standard paginated response vs raw list response
      const data = response.data.results ? response.data.results : response.data;
      setTransactions(data);
    } catch (err) {
      toast.error('Failed to load transaction data');
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
        <span className="text-surface-500 font-medium text-xs">
          {formatDate(val)}
        </span>
      )
    },
    { 
      key: 'student_name', 
      label: 'Student / Account',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-surface-900">{val || 'System Account'}</p>
          <p className="text-xs text-surface-400 font-medium">{row.wallet_id ? `Wallet #${row.wallet_id}` : 'Direct Fund'}</p>
        </div>
      )
    },
    { 
      key: 'seller_name', 
      label: 'Canteen / Vendor',
      render: (val) => (
        <span className="font-semibold text-surface-700">
          {val || 'Direct Top-Up'}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span className={`text-xs font-bold uppercase tracking-wider ${
          val === 'payment' ? 'text-primary-600' : val === 'topup' ? 'text-success-600' : 'text-danger-600'
        }`}>
          {val}
        </span>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount',
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
        <Badge variant={val === 'successful' ? 'success' : val === 'declined' ? 'warning' : 'danger'}>
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
          <h1 className="page-title text-gradient">Transaction Ledger</h1>
          <p className="page-subtitle">Real-time school wallet activity ledger and processing logs</p>
        </div>
        <button onClick={fetchTransactions} className="btn btn-outline gap-2.5">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter panel */}
      <Card title="Advanced Filter Ledger" className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Transaction Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="failed">Failed</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Transaction Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="payment">Purchase Payments</option>
              <option value="topup">Wallet Top-Ups</option>
              <option value="refund">Refunds</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">From Timestamp</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({...filters, date_from: e.target.value})}
              className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">To Timestamp</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({...filters, date_to: e.target.value})}
              className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10"
            />
          </div>
        </div>
      </Card>

      {/* Transactions list */}
      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Loading size="lg" text="Querying global transactions registry..." />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            data={transactions}
            emptyMessage="No school wallet transactions found matching active criteria"
          />
        </Card>
      )}
    </div>
  );
}

export default Transactions;

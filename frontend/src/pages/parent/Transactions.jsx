import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { RefreshCw, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

function ParentTransactions() {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/linked/');
      setStudents(response.data);
      
      // Auto-select from location state if passed
      if (location.state?.student) {
        const studentObj = location.state.student;
        const matched = response.data.find(s => s.student_id === studentObj.student_id);
        if (matched) {
          const wId = matched.wallet_id || matched.student_id;
          setSelectedWalletId(wId.toString());
          fetchTransactions(wId.toString(), response.data);
        }
      } else if (response.data.length > 0) {
        // Default select first child
        const firstId = response.data[0].wallet_id || response.data[0].student_id;
        setSelectedWalletId(firstId.toString());
        fetchTransactions(firstId.toString(), response.data);
      } else {
        setFetching(false);
      }
    } catch (err) {
      toast.error('Failed to load linked children list');
      setFetching(false);
    }
  };

  const fetchTransactions = async (wId = selectedWalletId, studentsList = students) => {
    if (!wId) {
      setTransactions([]);
      return;
    }
    setLoading(true);
    try {
      // Find wallet id
      const child = studentsList.find(s => s.wallet_id === parseInt(wId) || s.student_id === parseInt(wId));
      const targetId = child?.wallet_id || wId;

      const response = await api.get(`/wallets/${targetId}/transactions/`);
      // Handle standard paginated response vs raw list response
      const data = response.data.results ? response.data.results : response.data;
      setTransactions(data);
    } catch (err) {
      toast.error('Failed to load child\'s transaction ledger');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  const handleStudentChange = (wId) => {
    setSelectedWalletId(wId);
    fetchTransactions(wId);
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
      label: 'Vendor / Channel',
      render: (val, row) => (
        <span className="font-semibold text-surface-800">
          {val || (row.type === 'topup' ? 'Secure Credit top-up' : 'Direct payment')}
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
      label: 'Amount Charged',
      render: (val, row) => (
        <span className={`font-bold ${row.type === 'topup' ? 'text-success-600' : 'text-surface-900'}`}>
          {row.type === 'topup' ? '+' : '-'}{formatNaira(val)}
        </span>
      )
    },
    { 
      key: 'payment_status', 
      label: 'Transaction Status',
      render: (val) => (
        <Badge variant={val === 'successful' ? 'success' : 'danger'}>
          {val ? val.toUpperCase() : 'UNKNOWN'}
        </Badge>
      )
    },
  ];

  if (fetching) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loading size="lg" text="Retrieving student transaction logs..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Transaction Ledgers</h1>
          <p className="page-subtitle font-medium">Verify card purchases, receipts, and deposit transactions processed by linked children</p>
        </div>
        {selectedWalletId && (
          <button onClick={() => fetchTransactions()} className="btn btn-outline gap-2.5">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Feed</span>
          </button>
        )}
      </div>

      {students.length > 0 ? (
        <>
          {/* Child select bar */}
          <Card className="p-5">
            <div className="max-w-md">
              <Select
                label="Selected Child Account"
                value={selectedWalletId}
                onChange={(e) => handleStudentChange(e.target.value)}
              >
                {students.map((student) => (
                  <option key={student.student_id} value={student.wallet_id || student.student_id}>
                    {student.full_name} ({student.matric_no})
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          {/* Transactions list */}
          {loading ? (
            <div className="h-[40vh] flex items-center justify-center">
              <Loading size="md" text="Loading transaction records..." />
            </div>
          ) : (
            <Card className="p-0 overflow-hidden">
              <Table
                columns={columns}
                data={transactions}
                emptyMessage="No wallet activity logged yet for this child."
              />
            </Card>
          )}
        </>
      ) : (
        <div className="h-[280px] rounded-3xl border-2 border-dashed border-surface-200 flex flex-col items-center justify-center text-center p-6 bg-white shadow-sm">
          <div className="p-4 rounded-full bg-surface-50 text-surface-400 mb-3">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-surface-700">No linked children found</h3>
          <p className="text-xs text-surface-400 max-w-sm mt-1">Please link a student profile to monitor real-time wallet ledger balances.</p>
        </div>
      )}
    </div>
  );
}

export default ParentTransactions;

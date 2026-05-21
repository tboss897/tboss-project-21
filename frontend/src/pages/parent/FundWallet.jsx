import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import api from '../../api/axios';
import { CreditCard, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

function FundWallet() {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
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
        // Find matched wallet id
        const matched = response.data.find(s => s.student_id === location.state.student.student_id);
        if (matched) {
          setSelectedWalletId(matched.wallet_id || matched.student_id);
        }
      }
    } catch (err) {
      toast.error('Failed to load linked children list');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWalletId) {
      toast.error('Please select a student wallet to credit');
      return;
    }
    if (parseFloat(amount) < 100) {
      toast.error('Minimum top-up amount is ₦100.00');
      return;
    }

    setLoading(true);
    try {
      // Find wallet_id explicitly if not directly set
      let targetWalletId = selectedWalletId;
      const child = students.find(s => s.wallet_id === parseInt(selectedWalletId) || s.student_id === parseInt(selectedWalletId));
      if (child && child.wallet_id) {
        targetWalletId = child.wallet_id;
      }

      await api.post(`/wallets/${targetWalletId}/topup/`, {
        amount: parseFloat(amount),
        description: description || 'Parent wallet credit top-up',
      });

      toast.success('Wallet credited successfully via Paystack secure gateway!');
      setAmount('');
      setDescription('');
      fetchStudents(); // Refresh updated balances
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete wallet credit transaction');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loading size="lg" text="Setting up secure checkout gateway..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Secure E-Wallet Funding</h1>
          <p className="page-subtitle font-medium">Instantly fund linked children e-wallets using secure Paystack checkout</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Configure Secure Transaction Checkout">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="Select Child Account"
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                required
              >
                <option value="">Select a child...</option>
                {students.map((student) => (
                  <option key={student.student_id} value={student.wallet_id || student.student_id}>
                    {student.full_name} ({student.matric_no}) — Bal: ₦{(student.wallet_balance || 0).toLocaleString('en-US')}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Top-Up Amount (₦)"
                  type="number"
                  step="1"
                  min="100"
                  placeholder="Minimum 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                
                <Input
                  label="Billing Description"
                  placeholder="e.g. Weekly allowance topup"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Secure logos indicator */}
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-150 flex items-center gap-3.5 text-xs text-surface-400 font-semibold">
                <ShieldCheck className="w-6 h-6 text-success-600 shrink-0" />
                <div>
                  <h4 className="text-surface-800 font-bold">Paystack Secure PCI-DSS Gateway</h4>
                  <p className="mt-0.5 leading-relaxed text-[11px]">All payment information is encrypted and processed on Paystack secure systems. Card data is never stored locally.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-surface-100">
                <Button type="submit" loading={loading} className="gap-2 justify-center w-full sm:w-auto">
                  <span>Pay Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Dynamic wallet side metrics */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Quick Amount Selectors">
            <div className="grid grid-cols-3 gap-3">
              {[1000, 2000, 5000, 10000, 15000, 20000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-3 py-2.5 text-xs font-bold border border-surface-150 rounded-xl hover:bg-surface-50 hover:border-primary-500 transition-all text-surface-700"
                >
                  ₦{val.toLocaleString()}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Deposit Channels Supported">
            <div className="space-y-4 text-xs font-semibold text-surface-500">
              <div className="flex justify-between items-center bg-surface-50 p-3 rounded-xl border border-surface-100">
                <span>Visa / Mastercard / Verve</span>
                <span className="text-[10px] font-bold text-success-600 tracking-wider">INSTANT</span>
              </div>
              <div className="flex justify-between items-center bg-surface-50 p-3 rounded-xl border border-surface-100">
                <span>Direct Bank Transfer</span>
                <span className="text-[10px] font-bold text-success-600 tracking-wider">INSTANT</span>
              </div>
              <div className="flex justify-between items-center bg-surface-50 p-3 rounded-xl border border-surface-100">
                <span>USSD Checkout codes</span>
                <span className="text-[10px] font-bold text-success-600 tracking-wider">INSTANT</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FundWallet;

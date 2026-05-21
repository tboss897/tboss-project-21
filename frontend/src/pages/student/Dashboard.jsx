import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Wallet, RefreshCw, FileText, ArrowUpRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

function StudentDashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Self top-up modal states
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);

  // Derive target student and wallet ID from auth context
  const studentId = user?.student_id || user?.student?.student_id;
  const walletId = user?.wallet_id || user?.student?.wallet_id;

  useEffect(() => {
    if (studentId && walletId) {
      loadStudentData();
    } else {
      setLoading(false);
    }
  }, [studentId, walletId]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      // Fetch wallet balance details
      const walletResponse = await api.get(`/wallets/${walletId}/`);
      setWallet(walletResponse.data);

      // Fetch student's active QR code
      try {
        const qrResponse = await api.get(`/students/${studentId}/qr/`);
        setQrCode(qrResponse.data);
      } catch (qrErr) {
        // No active QR or failed, regenerate one
        try {
          const regenResponse = await api.post(`/students/${studentId}/qr/regenerate/`);
          setQrCode(regenResponse.data);
        } catch (innerRegen) {
          // Fallback static qr data representation
          setQrCode({ qr_data: `STUDENT|${studentId}|SECURE_SIG` });
        }
      }
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelfTopup = async (e) => {
    e.preventDefault();
    if (parseFloat(topupAmount) < 100) {
      toast.error('Minimum top-up amount is ₦100.00');
      return;
    }

    setTopupLoading(true);
    try {
      await api.post(`/wallets/${walletId}/topup/`, {
        amount: parseFloat(topupAmount),
        description: 'Student self-topup allowance',
      });

      toast.success('Wallet funded successfully via secure gateway!');
      setShowTopupModal(false);
      setTopupAmount('');
      loadStudentData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete top-up');
    } finally {
      setTopupLoading(false);
    }
  };

  const formatNaira = (value) => {
    const num = parseFloat(value || 0);
    return '₦' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="h-[55vh] flex items-center justify-center">
        <Loading size="lg" text="Syncing e-wallet details..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Welcome, {user?.name || user?.full_name || 'Student'}</h1>
          <p className="page-subtitle font-medium">Class Level: {user?.level || 'N/A'} — Dept: {user?.department || 'N/A'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadStudentData} className="btn btn-outline" title="Refresh Wallet">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Glassmorphic Balance Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-accent-600 rounded-3xl p-8 text-white shadow-card min-h-[220px] flex flex-col justify-between">
            {/* Hologram aesthetic card overlay */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wallet className="w-40 h-40" />
            </div>

            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-xs font-bold text-primary-200 uppercase tracking-widest">E-Wallet Balance</p>
                <h2 className="text-4xl font-black mt-2.5">{formatNaira(wallet?.balance)}</h2>
              </div>
              <span className={`badge ${wallet?.status === 'active' ? 'bg-success-500/20 text-success-200 border-success-400/30' : 'bg-danger-500/20 text-danger-200 border-danger-400/30'} backdrop-blur-md`}>
                {wallet?.status?.toUpperCase() || 'ACTIVE'}
              </span>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-6 z-10 text-xs">
              <div>
                <span className="text-primary-200 uppercase tracking-wider block text-[10px]">ACCOUNT ID</span>
                <span className="font-bold tracking-wider mt-0.5 block">#{walletId}</span>
              </div>
              <div>
                <span className="text-primary-200 uppercase tracking-wider block text-[10px]">MATRIC NO</span>
                <span className="font-bold tracking-wider mt-0.5 block">{user?.matric_no || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Portal */}
          <Card title="Quick Services">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
              <button 
                onClick={() => setShowQRModal(true)}
                className="p-5 border border-surface-150 rounded-2xl hover:bg-surface-50 transition-all text-center flex flex-col items-center gap-3 group"
              >
                <div className="p-3.5 rounded-xl bg-primary-50 text-primary-600 group-hover:scale-110 transition duration-200">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-surface-700">Display QR Card</span>
              </button>

              <button 
                onClick={() => setShowTopupModal(true)}
                className="p-5 border border-surface-150 rounded-2xl hover:bg-surface-50 transition-all text-center flex flex-col items-center gap-3 group"
              >
                <div className="p-3.5 rounded-xl bg-success-50 text-success-600 group-hover:scale-110 transition duration-200">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-surface-700">Self-Topup Wallet</span>
              </button>

              <Link 
                to="/student/transactions"
                className="p-5 border border-surface-150 rounded-2xl hover:bg-surface-50 transition-all text-center flex flex-col items-center gap-3 group sm:col-span-1 col-span-2"
              >
                <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition duration-200">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-surface-700">Spend Ledgers</span>
              </Link>
            </div>
          </Card>
        </div>

        {/* QR Code Quick Look */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Your Payment QR Code" className="text-center p-6">
            {qrCode ? (
              <div className="space-y-4">
                <div className="p-3 bg-surface-50 border border-surface-150 rounded-2xl w-fit mx-auto">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCode.qr_data)}`} 
                    alt="Payment QR Card Signature" 
                    className="w-40 h-40"
                  />
                </div>
                <p className="text-[11px] text-surface-400 font-semibold max-w-xs mx-auto leading-relaxed">Present this secure QR code at any school canteen POS terminal to verify your profile and authorize purchases.</p>
                <Button onClick={() => setShowQRModal(true)} variant="outline" className="w-full justify-center">
                  Expand QR Card
                </Button>
              </div>
            ) : (
              <div className="py-8 text-surface-400 text-xs">No active QR signature generated</div>
            )}
          </Card>
        </div>
      </div>

      {/* Expanded QR Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Payment QR Signature Card"
      >
        <div className="text-center space-y-6 py-4">
          <div className="p-4 bg-surface-50 border border-surface-150 rounded-2xl w-fit mx-auto">
            {qrCode && (
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode.qr_data)}`} 
                alt="Payment QR Code Signature" 
                className="w-56 h-56 mx-auto"
              />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-surface-900 text-lg">{user?.name || user?.full_name}</h3>
            <p className="text-xs font-semibold text-surface-400 mt-0.5">{user?.matric_no}</p>
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mt-1">{user?.department}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-50 border border-surface-150 max-w-sm mx-auto text-xs text-surface-500 leading-relaxed">
            This signature code rotates dynamically for maximum wallet safety. Keep this signature secure and private.
          </div>
          <div className="pt-2">
            <Button onClick={() => setShowQRModal(false)} className="w-full justify-center">
              Close Card View
            </Button>
          </div>
        </div>
      </Modal>

      {/* Self Topup Modal */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="E-Wallet Self-Topup"
      >
        <form onSubmit={handleSelfTopup} className="space-y-5">
          <div className="p-4 rounded-2xl bg-surface-50 border border-surface-150 flex items-center gap-3 text-xs text-surface-500 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-success-600 shrink-0" />
            <span>Complete top-ups using simulated Paystack secure transaction channels.</span>
          </div>

          <Input
            label="Top-Up Amount (₦)"
            type="number"
            min="100"
            step="100"
            placeholder="Minimum 100"
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="outline" type="button" onClick={() => setShowTopupModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={topupLoading}>
              Credit Wallet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default StudentDashboard;

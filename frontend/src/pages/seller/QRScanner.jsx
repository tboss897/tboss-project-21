import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../api/axios';
import { QrCode, User, Search, ShieldAlert, ArrowRight, CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

function QRScanner() {
  const [qrData, setQrData] = useState('');
  const [matricNo, setMatricNo] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Payment form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!qrData && !matricNo) {
      toast.error('Scan QR code or enter matric number');
      return;
    }
    setLoading(true);
    setStudent(null);

    try {
      const response = await api.post('/payments/scan/', {
        qr_data: qrData || undefined,
        matric_no: matricNo || undefined,
      });
      setStudent(response.data);
      toast.success(`Student ${response.data.full_name} found!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid QR code or student not found');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid purchase amount');
      return;
    }
    if (!pin || pin.length < 4) {
      toast.error('Please enter the student\'s wallet authorization PIN');
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await api.post('/payments/process/', {
        wallet_id: student.wallet_id || student.wallet?.wallet_id,
        amount: parseFloat(amount),
        pin,
        description: description || 'Meal purchase',
      });
      
      toast.success('Payment authorized successfully!');
      // Navigate to receipt page
      navigate('/seller/receipt', { 
        state: { 
          receipt: response.data,
          studentName: student.full_name,
          matricNo: student.matric_no,
          department: student.department
        } 
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed. Please verify PIN/balance.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleReset = () => {
    setStudent(null);
    setQrData('');
    setMatricNo('');
    setAmount('');
    setDescription('');
    setPin('');
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Point of Sale (POS)</h1>
          <p className="page-subtitle">Verify student QR code cards and process immediate canteen payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification panel */}
        <div className="lg:col-span-1 space-y-6">
          {!student ? (
            <Card title="Student Card Verification">
              <form onSubmit={handleScan} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-primary-600" />
                    <span>Scan QR Card Signature</span>
                  </label>
                  <Input
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    placeholder="Signature or raw data stream"
                  />
                </div>
                
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-surface-200" />
                  <span className="px-3 text-xs font-bold text-surface-400 uppercase tracking-widest">OR</span>
                  <div className="flex-grow border-t border-surface-200" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-accent-500" />
                    <span>Enter Matriculation Number</span>
                  </label>
                  <Input
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    placeholder="e.g. MAT2026-90"
                  />
                </div>

                <Button 
                  type="submit" 
                  loading={loading} 
                  disabled={!qrData && !matricNo}
                  className="w-full justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Account</span>
                </Button>
              </form>
            </Card>
          ) : (
            <Card title="Verified Student Registry">
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-2xl border border-surface-150">
                  <div className="avatar avatar-lg bg-primary-100 text-primary-700 font-extrabold">
                    {student.full_name ? student.full_name[0].toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 leading-tight">{student.full_name}</h3>
                    <p className="text-xs text-surface-400 font-semibold">{student.matric_no}</p>
                    <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider mt-1">{student.department}</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-surface-400 font-bold uppercase tracking-wider">AVAILABLE FLOAT</span>
                    <span className="text-lg font-black text-primary-600">₦{(student.wallet_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-surface-100 pt-3">
                    <span className="text-surface-400 font-bold uppercase tracking-wider">CARD STATUS</span>
                    <span className={`badge ${student.wallet_status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {student.wallet_status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={handleReset} 
                  className="w-full justify-center text-danger-600 hover:bg-danger-50 hover:border-danger-200 mt-2"
                >
                  Clear Account
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Charge Checkout panel */}
        <div className="lg:col-span-2">
          {student ? (
            <Card title="Authorize Purchase Charge">
              <form onSubmit={handleProcessPayment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Purchase Amount (₦)</label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Item Description</label>
                    <Input
                      placeholder="e.g. Lunch & Drinks combo"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-warning-50 border border-warning-200 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-warning-800">Secure Pin Entry Required</h4>
                    <p className="text-[11px] text-warning-700 mt-1">Please turn the screen to the student and let them enter their secure 4-digit e-wallet authorization PIN to complete transaction.</p>
                  </div>
                </div>

                <div className="max-w-xs mx-auto text-center">
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-surface-400" />
                    <span>Enter Student Secure PIN</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-48 text-center px-4 py-3.5 bg-surface-100 border border-surface-200 rounded-2xl text-xl font-mono tracking-[0.6em] focus:outline-none focus:bg-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                    placeholder="••••"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-surface-100">
                  <Button variant="outline" type="button" onClick={handleReset}>
                    Cancel Transaction
                  </Button>
                  <Button type="submit" loading={processingPayment} className="gap-2">
                    <span>Confirm Charge</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="h-[280px] rounded-3xl border-2 border-dashed border-surface-200 flex flex-col items-center justify-center text-center p-6 bg-white shadow-sm">
              <div className="p-4 rounded-full bg-surface-50 text-surface-400 mb-3">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-surface-700">Awaiting Student Identification</h3>
              <p className="text-xs text-surface-400 max-w-sm mt-1">First scan a student e-wallet QR card or query by matriculation number to load active account profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRScanner;

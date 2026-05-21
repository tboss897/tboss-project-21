import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../api/axios';
import { Keyboard, ArrowRight, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

function ManualEntry() {
  const [formData, setFormData] = useState({
    wallet_id: '',
    amount: '',
    pin: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid purchase amount');
      return;
    }
    setLoading(true);

    try {
      const response = await api.post('/payments/process/', {
        wallet_id: parseInt(formData.wallet_id),
        amount: parseFloat(formData.amount),
        pin: formData.pin,
        description: formData.description || 'Manual charge entry',
      });
      
      setReceipt(response.data);
      toast.success('Payment authorized successfully!');
      
      // Navigate to receipt page
      navigate('/seller/receipt', { 
        state: { 
          receipt: response.data,
          studentName: `Wallet Owner #${formData.wallet_id}`,
          matricNo: 'Manual Code Entry',
          department: 'General Store Account'
        } 
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed. Verify credentials / balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Manual Terminal</h1>
          <p className="page-subtitle">Enter payment transactions manually when student QR card is damaged or unscannable</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Enter Wallet Billing Details">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Wallet Account ID"
                  type="number"
                  placeholder="e.g. 1004"
                  value={formData.wallet_id}
                  onChange={(e) => setFormData({...formData, wallet_id: e.target.value})}
                  required
                />
                <Input
                  label="Purchase Amount (₦)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Item Description</label>
                <Input
                  placeholder="e.g. Canteen lunch combo B"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="p-4 rounded-2xl bg-warning-50 border border-warning-200 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-warning-800">Secure Pin Entry Required</h4>
                  <p className="text-[11px] text-warning-700 mt-1">Ask the student to verify the billing amount and type their secure e-wallet authorization PIN in the input field below.</p>
                </div>
              </div>

              <div className="max-w-xs mx-auto text-center">
                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-surface-400" />
                  <span>Student Secure PIN</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={formData.pin}
                  onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                  className="w-48 text-center px-4 py-3.5 bg-surface-100 border border-surface-200 rounded-2xl text-xl font-mono tracking-[0.6em] focus:outline-none focus:bg-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  placeholder="••••"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-surface-100">
                <Button type="submit" loading={loading} className="w-full sm:w-auto gap-2">
                  <span>Charge Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Helpful card info */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Alternative Terminal Code">
            <div className="space-y-4 text-xs text-surface-500">
              <p className="leading-relaxed">Manual terminal entry permits sellers to process purchases using the unique student wallet ID found beneath the QR card.</p>
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-150 font-mono text-[11px] text-surface-600">
                <span className="font-bold block text-surface-400 text-[10px] mb-1">TERMINAL RULE:</span>
                • Verify wallet owner identity verbally.
                <br />• Limit single manual purchases to ₦10,000 maximum.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ManualEntry;

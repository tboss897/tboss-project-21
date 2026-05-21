import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import api from '../../api/axios';
import { ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

function Monitoring() {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  
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
          handleStudentChange(wId.toString(), response.data);
        }
      }
    } catch (err) {
      toast.error('Failed to load linked children list');
    } finally {
      setFetching(false);
    }
  };

  const handleStudentChange = async (wId, studentsList = students) => {
    setSelectedWalletId(wId);
    if (!wId) {
      setDailyLimit('');
      setMonitoringEnabled(false);
      return;
    }

    try {
      // Find wallet id
      const child = studentsList.find(s => s.wallet_id === parseInt(wId) || s.student_id === parseInt(wId));
      const targetId = child?.wallet_id || wId;

      const response = await api.get(`/wallets/${targetId}/`);
      setDailyLimit(response.data.daily_limit || '');
      setMonitoringEnabled(response.data.monitoring_enabled || false);
    } catch (err) {
      toast.error('Failed to load child\'s wallet configurations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWalletId) {
      toast.error('Please select a child to configure');
      return;
    }

    setLoading(true);
    try {
      const child = students.find(s => s.wallet_id === parseInt(selectedWalletId) || s.student_id === parseInt(selectedWalletId));
      const targetId = child?.wallet_id || selectedWalletId;

      await api.put(`/wallets/${targetId}/limit/`, {
        daily_limit: dailyLimit ? parseFloat(dailyLimit) : null,
        monitoring_enabled: monitoringEnabled,
      });

      toast.success('Spending control guardrails saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update spending parameters');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loading size="lg" text="Retrieving spending guardrails..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">E-Wallet Controls</h1>
          <p className="page-subtitle font-medium">Establish micro-controls, spending caps, and transactional alerts for your children</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Spending Limit Configuration">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="Select Linked Child"
                value={selectedWalletId}
                onChange={(e) => handleStudentChange(e.target.value)}
                required
              >
                <option value="">Select a child...</option>
                {students.map((student) => (
                  <option key={student.student_id} value={student.wallet_id || student.student_id}>
                    {student.full_name} ({student.matric_no})
                  </option>
                ))}
              </Select>

              <Input
                label="Daily Purchase Cap (₦)"
                type="number"
                step="1"
                placeholder="Leave empty for unlimited spending"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
              />

              <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-2xl border border-surface-150">
                <input
                  type="checkbox"
                  id="monitoring"
                  checked={monitoringEnabled}
                  onChange={(e) => setMonitoringEnabled(e.target.checked)}
                  className="h-4.5 w-4.5 text-primary-600 focus:ring-accent-500 border-surface-300 rounded-lg cursor-pointer"
                />
                <div>
                  <label htmlFor="monitoring" className="block text-sm font-semibold text-surface-800 cursor-pointer">
                    Enable Real-time Spending Alerts
                  </label>
                  <p className="text-xs text-surface-400">Receive system-generated invoices and instant alerts on every POS terminal transaction.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-surface-100">
                <Button type="submit" loading={loading} className="w-full sm:w-auto">
                  Save Guardrails
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Monitoring instructions */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Guardrails In Action">
            <div className="space-y-4 text-xs font-semibold text-surface-500">
              <div className="flex gap-3">
                <div className="p-2 rounded-xl bg-primary-50 text-primary-600 h-fit">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-surface-700 font-bold mb-1">POS Checkout Enforcement</p>
                  <p className="leading-relaxed">Canteen POS terminals will automatically reject transactions once a child's cumulative daily spending exceeds this designated limit.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-xl bg-success-50 text-success-600 h-fit">
                  {monitoringEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-surface-700 font-bold mb-1">Transactional Dispatcher</p>
                  <p className="leading-relaxed">Enabling spending alerts triggers real-time messaging on payment completion, detailing items purchased and remaining float.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Monitoring;

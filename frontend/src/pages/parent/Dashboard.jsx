import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { Plus, Users, Wallet, CreditCard, ShieldAlert, ChevronRight, UserPlus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

function ParentDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Link child modal states
  const [showModal, setShowModal] = useState(false);
  const [linking, setLinking] = useState(false);
  const [formData, setFormData] = useState({
    matric_no: '',
    wallet_id: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/linked/');
      setStudents(response.data);
    } catch (err) {
      toast.error('Failed to load linked children data');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e) => {
    e.preventDefault();
    setLinking(true);
    try {
      const response = await api.post('/students/link-parent/', formData);
      toast.success(response.data.message || 'Child successfully linked!');
      setShowModal(false);
      setFormData({ matric_no: '', wallet_id: '' });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid matriculation number or wallet ID.');
    } finally {
      setLinking(false);
    }
  };

  // Helper formats
  const formatNaira = (value) => {
    const num = parseFloat(value || 0);
    return '₦' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getTotalBalance = () => {
    return students.reduce((sum, s) => sum + parseFloat(s.wallet_balance || 0), 0);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Parent Portal</h1>
          <p className="page-subtitle font-medium">Monitor children e-wallets, set daily spending caps, and top up instantly</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchStudents} className="btn btn-outline" title="Refresh Data">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Link Child</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-[45vh] flex items-center justify-center">
          <Loading size="lg" text="Retrieving children wallets..." />
        </div>
      ) : (
        <>
          {/* KPI grid cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Linked Children</p>
                  <h3 className="text-2xl font-bold text-surface-900 mt-2">{students.length} students</h3>
                </div>
                <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500" />
            </Card>

            <Card className="relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Aggregate Balance</p>
                  <h3 className="text-2xl font-bold text-success-600 mt-2">{formatNaira(getTotalBalance())}</h3>
                </div>
                <div className="p-3 rounded-xl bg-success-50 text-success-600">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-success-500" />
            </Card>

            <Card className="relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Linked Accounts Status</p>
                  <h3 className="text-xl font-bold text-surface-900 mt-2.5">
                    {students.every(s => s.wallet_status === 'active') && students.length > 0 ? 'All Active' : 'Requires Review'}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-accent-50 text-accent-600">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-500" />
            </Card>
          </div>

          {/* Children List */}
          <Card title="Linked Children Registry">
            {students.length === 0 ? (
              <div className="text-center py-10">
                <div className="p-4 rounded-full bg-surface-50 text-surface-400 w-fit mx-auto mb-3">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-surface-700">No linked children found</h3>
                <p className="text-xs text-surface-400 max-w-sm mx-auto mt-1.5 mb-5">Link your children's profiles using their matric number and wallet ID to monitor their spending and make instant wallet credits.</p>
                <Button onClick={() => setShowModal(true)} className="gap-2 mx-auto">
                  <UserPlus className="w-4 h-4" />
                  <span>Link Child Profile</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {students.map((student) => (
                  <div 
                    key={student.student_id} 
                    className="border border-surface-150 rounded-2xl p-5 hover:bg-surface-50 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md bg-primary-50 text-primary-600 font-bold">
                          {student.full_name ? student.full_name[0].toUpperCase() : 'S'}
                        </div>
                        <div>
                          <h4 className="font-bold text-surface-900 leading-snug">{student.full_name}</h4>
                          <p className="text-xs text-surface-400 font-semibold">{student.matric_no}</p>
                          <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider mt-0.5">{student.department}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-surface-400 font-bold uppercase tracking-wider block mb-1">BALANCE</span>
                        <span className="text-lg font-black text-primary-600">{formatNaira(student.wallet_balance)}</span>
                        <div className="mt-1">
                          <Badge variant={student.wallet_status === 'active' ? 'success' : 'danger'}>
                            {student.wallet_status?.toUpperCase() || 'ACTIVE'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6 border-t border-surface-100 pt-4">
                      <Link 
                        to="/parent/monitoring" 
                        state={{ student }}
                        className="btn btn-outline text-center py-2.5 text-xs font-semibold justify-center hover:bg-surface-100"
                      >
                        Limits
                      </Link>
                      <Link 
                        to="/parent/transactions" 
                        state={{ student }}
                        className="btn btn-outline text-center py-2.5 text-xs font-semibold justify-center hover:bg-surface-100"
                      >
                        Ledger
                      </Link>
                      <Link 
                        to="/parent/fund-wallet" 
                        state={{ student }}
                        className="btn btn-primary text-center py-2.5 text-xs font-semibold justify-center"
                      >
                        Top Up
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Link Child Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Link Child Account"
      >
        <form onSubmit={handleLinkChild} className="space-y-5">
          <div className="p-4 rounded-2xl bg-surface-50 border border-surface-150 text-xs text-surface-500 leading-relaxed">
            Please enter your child's matriculation number and unique e-wallet ID (visible in their student dashboard) to link their card profile securely to your parent session.
          </div>

          <Input
            label="Matriculation Number"
            placeholder="e.g. MAT2026-90"
            value={formData.matric_no}
            onChange={(e) => setFormData({...formData, matric_no: e.target.value})}
            required
          />

          <Input
            label="Unique E-Wallet ID"
            placeholder="e.g. 1004"
            type="number"
            value={formData.wallet_id}
            onChange={(e) => setFormData({...formData, wallet_id: e.target.value})}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={linking}>
              Link Child Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ParentDashboard;

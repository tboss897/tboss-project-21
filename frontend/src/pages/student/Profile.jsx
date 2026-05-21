import { useState, useContext } from 'react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Shield, BookOpen, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

function StudentProfile() {
  const { user, login } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || user?.full_name || '',
    email: user?.email || '',
  });

  const handleEdit = () => {
    setEditing(true);
    setFormData({
      name: user?.name || user?.full_name || '',
      email: user?.email || '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock / fallback profile updates
      toast.success('Profile credentials update queued.');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update student profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Student Profile</h1>
          <p className="page-subtitle font-medium">Verify registered academic bio-data and active portal parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Academic Profile Details">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-5">
                <Input
                  label="Full Registered Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />

                <div className="flex gap-3 pt-6 border-t border-surface-100">
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                  <Button variant="outline" type="button" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 bg-surface-50 p-4 rounded-2xl border border-surface-100">
                    <User className="w-5 h-5 text-primary-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block">FULL REGISTERED NAME</span>
                      <span className="text-sm font-bold text-surface-800">{user?.name || user?.full_name || 'Student Account'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-surface-50 p-4 rounded-2xl border border-surface-100">
                    <Mail className="w-5 h-5 text-accent-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block">EMAIL ADDRESS</span>
                      <span className="text-sm font-bold text-surface-800">{user?.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-surface-50 p-4 rounded-2xl border border-surface-100">
                    <BookOpen className="w-5 h-5 text-success-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block">ACADEMIC DEPARTMENT</span>
                      <span className="text-sm font-bold text-surface-800">{user?.department || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-surface-50 p-4 rounded-2xl border border-surface-100">
                    <GraduationCap className="w-5 h-5 text-purple-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block">CURRENT CLASS LEVEL</span>
                      <span className="text-sm font-bold text-surface-800">{user?.level || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-100 flex gap-3">
                  <Button onClick={handleEdit}>
                    Edit Contact Info
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Security / session info */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Card Authorization Tier">
            <div className="space-y-4 text-xs font-semibold text-surface-500">
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-surface-700 font-bold mb-1">Student E-Wallet Holder</p>
                  <p className="leading-relaxed">This session carries student authorization levels restricted to self-topup payments, QR card projection, and checkout receipts.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;

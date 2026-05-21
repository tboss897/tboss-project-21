import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { Plus, Users, ToggleLeft, ToggleRight, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

function Parents() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await api.get('/admin/users/?role=parent');
      setParents(response.data);
    } catch (err) {
      toast.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/users/', { 
        ...formData, 
        role: 'parent' 
      });
      toast.success('Parent account created successfully!');
      setShowModal(false);
      fetchParents();
      setFormData({
        name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create parent account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user.user_id}/`, { is_active: !user.is_active });
      toast.success('Parent account status updated.');
      fetchParents();
    } catch (err) {
      toast.error('Failed to update account status');
    }
  };

  const columns = [
    { key: 'user_id', label: 'ID' },
    {
      key: 'name',
      label: 'Parent Name / Username',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="avatar avatar-md bg-blue-50 text-blue-600 font-bold">
            {val ? val[0].toUpperCase() : 'P'}
          </div>
          <div>
            <p className="font-semibold text-surface-900">{val}</p>
            <p className="text-xs text-surface-400 font-medium">@{row.username}</p>
          </div>
        </div>
      )
    },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone Number' },
    {
      key: 'status',
      label: 'Account Status',
      render: (val, row) => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'ACTIVE' : 'SUSPENDED'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleActive(row)}
            className={`p-1.5 rounded-lg bg-surface-50 transition ${
              row.is_active 
                ? 'text-surface-500 hover:text-danger-600 hover:bg-danger-50' 
                : 'text-surface-500 hover:text-success-600 hover:bg-success-50'
            }`}
            title={row.is_active ? "Suspend Parent" : "Activate Parent"}
          >
            {row.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Parent Management</h1>
          <p className="page-subtitle">Add, verify and manage parent accounts in the ecosystem</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Register Parent</span>
        </Button>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Loading size="lg" text="Retrieving parent accounts..." />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            data={parents}
            emptyMessage="No parent accounts registered in the school wallet ecosystem"
          />
        </Card>
      )}

      {/* Add Parent Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Register Parent Account"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="e.g. Jane Doe"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Username"
              placeholder="e.g. janedoe"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <Input
              label="Phone Number"
              placeholder="e.g. 08012345678"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. jane@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <Input
            label="Set Login Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Register Parent
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Parents;

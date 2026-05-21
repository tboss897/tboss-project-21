import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { Plus, Store, ToggleLeft, ToggleRight, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    service_type: 'Food',
    password: '',
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await api.get('/admin/users/?role=seller');
      setSellers(response.data);
    } catch (err) {
      toast.error('Failed to load sellers');
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
        role: 'seller' 
      });
      toast.success('Seller store profile created successfully!');
      setShowModal(false);
      fetchSellers();
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        service_type: 'Food',
        password: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create seller');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      // Toggle backend active status
      await api.patch(`/admin/users/${user.user_id}/`, { is_active: !user.is_active });
      toast.success('Seller account updated.');
      fetchSellers();
    } catch (err) {
      toast.error('Failed to update seller account status');
    }
  };

  const columns = [
    { key: 'user_id', label: 'ID' },
    {
      key: 'name',
      label: 'Store / Owner',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="avatar avatar-md bg-purple-50 text-purple-600 font-bold">
            {val ? val[0].toUpperCase() : 'S'}
          </div>
          <div>
            <p className="font-semibold text-surface-900">{val}</p>
            <p className="text-xs text-surface-400 font-medium">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone Number' },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Store Status',
      render: (val, row) => (
        <Badge variant={row.is_active ? (val === 'active' ? 'success' : 'warning') : 'danger'}>
          {row.is_active ? val.toUpperCase() : 'SUSPENDED'}
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
            title={row.is_active ? "Suspend Seller" : "Activate Seller"}
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
          <h1 className="page-title text-gradient">Seller Store Management</h1>
          <p className="page-subtitle">Add, verify and update canteen store owners and system sellers accounts</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Register Store Seller</span>
        </Button>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Loading size="lg" text="Retrieving seller stores..." />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            data={sellers}
            emptyMessage="No store sellers registered in the school wallet ecosystem"
          />
        </Card>
      )}

      {/* Add Seller Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Register Store Seller"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Store / Owner Name"
            placeholder="e.g. Canteen Cafe A"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. cafea@school.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="e.g. +234..."
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
            <Input
              label="Store Location"
              placeholder="e.g. Cafeteria block B"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Service Type"
              value={formData.service_type}
              onChange={(e) => setFormData({...formData, service_type: e.target.value})}
            >
              <option value="Food">Food / Meals</option>
              <option value="Stationery">Stationery / Books</option>
              <option value="Snacks">Snacks / Drinks</option>
              <option value="Uniforms">Uniforms / Outfits</option>
            </Select>
            
            <Input
              label="Set Login Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Register Store
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Sellers;

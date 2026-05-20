import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import api from '../../api/axios';

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    status: 'active',
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await api.get('/admin/users/?role=seller');
      setSellers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load sellers');
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users/', { ...formData, role: 'seller' });
      setShowModal(false);
      fetchSellers();
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        status: 'active',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create seller');
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/suspend/`, { is_active: false });
      fetchSellers();
    } catch (err) {
      setError('Failed to suspend seller');
    }
  };

  const columns = [
    { key: 'user_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Sellers</h1>
          <Button onClick={() => setShowModal(true)}>Add Seller</Button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <Loading />
        ) : (
          <Card>
            <Table
              columns={columns}
              data={sellers}
              emptyMessage="No sellers found"
            />
          </Card>
        )}
        
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Seller"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <div className="flex space-x-3">
              <Button type="submit">Create Seller</Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

export default Sellers;

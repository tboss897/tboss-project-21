import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import api from '../../api/axios';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    matric_no: '',
    department: '',
    level: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/');
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load students');
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students/', formData);
      setShowModal(false);
      fetchStudents();
      setFormData({
        full_name: '',
        matric_no: '',
        department: '',
        level: '',
        email: '',
        phone: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create student');
    }
  };

  const columns = [
    { key: 'student_id', label: 'ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'matric_no', label: 'Matric No' },
    { key: 'department', label: 'Department' },
    { key: 'level', label: 'Level' },
    { key: 'is_active', label: 'Status' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <Button onClick={() => setShowModal(true)}>Add Student</Button>
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
              data={students}
              emptyMessage="No students found"
            />
          </Card>
        )}
        
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Student"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
            <Input
              label="Matric Number"
              value={formData.matric_no}
              onChange={(e) => setFormData({...formData, matric_no: e.target.value})}
              required
            />
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            />
            <Input
              label="Level"
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <div className="flex space-x-3">
              <Button type="submit">Create Student</Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

export default Students;

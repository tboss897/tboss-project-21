import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { Plus, Users, QrCode, ToggleLeft, ToggleRight, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadIDCard } from '../../utils/idCardGenerator';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [selectedStudentForId, setSelectedStudentForId] = useState(null);
  const [idFiles, setIdFiles] = useState({ logo: null, passport: null });
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    matric_no: '',
    department: '',
    level: '',
    email: '',
    pin: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/');
      // Handle standard paginated response vs raw list response
      const data = response.data.results ? response.data.results : response.data;
      setStudents(data);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/students/', formData);
      toast.success('Student registered successfully!');
      setShowModal(false);
      fetchStudents();
      setFormData({
        full_name: '',
        matric_no: '',
        department: '',
        level: '',
        email: '',
        pin: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register student');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (student) => {
    try {
      await api.put(`/students/${student.student_id}/update/`, { is_active: !student.is_active });
      toast.success(`Student status updated successfully.`);
      fetchStudents();
    } catch (err) {
      toast.error('Failed to update student status');
    }
  };

  const regenerateQR = async (studentId) => {
    try {
      const response = await api.post(`/students/${studentId}/qr/regenerate/`);
      toast.success('QR Code successfully regenerated and activated.');
    } catch (err) {
      toast.error('Failed to regenerate QR code');
    }
  };

  const handleDownloadIDClick = (student) => {
    setSelectedStudentForId(student);
    setIdFiles({ logo: null, passport: null });
    setShowIdModal(true);
  };

  const executeDownloadID = async (e) => {
    e.preventDefault();
    if (!selectedStudentForId) return;

    let qrData = '';
    const toastId = toast.loading('Generating ID Card...');
    try {
      try {
        const response = await api.get(`/students/${selectedStudentForId.student_id}/qr/`);
        qrData = response.data.qr_data;
      } catch (err) {
        const response = await api.post(`/students/${selectedStudentForId.student_id}/qr/regenerate/`);
        qrData = response.data.qr_data;
      }
      
      if (qrData) {
        const logoUrl = idFiles.logo ? URL.createObjectURL(idFiles.logo) : null;
        const passportUrl = idFiles.passport ? URL.createObjectURL(idFiles.passport) : null;
        
        await downloadIDCard(selectedStudentForId, qrData, logoUrl, passportUrl);
        toast.success('ID Card generated successfully', { id: toastId });
        setShowIdModal(false);
      }
    } catch (err) {
      toast.error('Failed to generate ID card', { id: toastId });
    }
  };

  const columns = [
    { key: 'student_id', label: 'ID' },
    { 
      key: 'full_name', 
      label: 'Student Detail',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="avatar avatar-md bg-primary-50 text-primary-600 font-bold">
            {val ? val[0].toUpperCase() : 'S'}
          </div>
          <div>
            <p className="font-semibold text-surface-900">{val}</p>
            <p className="text-xs text-surface-400 font-medium">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'matric_no', label: 'Matric No' },
    { key: 'department', label: 'Department / Level', render: (val, row) => `${val} (${row.level})` },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (val) => (
        <Badge variant={val ? 'success' : 'danger'}>
          {val ? 'Active' : 'Suspended'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadIDClick(row)}
            className="p-1.5 rounded-lg bg-surface-50 text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition"
            title="Download ID Card"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => regenerateQR(row.student_id)}
            className="p-1.5 rounded-lg bg-surface-50 text-surface-500 hover:text-accent-600 hover:bg-accent-50 transition"
            title="Regenerate QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleStatus(row)}
            className={`p-1.5 rounded-lg bg-surface-50 transition ${
              row.is_active 
                ? 'text-surface-500 hover:text-danger-600 hover:bg-danger-50' 
                : 'text-surface-500 hover:text-success-600 hover:bg-success-50'
            }`}
            title={row.is_active ? "Suspend Student" : "Activate Student"}
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
          <h1 className="page-title text-gradient">Student Management</h1>
          <p className="page-subtitle">Add, verify, filter and monitor students profiles and QR cards</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Register Student</span>
        </Button>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Loading size="lg" text="Retrieving students registry..." />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            data={students}
            emptyMessage="No registered students found in the database"
          />
        </Card>
      )}

      {/* Register Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Register New Student"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="Enter student's full name"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required
          />
          <Input
            label="Matriculation Number"
            placeholder="e.g. MAT2026-90"
            value={formData.matric_no}
            onChange={(e) => setFormData({...formData, matric_no: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              placeholder="e.g. Computer Science"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            />
            <Input
              label="Level"
              placeholder="e.g. 200 Level"
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
              required
            />
          </div>
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. student@school.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input
            label="4-Digit Wallet PIN"
            type="password"
            placeholder="e.g. 1234"
            maxLength={4}
            value={formData.pin}
            onChange={(e) => setFormData({...formData, pin: e.target.value})}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Register Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* ID Card Generation Modal */}
      <Modal
        isOpen={showIdModal}
        onClose={() => setShowIdModal(false)}
        title="Generate E-Wallet ID Card"
      >
        <form onSubmit={executeDownloadID} className="space-y-5">
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-4">
            <p className="text-sm font-medium text-primary-900">
              Generating card for: <span className="font-bold">{selectedStudentForId?.full_name}</span>
            </p>
            <p className="text-xs text-primary-700 mt-1">
              You can optionally upload a school logo and the student's passport photo. If you skip this, the system will use default avatars and text.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                School Logo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIdFiles({...idFiles, logo: e.target.files[0]})}
                className="w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Student Passport Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIdFiles({...idFiles, passport: e.target.files[0]})}
                className="w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="outline" type="button" onClick={() => setShowIdModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Generate & Download
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Students;

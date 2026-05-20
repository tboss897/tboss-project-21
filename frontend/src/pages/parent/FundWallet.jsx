import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import api from '../../api/axios';

function FundWallet() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // TODO: Get linked students from API
      setFetching(false);
    } catch (err) {
      setError('Failed to load students');
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // TODO: Call wallet topup API
      setSuccess(true);
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fund wallet');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Fund Wallet</h1>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Wallet funded successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <Card title="Fund Student Wallet">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Select Student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student.student_id} value={student.wallet_id}>
                  {student.full_name} - {student.matric_no}
                </option>
              ))}
            </Select>
            
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Optional description"
              />
            </div>
            
            <Button type="submit" loading={loading}>
              Fund Wallet
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default FundWallet;

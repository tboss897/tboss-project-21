import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import api from '../../api/axios';

function Monitoring() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
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

  const handleStudentChange = async (studentId) => {
    setSelectedStudent(studentId);
    // TODO: Load student's current monitoring settings
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // TODO: Call wallet limit API
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update monitoring settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Spending Monitoring</h1>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Monitoring settings updated successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <Card title="Configure Spending Limits">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Select Student"
              value={selectedStudent}
              onChange={(e) => handleStudentChange(e.target.value)}
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
              label="Daily Spending Limit (₦)"
              type="number"
              step="0.01"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              placeholder="Leave empty for no limit"
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="monitoring"
                checked={monitoringEnabled}
                onChange={(e) => setMonitoringEnabled(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="monitoring" className="ml-2 block text-sm text-gray-900">
                Enable spending monitoring
              </label>
            </div>
            
            <Button type="submit" loading={loading}>
              Save Settings
            </Button>
          </form>
        </Card>
        
        <Card title="How Monitoring Works">
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Set a daily spending limit to control how much your child can spend</p>
            <p>• Enable monitoring to receive notifications when spending occurs</p>
            <p>• View transaction history to track spending patterns</p>
            <p>• Adjust limits at any time based on your child's needs</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default Monitoring;

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import api from '../../api/axios';

function ParentDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // TODO: Get linked students from API
      setLoading(false);
    } catch (err) {
      setError('Failed to load student data');
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Linked Students">
            <div className="text-3xl font-bold text-primary-600">
              {students.length}
            </div>
          </Card>
          
          <Card title="Total Wallet Balance">
            <div className="text-3xl font-bold text-green-600">
              ₦0.00
            </div>
          </Card>
          
          <Card title="Today's Spending">
            <div className="text-3xl font-bold text-orange-600">
              ₦0.00
            </div>
          </Card>
        </div>
        
        <Card title="Your Children">
          {students.length === 0 ? (
            <p className="text-gray-500">No students linked to your account</p>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.student_id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{student.full_name}</h3>
                      <p className="text-sm text-gray-600">{student.matric_no}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary-600">
                        ₦{student.wallet_balance}
                      </div>
                      <div className="text-sm text-gray-600">{student.department}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}

export default ParentDashboard;

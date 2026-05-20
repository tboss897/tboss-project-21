import { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../api/axios';

function QRScanner() {
  const [qrData, setQrData] = useState('');
  const [matricNo, setMatricNo] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setStudent(null);
    setLoading(true);

    try {
      const response = await api.post('/payments/scan/', {
        qr_data: qrData,
        matric_no: matricNo,
      });
      setStudent(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to scan QR code or find student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
        
        <Card title="Scan QR Code or Enter Matric Number">
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Data
              </label>
              <Input
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder="Scan QR code or paste data"
              />
            </div>
            
            <div className="text-center text-gray-500">or</div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matric Number
              </label>
              <Input
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
                placeholder="Enter student matric number"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <Button type="submit" loading={loading} disabled={!qrData && !matricNo}>
              Scan
            </Button>
          </form>
        </Card>
        
        {student && (
          <Card title="Student Information">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{student.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Matric Number</label>
                <p className="mt-1 text-sm text-gray-900">{student.matric_no}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <p className="mt-1 text-sm text-gray-900">{student.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <p className="mt-1 text-sm text-gray-900">{student.level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Wallet Balance</label>
                <p className="mt-1 text-2xl font-bold text-primary-600">
                  ₦{student.wallet_balance}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Wallet Status</label>
                <p className="mt-1 text-sm text-gray-900">{student.wallet_status}</p>
              </div>
              <div className="pt-4">
                <Button>Process Payment</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default QRScanner;

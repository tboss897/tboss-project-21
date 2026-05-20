import { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import api from '../../api/axios';

function Reports() {
  const [formData, setFormData] = useState({
    report_type: 'transactions',
    date_from: '',
    date_to: '',
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setReport(null);
    setLoading(true);

    try {
      const response = await api.post('/admin/reports/', formData);
      setReport(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Generate Reports</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <Card title="Report Configuration">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Report Type"
              value={formData.report_type}
              onChange={(e) => setFormData({...formData, report_type: e.target.value})}
            >
              <option value="transactions">Transactions</option>
              <option value="wallets">Wallets</option>
              <option value="students">Students</option>
              <option value="sellers">Sellers</option>
            </Select>
            
            <Input
              label="From Date"
              type="date"
              value={formData.date_from}
              onChange={(e) => setFormData({...formData, date_from: e.target.value})}
            />
            
            <Input
              label="To Date"
              type="date"
              value={formData.date_to}
              onChange={(e) => setFormData({...formData, date_to: e.target.value})}
            />
            
            <Button type="submit" loading={loading}>
              Generate Report
            </Button>
          </form>
        </Card>
        
        {report && (
          <Card title="Report Results">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{report.report_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Records Found</label>
                  <p className="mt-1 text-sm text-gray-900">{report.count}</p>
                </div>
                {report.date_from && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From Date</label>
                    <p className="mt-1 text-sm text-gray-900">{report.date_from}</p>
                  </div>
                )}
                {report.date_to && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To Date</label>
                    <p className="mt-1 text-sm text-gray-900">{report.date_to}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={() => window.print()}>Print Report</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default Reports;

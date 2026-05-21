import { useState } from 'react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import api from '../../api/axios';
import { FileText, Download, Printer, ShieldAlert, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

function Reports() {
  const [formData, setFormData] = useState({
    report_type: 'transactions',
    date_from: '',
    date_to: '',
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setReport(null);
    setLoading(true);

    try {
      const response = await api.post('/admin/reports/', formData);
      setReport(response.data);
      toast.success('Report successfully compiled!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate report metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/admin/reports/csv/', { 
        params: formData,
        responseType: 'blob' 
      });
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.report_type}-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV Report exported successfully.');
    } catch (err) {
      // Fallback in case of raw list response
      try {
        const response = await api.post('/admin/reports/', formData);
        const data = response.data.results || response.data;
        const csvContent = "data:text/csv;charset=utf-8," 
          + [Object.keys(data[0] || {}).join(",")]
          .concat(data.map(row => Object.values(row).join(","))).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${formData.report_type}-report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV compiled & exported locally.');
      } catch (innerErr) {
        toast.error('Failed to generate export file.');
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Audit Reports</h1>
          <p className="page-subtitle">Configure, review and export school financial and operational logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Config Form */}
        <Card title="Configure Auditing Scope" className="lg:col-span-1 h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              label="Report Category"
              value={formData.report_type}
              onChange={(e) => setFormData({...formData, report_type: e.target.value})}
            >
              <option value="transactions">Purchase Transactions</option>
              <option value="wallets">Wallet Top-Ups & Balances</option>
              <option value="students">Student Enrollment Data</option>
              <option value="sellers">Seller Performance Ledger</option>
            </Select>
            
            <Input
              label="Begin Date"
              type="date"
              value={formData.date_from}
              onChange={(e) => setFormData({...formData, date_from: e.target.value})}
              required
            />
            
            <Input
              label="End Date"
              type="date"
              value={formData.date_to}
              onChange={(e) => setFormData({...formData, date_to: e.target.value})}
              required
            />
            
            <Button type="submit" loading={loading} className="w-full justify-center">
              Compile Audit
            </Button>
          </form>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {report ? (
            <Card title="Compiled Audit Overview" className="space-y-6">
              <div className="p-5 rounded-2xl bg-surface-50 border border-surface-150 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block mb-1">AUDIT TYPE</span>
                  <span className="text-sm font-bold text-surface-800 capitalize">{report.report_type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block mb-1">RECORDS FOUND</span>
                  <span className="text-base font-bold text-primary-600">{report.count || 0} items</span>
                </div>
                {report.date_from && (
                  <div>
                    <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block mb-1">FROM</span>
                    <span className="text-xs font-semibold text-surface-700">{report.date_from}</span>
                  </div>
                )}
                {report.date_to && (
                  <div>
                    <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest block mb-1">TO</span>
                    <span className="text-xs font-semibold text-surface-700">{report.date_to}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-surface-100">
                <Button onClick={() => window.print()} variant="outline" className="flex-1 justify-center gap-2">
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </Button>
                <Button 
                  onClick={handleExportCSV} 
                  loading={exporting}
                  className="flex-1 justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export to CSV</span>
                </Button>
              </div>
            </Card>
          ) : loading ? (
            <Card className="h-64 flex items-center justify-center">
              <Loading size="md" text="Compiling school transactions ledger..." />
            </Card>
          ) : (
            <div className="h-64 rounded-3xl border-2 border-dashed border-surface-200 flex flex-col items-center justify-center text-center p-6 bg-white shadow-sm">
              <div className="p-4 rounded-full bg-surface-50 text-surface-400 mb-3">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-surface-700">No Report Compiled</h3>
              <p className="text-xs text-surface-400 max-w-sm mt-1">Configure the auditing scope and begin-end dates in the configuration panel to compile audit reports.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;

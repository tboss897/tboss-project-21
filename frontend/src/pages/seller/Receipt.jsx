import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { CheckCircle2, Printer, Search, ArrowLeft, RefreshCw, Receipt as ReceiptIcon } from 'lucide-react';
import toast from 'react-hot-toast';

function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [transactionId, setTransactionId] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  // Additional detail states
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    // If we have state passed from previous route (QR checkout or manual entry), load it directly!
    if (location.state && location.state.receipt) {
      setReceipt(location.state.receipt);
      setStudentDetails({
        name: location.state.studentName,
        matricNo: location.state.matricNo,
        department: location.state.department
      });
      toast.success('Transaction receipt loaded!');
    }
  }, [location]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!transactionId) return;
    setLoading(true);
    setReceipt(null);
    setStudentDetails(null);

    try {
      const response = await api.get(`/payments/${transactionId}/`);
      setReceipt(response.data);
      toast.success('Receipt loaded!');
    } catch (err) {
      toast.error('Receipt not found');
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (value) => {
    const num = parseFloat(value || 0);
    return '₦' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Transaction Receipt</h1>
          <p className="page-subtitle">Compile, display, audit and print transactional receipts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search panel if no receipt loaded */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Receipt Query">
            <form onSubmit={handleSearch} className="space-y-5">
              <Input
                label="Transaction ID"
                placeholder="Enter Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
              />
              <Button type="submit" loading={loading} className="w-full justify-center gap-2">
                <Search className="w-4 h-4" />
                <span>Locate Receipt</span>
              </Button>
            </form>
          </Card>

          {receipt && (
            <Card title="Quick Options">
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/seller/scan')} 
                  variant="outline" 
                  className="w-full justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Start New Charge</span>
                </Button>
                <Button 
                  onClick={() => window.print()} 
                  className="w-full justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt Copy</span>
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Receipt Display */}
        <div className="lg:col-span-2">
          {receipt ? (
            <div className="bg-white rounded-3xl shadow-card border border-surface-150 p-8 max-w-md mx-auto relative overflow-hidden receipt-print">
              {/* Success decorative elements */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-600 to-accent-500" />
              
              <div className="text-center pb-6 border-b border-dashed border-surface-200">
                <div className="inline-flex p-3 rounded-full bg-success-50 text-success-600 mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-surface-900">Payment Successful</h3>
                <p className="text-xs text-surface-400 font-semibold mt-1">Transaction Ref: {receipt.transaction_id || 'N/A'}</p>
              </div>

              <div className="py-6 space-y-4 border-b border-dashed border-surface-200 text-xs">
                {studentDetails && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-surface-400 font-bold uppercase tracking-wider">STUDENT ACCOUNT</span>
                      <span className="font-bold text-surface-800 text-right">{studentDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400 font-bold uppercase tracking-wider">MATRIC NUMBER</span>
                      <span className="font-semibold text-surface-600">{studentDetails.matricNo}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span className="text-surface-400 font-bold uppercase tracking-wider">SELLER TERMINAL</span>
                  <span className="font-bold text-surface-800">{receipt.seller_name || 'Store Terminal'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-surface-400 font-bold uppercase tracking-wider">DATE / TIMESTAMP</span>
                  <span className="font-semibold text-surface-600">
                    {new Date(receipt.transaction_date || Date.now()).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-surface-400 font-bold uppercase tracking-wider">DESCRIPTION</span>
                  <span className="font-semibold text-surface-600">{receipt.description || 'Meals Purchase'}</span>
                </div>
              </div>

              <div className="py-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">BILLING AMOUNT</span>
                  <span className="text-2xl font-black text-primary-600">{formatNaira(receipt.amount)}</span>
                </div>

                {receipt.remaining_balance !== undefined && (
                  <div className="flex justify-between items-center text-xs border-t border-surface-100 pt-3">
                    <span className="text-surface-400 font-bold uppercase tracking-wider">NEW FLOAT BALANCE</span>
                    <span className="font-bold text-success-600">{formatNaira(receipt.remaining_balance)}</span>
                  </div>
                )}
              </div>

              <div className="text-center text-[10px] text-surface-400 font-semibold pt-4 border-t border-surface-100 uppercase tracking-widest">
                Thank you for using SmartSchool Wallet
              </div>
            </div>
          ) : loading ? (
            <Card className="h-64 flex items-center justify-center">
              <Loading size="md" text="Loading receipt details..." />
            </Card>
          ) : (
            <div className="h-[280px] rounded-3xl border-2 border-dashed border-surface-200 flex flex-col items-center justify-center text-center p-6 bg-white shadow-sm">
              <div className="p-4 rounded-full bg-surface-50 text-surface-400 mb-3">
                <ReceiptIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-surface-700">No Receipt Loaded</h3>
              <p className="text-xs text-surface-400 max-w-sm mt-1">Verify student payment to generate a beautiful printed receipt, or locate manually using standard transaction ID query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Receipt;

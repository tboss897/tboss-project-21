import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

// Public pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentTransactions from './pages/student/Transactions';
import StudentProfile from './pages/student/Profile';

// Seller pages
import QRScanner from './pages/seller/QRScanner';
import ManualEntry from './pages/seller/ManualEntry';
import Receipt from './pages/seller/Receipt';
import History from './pages/seller/History';

// Parent pages
import ParentDashboard from './pages/parent/Dashboard';
import FundWallet from './pages/parent/FundWallet';
import ParentTransactions from './pages/parent/Transactions';
import Monitoring from './pages/parent/Monitoring';
import ParentProfile from './pages/parent/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Sellers from './pages/admin/Sellers';
import AdminTransactions from './pages/admin/Transactions';
import Reports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#fff',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student Protected Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute roles={['student']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="transactions" element={<StudentTransactions />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Seller Protected Routes */}
          <Route 
            path="/seller" 
            element={
              <ProtectedRoute roles={['seller']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="scan" element={<QRScanner />} />
            <Route path="dashboard" element={<Navigate to="scan" replace />} />
            <Route path="manual-entry" element={<ManualEntry />} />
            <Route path="receipt" element={<Receipt />} />
            <Route path="history" element={<History />} />
            <Route index element={<Navigate to="scan" replace />} />
          </Route>

          {/* Parent Protected Routes */}
          <Route 
            path="/parent" 
            element={
              <ProtectedRoute roles={['parent']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="fund-wallet" element={<FundWallet />} />
            <Route path="transactions" element={<ParentTransactions />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="profile" element={<ParentProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="sellers" element={<Sellers />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

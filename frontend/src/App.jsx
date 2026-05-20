import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import StudentDashboard from './pages/student/Dashboard'
import StudentTransactions from './pages/student/Transactions'
import StudentProfile from './pages/student/Profile'
import QRScanner from './pages/seller/QRScanner'
import ManualEntry from './pages/seller/ManualEntry'
import Receipt from './pages/seller/Receipt'
import History from './pages/seller/History'
import ParentDashboard from './pages/parent/Dashboard'
import FundWallet from './pages/parent/FundWallet'
import ParentTransactions from './pages/parent/Transactions'
import Monitoring from './pages/parent/Monitoring'
import ParentProfile from './pages/parent/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import Students from './pages/admin/Students'
import Sellers from './pages/admin/Sellers'
import AdminTransactions from './pages/admin/Transactions'
import Reports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/transactions" element={<StudentTransactions />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/seller/dashboard" element={<QRScanner />} />
          <Route path="/seller/scan" element={<QRScanner />} />
          <Route path="/seller/manual-entry" element={<ManualEntry />} />
          <Route path="/seller/receipt" element={<Receipt />} />
          <Route path="/seller/history" element={<History />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/fund-wallet" element={<FundWallet />} />
          <Route path="/parent/transactions" element={<ParentTransactions />} />
          <Route path="/parent/monitoring" element={<Monitoring />} />
          <Route path="/parent/profile" element={<ParentProfile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/sellers" element={<Sellers />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

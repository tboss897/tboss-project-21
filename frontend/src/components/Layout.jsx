import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  History, 
  FileText, 
  Settings, 
  QrCode, 
  Keyboard, 
  CreditCard, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine navigation menu based on role
  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Students', path: '/admin/students', icon: Users },
          { name: 'Sellers/Stores', path: '/admin/sellers', icon: Store },
          { name: 'All Transactions', path: '/admin/transactions', icon: History },
          { name: 'Reports', path: '/admin/reports', icon: FileText },
          { name: 'Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'seller':
        return [
          { name: 'QR Scan Payment', path: '/seller/scan', icon: QrCode },
          { name: 'Manual Payment Entry', path: '/seller/manual-entry', icon: Keyboard },
          { name: 'Sales History', path: '/seller/history', icon: History },
        ];
      case 'parent':
        return [
          { name: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
          { name: 'Monitoring & Limits', path: '/parent/monitoring', icon: Settings },
          { name: 'Wallet Funding', path: '/parent/fund-wallet', icon: CreditCard },
          { name: 'Linked Transactions', path: '/parent/transactions', icon: History },
          { name: 'My Profile', path: '/parent/profile', icon: UserIcon },
        ];
      case 'student':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Transactions', path: '/student/transactions', icon: History },
          { name: 'My Profile', path: '/student/profile', icon: UserIcon },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface-900 text-white">
      {/* Brand logo */}
      <div className="p-6 border-b border-surface-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center shadow-lg">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wide">SmartSchool</h1>
          <span className="text-[10px] uppercase font-semibold text-accent-400 tracking-widest">Wallet</span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-surface-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile bottom item */}
      <div className="p-4 border-t border-surface-800 bg-surface-950/40">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="avatar avatar-md bg-accent-500/20 text-accent-400 ring-2 ring-accent-500/10">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
            <p className="text-xs text-surface-400 truncate uppercase font-bold tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-surface-400 hover:text-white bg-surface-800 hover:bg-danger-600 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-surface-200">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          <div className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-64 max-w-xs bg-surface-900 animate-slide-in-right h-full z-50">
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg bg-surface-800 text-white hover:bg-surface-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Navigation */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-surface-100 text-surface-700 hover:bg-surface-200 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Portal Access</span>
              <h2 className="text-sm font-semibold text-surface-600 mt-0.5 capitalize">{user?.role} Space</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification system trigger */}
            <div className="relative">
              <button className="p-2 rounded-xl bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-900 transition relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full ring-2 ring-white animate-pulse" />
              </button>
            </div>

            {/* Quick Profile details */}
            <div className="flex items-center gap-3 border-l border-surface-200 pl-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-surface-800">{user?.name}</p>
                <p className="text-[10px] text-surface-400 uppercase font-bold tracking-wider">{user?.email || user?.matric_no}</p>
              </div>
              <div className="avatar avatar-md bg-primary-100 text-primary-700 font-bold ring-2 ring-primary-50">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto animate-slide-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

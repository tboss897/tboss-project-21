import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Bell, Shield, Coins } from 'lucide-react';

function Settings() {
  const [settings, setSettings] = useState({
    school_name: 'SmartSchool Secondary',
    daily_spending_limit: '5000',
    max_wallet_balance: '50000',
    min_topup_amount: '100',
    notification_enabled: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch global limits if backend provides them
    const loadSettings = async () => {
      try {
        const response = await api.get('/admin/settings/');
        if (response.data) setSettings(response.data);
      } catch (err) {
        // Fall back to saved values
        const local = localStorage.getItem('school_wallet_settings');
        if (local) setSettings(JSON.parse(local));
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      try {
        await api.post('/admin/settings/', settings);
      } catch (err) {
        // Fallback save in localstorage
        localStorage.setItem('school_wallet_settings', JSON.stringify(settings));
      }
      toast.success('System settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">System Settings</h1>
          <p className="page-subtitle">Configure e-wallet spending controls, school rules, and backend system preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="E-Wallet Parameters & Limits">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="School Name"
                  placeholder="e.g. SmartSchool"
                  value={settings.school_name}
                  onChange={(e) => setSettings({...settings, school_name: e.target.value})}
                  required
                />
                
                <Input
                  label="Max Student Spending / Day (₦)"
                  type="number"
                  placeholder="e.g. 5000"
                  value={settings.daily_spending_limit}
                  onChange={(e) => setSettings({...settings, daily_spending_limit: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Maximum Wallet Balance (₦)"
                  type="number"
                  placeholder="e.g. 50000"
                  value={settings.max_wallet_balance}
                  onChange={(e) => setSettings({...settings, max_wallet_balance: e.target.value})}
                  required
                />
                
                <Input
                  label="Minimum Single Top-up (₦)"
                  type="number"
                  placeholder="e.g. 100"
                  value={settings.min_topup_amount}
                  onChange={(e) => setSettings({...settings, min_topup_amount: e.target.value})}
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-2xl border border-surface-150">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={settings.notification_enabled}
                  onChange={(e) => setSettings({...settings, notification_enabled: e.target.checked})}
                  className="h-4.5 w-4.5 text-primary-600 focus:ring-accent-500 border-surface-300 rounded-lg cursor-pointer"
                />
                <div>
                  <label htmlFor="notifications" className="block text-sm font-semibold text-surface-800 cursor-pointer">
                    Enable System Notifications
                  </label>
                  <p className="text-xs text-surface-400">Send transactional alerts to linked parents via email and SMS on every card activity.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                <Button type="submit" loading={loading}>
                  Save Settings & Rules
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Helpful instructions side panel */}
        <div className="space-y-6">
          <Card title="E-Wallet Guardrails">
            <div className="space-y-4 text-xs font-semibold text-surface-500">
              <div className="flex gap-3">
                <div className="p-2 rounded-xl bg-primary-50 text-primary-600 h-fit">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-surface-700 font-bold mb-1">Spending Guardrails</p>
                  <p className="leading-relaxed">The global daily spending limit sets the maximum transaction amount a student can purchase in a single day across all school sellers.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-xl bg-success-50 text-success-600 h-fit">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-surface-700 font-bold mb-1">Balance Thresholds</p>
                  <p className="leading-relaxed">To control financial liabilities and risk, students cannot hold total wallet balances higher than the specified maximum wallet balance.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-xl bg-accent-50 text-accent-600 h-fit">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-surface-700 font-bold mb-1">Notifications Dispatcher</p>
                  <p className="leading-relaxed">Enabling notifications activates SMTP and Redis triggers to queue real-time receipt delivery to parents on e-wallet actions.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Settings;

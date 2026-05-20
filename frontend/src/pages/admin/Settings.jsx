import { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

function Settings() {
  const [settings, setSettings] = useState({
    school_name: 'SmartSchool',
    daily_spending_limit: '5000',
    max_wallet_balance: '50000',
    min_topup_amount: '100',
    notification_enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    // TODO: Save settings to API
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Settings saved successfully!
          </div>
        )}
        
        <Card title="General Settings">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="School Name"
              value={settings.school_name}
              onChange={(e) => setSettings({...settings, school_name: e.target.value})}
            />
            
            <Input
              label="Daily Spending Limit (₦)"
              type="number"
              value={settings.daily_spending_limit}
              onChange={(e) => setSettings({...settings, daily_spending_limit: e.target.value})}
            />
            
            <Input
              label="Maximum Wallet Balance (₦)"
              type="number"
              value={settings.max_wallet_balance}
              onChange={(e) => setSettings({...settings, max_wallet_balance: e.target.value})}
            />
            
            <Input
              label="Minimum Top-up Amount (₦)"
              type="number"
              value={settings.min_topup_amount}
              onChange={(e) => setSettings({...settings, min_topup_amount: e.target.value})}
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notification_enabled}
                onChange={(e) => setSettings({...settings, notification_enabled: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                Enable Notifications
              </label>
            </div>
            
            <Button type="submit" loading={loading}>
              Save Settings
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default Settings;

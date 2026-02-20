import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function BrandSettings() {
  const [settings, setSettings] = useState({
    platformName: 'VeeVill Hub',
    platformEmail: 'support@veevillhub.com',
    commissionRate: '10',
    minWithdrawal: '1000',
    currency: 'NGN',
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Platform Configuration
          </h2>
          <div className="space-y-4 max-w-2xl">
            <div>
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="platformEmail">Support Email</Label>
              <Input
                id="platformEmail"
                type="email"
                value={settings.platformEmail}
                onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="minWithdrawal">Minimum Withdrawal Amount</Label>
              <Input
                id="minWithdrawal"
                type="number"
                value={settings.minWithdrawal}
                onChange={(e) => setSettings({ ...settings, minWithdrawal: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="text-white" style={{ backgroundColor: '#BE220E' }}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">System Logs</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="text-green-600">[INFO] System running normally</div>
            <div className="text-blue-600">[INFO] Database connected</div>
            <div className="text-gray-600">[INFO] Last backup: 2 hours ago</div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

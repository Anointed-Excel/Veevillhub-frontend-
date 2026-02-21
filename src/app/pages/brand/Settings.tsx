import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Settings as SettingsIcon, Save, User, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export default function BrandSettings() {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [settings, setSettings] = useState({
    platformName: 'Anointed',
    platformEmail: 'support@anointed.com',
    commissionRate: '10',
    minWithdrawal: '1000',
    currency: 'NGN',
  });

  useEffect(() => {
    setProfileLoading(true);
    api.get<unknown>('/admin/me').then((res) => {
      const d = res.data as Record<string, unknown>;
      setAdminProfile({
        name: (d.full_name as string) || (d.name as string) || 'Admin',
        email: (d.business_email as string) || (d.email as string) || '',
        role: (d.role as string) || 'admin',
      });
    }).catch(() => {}).finally(() => setProfileLoading(false));
  }, []);

  const handleSave = () => {
    toast.info('Platform settings are managed server-side and cannot be updated here yet.');
  };

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        {/* Admin Profile Card */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Admin Profile
          </h2>
          {profileLoading ? (
            <div className="space-y-3 max-w-sm">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            </div>
          ) : adminProfile ? (
            <div className="space-y-3 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#BE220E] text-white flex items-center justify-center text-xl font-bold">
                  {adminProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-lg">{adminProfile.name}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span className="capitalize">{adminProfile.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {adminProfile.email}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Could not load profile.</p>
          )}
        </Card>

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

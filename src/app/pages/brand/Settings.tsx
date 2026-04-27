import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Settings as SettingsIcon, Save, User, Mail, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

interface PlatformSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  commission_rate: number;
  min_withdrawal: number;
  currency: string;
  maintenance_mode: boolean;
}

export default function BrandSettings() {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<PlatformSettings>({
    platform_name: 'VeevillHub',
    support_email: 'support@veevillhub.com',
    support_phone: '',
    commission_rate: 10,
    min_withdrawal: 1000,
    currency: 'NGN',
    maintenance_mode: false,
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

  useEffect(() => {
    setSettingsLoading(true);
    api.get<unknown>('/admin/settings').then((res) => {
      const d = res.data as Record<string, unknown>;
      setSettings({
        platform_name:    (d.platform_name as string)    || 'VeevillHub',
        support_email:    (d.support_email as string)    || '',
        support_phone:    (d.support_phone as string)    || '',
        commission_rate:  Number(d.commission_rate)      || 10,
        min_withdrawal:   Number(d.min_withdrawal)       || 1000,
        currency:         (d.currency as string)         || 'NGN',
        maintenance_mode: !!(d.maintenance_mode),
      });
    }).catch(() => {}).finally(() => setSettingsLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
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
          {settingsLoading ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading settings…
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platform_name}
                    onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={settings.support_phone}
                    onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min={0}
                    max={100}
                    value={settings.commission_rate}
                    onChange={(e) => setSettings({ ...settings, commission_rate: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="minWithdrawal">Minimum Withdrawal (₦)</Label>
                  <Input
                    id="minWithdrawal"
                    type="number"
                    min={0}
                    value={settings.min_withdrawal}
                    onChange={(e) => setSettings({ ...settings, min_withdrawal: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">When enabled, buyers see a maintenance page</p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? 'Saving…' : 'Save Settings'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

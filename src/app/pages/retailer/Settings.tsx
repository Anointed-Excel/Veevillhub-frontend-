import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Store,
  User,
  Bell,
  Lock,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function RetailerSettings() {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+234 801 234 5678',
    businessName: 'Fashion Hub Store',
    address: '123 Market Street, Lagos',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
  });

  // Store settings state
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Fashion Hub Store',
    storeDescription: 'Your one-stop shop for quality fashion items',
    storeUrl: 'fashion-hub-store',
    businessHours: '9:00 AM - 6:00 PM',
    minOrderAmount: '5000',
    shippingFee: '1500',
    freeShippingThreshold: '50000',
    returnPolicy: '7 days return policy',
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    customerMessages: true,
    productAlerts: true,
    paymentNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    lowStockAlerts: true,
    newCustomerAlerts: true,
  });

  // Security settings state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleSaveStore = () => {
    toast.success('Store settings updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated');
  };

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (security.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and store preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="store">
              <Store className="w-4 h-4 mr-2" />
              Store
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  
                  {/* Profile Picture */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-[#BE220E] text-white flex items-center justify-center text-2xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <Button variant="outline" className="gap-2">
                        <Camera className="w-4 h-4" />
                        Change Photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <div className="relative mt-1">
                        <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="businessName"
                          value={profile.businessName}
                          onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">Business Address</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="address"
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profile.state}
                        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Store Tab */}
          <TabsContent value="store" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Store Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="storeName">Store Name</Label>
                      <div className="relative mt-1">
                        <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="storeName"
                          value={storeSettings.storeName}
                          onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="storeDescription">Store Description</Label>
                      <textarea
                        id="storeDescription"
                        value={storeSettings.storeDescription}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE220E]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="storeUrl">Store URL</Label>
                      <div className="relative mt-1">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="storeUrl"
                          value={storeSettings.storeUrl}
                          onChange={(e) => setStoreSettings({ ...storeSettings, storeUrl: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">veevillhub.com/{storeSettings.storeUrl}</p>
                    </div>

                    <div>
                      <Label htmlFor="businessHours">Business Hours</Label>
                      <div className="relative mt-1">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="businessHours"
                          value={storeSettings.businessHours}
                          onChange={(e) => setStoreSettings({ ...storeSettings, businessHours: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="minOrderAmount">Minimum Order Amount (₦)</Label>
                      <Input
                        id="minOrderAmount"
                        type="number"
                        value={storeSettings.minOrderAmount}
                        onChange={(e) => setStoreSettings({ ...storeSettings, minOrderAmount: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="shippingFee">Shipping Fee (₦)</Label>
                      <Input
                        id="shippingFee"
                        type="number"
                        value={storeSettings.shippingFee}
                        onChange={(e) => setStoreSettings({ ...storeSettings, shippingFee: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="freeShipping">Free Shipping Threshold (₦)</Label>
                      <Input
                        id="freeShipping"
                        type="number"
                        value={storeSettings.freeShippingThreshold}
                        onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="returnPolicy">Return Policy</Label>
                      <Input
                        id="returnPolicy"
                        value={storeSettings.returnPolicy}
                        onChange={(e) => setStoreSettings({ ...storeSettings, returnPolicy: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveStore} className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Choose what notifications you want to receive
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium">Order Notifications</p>
                        <p className="text-sm text-gray-500">Get notified about new orders</p>
                      </div>
                      <Switch
                        checked={notifications.orderNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, orderNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium">Customer Messages</p>
                        <p className="text-sm text-gray-500">Receive customer inquiries and messages</p>
                      </div>
                      <Switch
                        checked={notifications.customerMessages}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, customerMessages: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium">Product Alerts</p>
                        <p className="text-sm text-gray-500">Updates about your products</p>
                      </div>
                      <Switch
                        checked={notifications.productAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, productAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium">Payment Notifications</p>
                        <p className="text-sm text-gray-500">Get notified about payments and withdrawals</p>
                      </div>
                      <Switch
                        checked={notifications.paymentNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, paymentNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-500">Promotional content and updates</p>
                      </div>
                      <Switch
                        checked={notifications.marketingEmails}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, marketingEmails: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-gray-500">Get weekly business performance reports</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, weeklyReports: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium">Low Stock Alerts</p>
                        <p className="text-sm text-gray-500">Alerts when products are running low</p>
                      </div>
                      <Switch
                        checked={notifications.lowStockAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, lowStockAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium">New Customer Alerts</p>
                        <p className="text-sm text-gray-500">Get notified about new customers</p>
                      </div>
                      <Switch
                        checked={notifications.newCustomerAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, newCustomerAlerts: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={security.currentPassword}
                          onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={security.newPassword}
                          onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button onClick={handleChangePassword} className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Security Preferences</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#BE220E]" />
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Switch
                        checked={security.twoFactorAuth}
                        onCheckedChange={(checked) =>
                          setSecurity({ ...security, twoFactorAuth: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-[#BE220E]" />
                        <div>
                          <p className="font-medium">Login Alerts</p>
                          <p className="text-sm text-gray-500">Get notified of new logins</p>
                        </div>
                      </div>
                      <Switch
                        checked={security.loginAlerts}
                        onCheckedChange={(checked) =>
                          setSecurity({ ...security, loginAlerts: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

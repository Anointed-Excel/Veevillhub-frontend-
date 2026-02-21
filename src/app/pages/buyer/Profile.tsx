import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft, User, MapPin, Phone, Mail, Lock, Bell, Eye, EyeOff,
  LogOut, Package, Heart, Home, Shield, Plus, Loader2, CheckCircle,
} from 'lucide-react';

interface Address {
  id: string;
  full_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  is_default: boolean;
}

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
}

export default function BuyerProfile() {
  const { user, logout } = useAuth();
  const { wishlistCount } = useCart();
  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [states, setStates] = useState<string[]>([]);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    verified: false,
  });

  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, totalSpent: 0 });
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    state: '',
    zipcode: '',
  });

  const [security, setSecurity] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
    twoFactorAuth: false, loginAlerts: true,
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true, promotions: false, newsletter: false, sms: true,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Load profile from GET /users/me
  useEffect(() => {
    setProfileLoading(true);
    api.get<unknown>('/users/me').then((res) => {
      const d = res.data as Record<string, unknown>;
      setProfile({
        name: (d.full_name as string) || user?.name || '',
        email: (d.email as string) || user?.email || '',
        phone: (d.phone_number as string) || '',
        verified: !!(d.is_verified),
      });
    }).catch(() => {
      // fall back to auth context data
    }).finally(() => setProfileLoading(false));
  }, []);

  // Load dashboard stats
  useEffect(() => {
    api.get<unknown>('/buyer/dashboard').then((res) => {
      const d = res.data as Record<string, unknown>;
      setStats({
        totalOrders: Number(d.totalOrders) || 0,
        totalSpent: Number(d.totalSpent) || 0,
      });
    }).catch(() => {});
  }, []);

  // Load addresses from GET /checkout/addresses
  useEffect(() => {
    setAddressesLoading(true);
    api.get<unknown>('/checkout/addresses').then((res) => {
      const d = res.data as Record<string, unknown>;
      const raw = (d.addresses || []) as Record<string, unknown>[];
      setAddresses(raw.map((a) => ({
        id: a.id as string,
        full_name: a.full_name as string,
        phone_number: a.phone_number as string,
        street_address: a.street_address as string,
        city: a.city as string,
        state: a.state as string,
        zipcode: (a.zipcode as string) || '',
        is_default: !!(a.is_default),
      })));
    }).catch(() => {}).finally(() => setAddressesLoading(false));
  }, []);

  // Load Nigerian states for address form
  useEffect(() => {
    api.get<unknown>('/checkout/states').then((res) => {
      const d = res.data as Record<string, unknown>;
      const raw = (d.states || []) as Record<string, unknown>[];
      setStates(raw.map((s) => (s.name as string) || (s as unknown as string)));
    }).catch(() => {});
  }, []);

  const handleSaveProfile = () => {
    toast.info('Profile update is not available yet — contact support to update your details.');
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
    toast.info('Password change is not available yet — contact support.');
  };

  const handleAddAddress = async () => {
    if (!newAddress.full_name || !newAddress.phone_number || !newAddress.street_address || !newAddress.city || !newAddress.state) {
      toast.error('Please fill in all required fields');
      return;
    }
    setAddingAddress(true);
    try {
      const res = await api.post<unknown>('/checkout/address', newAddress);
      const d = res.data as Record<string, unknown>;
      const addr = (d.address || d) as Record<string, unknown>;
      setAddresses((prev) => [...prev, {
        id: addr.id as string,
        full_name: addr.full_name as string,
        phone_number: addr.phone_number as string,
        street_address: addr.street_address as string,
        city: addr.city as string,
        state: addr.state as string,
        zipcode: (addr.zipcode as string) || '',
        is_default: !!(addr.is_default),
      }]);
      setNewAddress({ full_name: '', phone_number: '', street_address: '', city: '', state: '', zipcode: '' });
      setShowAddAddress(false);
      toast.success('Address added successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add address');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Link to="/buyer" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#BE220E] rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Profile & Settings</h1>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          {profileLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#BE220E] text-white flex items-center justify-center text-3xl font-bold">
                {profile.name.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  {profile.verified && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
                <p className="text-gray-600">{profile.email}</p>
                {profile.phone && <p className="text-sm text-gray-500">{profile.phone}</p>}
              </div>
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Link to="/buyer/orders">
            <Card className="p-4 hover:shadow-lg transition cursor-pointer">
              <Package className="w-8 h-8 text-[#BE220E] mb-2" />
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-sm text-gray-600">Orders</p>
            </Card>
          </Link>
          <Link to="/buyer/wishlist">
            <Card className="p-4 hover:shadow-lg transition cursor-pointer">
              <Heart className="w-8 h-8 text-[#BE220E] mb-2" />
              <p className="text-2xl font-bold">{wishlistCount}</p>
              <p className="text-sm text-gray-600">Wishlist</p>
            </Card>
          </Link>
          <Card className="p-4">
            <MapPin className="w-8 h-8 text-[#BE220E] mb-2" />
            <p className="text-2xl font-bold">{addresses.length}</p>
            <p className="text-sm text-gray-600">Addresses</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="addresses"><MapPin className="w-4 h-4 mr-2" />Addresses</TabsTrigger>
            <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Alerts</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Personal Information</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="email" type="email" value={profile.email} readOnly className="pl-10 bg-gray-50" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="pl-10" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Profile updates are currently read-only. Contact support to change your details.</p>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#BE220E] hover:bg-[#9a1b0b]" disabled>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Saved Addresses</h3>
                <Button size="sm" className="bg-[#BE220E] hover:bg-[#9a1b0b]" onClick={() => setShowAddAddress(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Address
                </Button>
              </div>

              {addressesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No saved addresses yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <Card key={address.id} className={`p-4 border-2 ${address.is_default ? 'border-[#BE220E]' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{address.full_name}</span>
                            {address.is_default && (
                              <span className="px-2 py-0.5 bg-[#BE220E] text-white text-xs rounded">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.phone_number}</p>
                          <p className="text-sm text-gray-600">{address.street_address}</p>
                          <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipcode}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Change Password</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                      className="pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      className="pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">Password change via this form is not yet available. Contact support.</p>
                <Button type="submit" className="bg-[#BE220E] hover:bg-[#9a1b0b]" disabled>Change Password</Button>
              </form>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Security Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#BE220E]" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Switch checked={security.twoFactorAuth} onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#BE220E]" />
                    <div>
                      <p className="font-medium">Login Alerts</p>
                      <p className="text-sm text-gray-500">Get notified of new logins</p>
                    </div>
                  </div>
                  <Switch checked={security.loginAlerts} onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })} />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified about your orders' },
                  { key: 'promotions', label: 'Promotions & Offers', desc: 'Receive special offers and discounts' },
                  { key: 'newsletter', label: 'Newsletter', desc: 'Weekly newsletter with curated products' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout */}
        <Card className="p-6 mt-6">
          <Button onClick={handleLogout} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Card>
      </div>

      {/* Add Address Modal */}
      <Dialog open={showAddAddress} onOpenChange={setShowAddAddress}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name *</Label>
              <Input value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} placeholder="John Doe" className="mt-1" />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input value={newAddress.phone_number} onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })} placeholder="+234 800 000 0000" className="mt-1" />
            </div>
            <div>
              <Label>Street Address *</Label>
              <Input value={newAddress.street_address} onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })} placeholder="123 Main Street" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City *</Label>
                <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="Lagos" className="mt-1" />
              </div>
              <div>
                <Label>Zipcode</Label>
                <Input value={newAddress.zipcode} onChange={(e) => setNewAddress({ ...newAddress, zipcode: e.target.value })} placeholder="100001" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>State *</Label>
              {states.length > 0 ? (
                <Select value={newAddress.state} onValueChange={(v) => setNewAddress({ ...newAddress, state: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} placeholder="Lagos" className="mt-1" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAddress(false)}>Cancel</Button>
            <Button onClick={handleAddAddress} disabled={addingAddress} className="text-white" style={{ backgroundColor: '#BE220E' }}>
              {addingAddress ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around">
          <Link to="/buyer" className="flex flex-col items-center gap-1 text-gray-600">
            <Home className="w-5 h-5" /><span className="text-xs">Home</span>
          </Link>
          <Link to="/buyer/orders" className="flex flex-col items-center gap-1 text-gray-600">
            <Package className="w-5 h-5" /><span className="text-xs">Orders</span>
          </Link>
          <Link to="/buyer/wishlist" className="flex flex-col items-center gap-1 text-gray-600">
            <Heart className="w-5 h-5" /><span className="text-xs">Wishlist</span>
          </Link>
          <Link to="/buyer/profile" className="flex flex-col items-center gap-1 text-[#BE220E]">
            <User className="w-5 h-5" /><span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

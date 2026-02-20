import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { User, Building2, Mail, Phone, MapPin, FileText, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ManufacturerProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    companyName: 'Test Manufacturer Co.',
    ownerName: user?.name || 'Test Manufacturer',
    email: user?.email || 'manufacturer@test.com',
    phone: '+234 800 123 4567',
    address: '123 Industrial Area, Lagos, Nigeria',
    cac: 'RC123456',
    tin: 'TIN-98765432',
    description: 'Leading manufacturer of premium textiles and materials',
  });

  const handleSave = () => {
    toast.success('Profile updated successfully');
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <DashboardLayout role="manufacturer">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your business information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 p-6">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#BE220E] text-white flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                {formData.companyName.charAt(0)}
              </div>
              <h2 className="text-xl font-bold mb-1">{formData.companyName}</h2>
              <p className="text-gray-600 mb-4">{formData.email}</p>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {formData.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {formData.address}
                </div>
              </div>
            </div>
          </Card>

          {/* Edit Form */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-bold mb-6">Business Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">
                    <User className="w-4 h-4 inline mr-2" />
                    Owner Name
                  </Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Business Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cac">
                    <FileText className="w-4 h-4 inline mr-2" />
                    CAC Registration Number
                  </Label>
                  <Input
                    id="cac"
                    value={formData.cac}
                    onChange={(e) => handleChange('cac', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tin">
                    <FileText className="w-4 h-4 inline mr-2" />
                    TIN Number
                  </Label>
                  <Input
                    id="tin"
                    value={formData.tin}
                    onChange={(e) => handleChange('tin', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BE220E] focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Document Status */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Verification Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">CAC Certificate</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Verified</span>
              </div>
              <p className="text-sm text-gray-600">Uploaded on Jan 10, 2024</p>
            </div>
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">TIN Document</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Verified</span>
              </div>
              <p className="text-sm text-gray-600">Uploaded on Jan 10, 2024</p>
            </div>
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">NIN Document</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Verified</span>
              </div>
              <p className="text-sm text-gray-600">Uploaded on Jan 10, 2024</p>
            </div>
          </div>
        </Card>

        {/* Account Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Account Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold" style={{ color: '#BE220E' }}>45</div>
              <div className="text-sm text-gray-600 mt-1">Total Products</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">123</div>
              <div className="text-sm text-gray-600 mt-1">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">$8,900</div>
              <div className="text-sm text-gray-600 mt-1">Total Earnings</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-sm text-gray-600 mt-1">Rating</div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

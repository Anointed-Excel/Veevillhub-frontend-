import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Download, Eye, Edit2, Trash2, Ban, CheckCircle, Building2, FileText, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Manufacturer {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  status: 'approved' | 'pending' | 'suspended';
  products: number;
  revenue: string;
  joinedDate: string;
  // Verification details
  cacNumber: string;
  tinNumber: string;
  proofOfAddress: string;
  businessAddress: string;
  registrationDate: string;
  verifiedDate?: string;
}

export default function BrandManufacturers() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([
    { 
      id: '1', 
      companyName: 'Golden Pasta Co.', 
      email: 'contact@goldenpasta.ng', 
      phone: '+234 800 123 4567', 
      status: 'approved', 
      products: 45, 
      revenue: '$45,890', 
      joinedDate: '2024-01-15',
      cacNumber: 'RC-1234567',
      tinNumber: '12345678-0001',
      proofOfAddress: 'utility_bill_jan2024.pdf',
      businessAddress: '45 Industrial Avenue, Ikeja, Lagos',
      registrationDate: '2020-03-15',
      verifiedDate: '2024-01-16'
    },
    { 
      id: '2', 
      companyName: 'Alaro Foods Ltd', 
      email: 'info@alarofoods.ng', 
      phone: '+234 800 234 5678', 
      status: 'approved', 
      products: 32, 
      revenue: '$32,100', 
      joinedDate: '2024-02-20',
      cacNumber: 'RC-2345678',
      tinNumber: '23456789-0001',
      proofOfAddress: 'lease_agreement_2024.pdf',
      businessAddress: '12 Food Processing Zone, Ogun State',
      registrationDate: '2019-08-22',
      verifiedDate: '2024-02-21'
    },
    { 
      id: '3', 
      companyName: 'Lagos Beverages', 
      email: 'sales@lagosbev.ng', 
      phone: '+234 800 345 6789', 
      status: 'pending', 
      products: 0, 
      revenue: '$0', 
      joinedDate: '2024-06-10',
      cacNumber: 'RC-3456789',
      tinNumber: '34567890-0001',
      proofOfAddress: 'utility_bill_june2024.pdf',
      businessAddress: '78 Marina Road, Lagos Island, Lagos',
      registrationDate: '2023-11-10',
    },
    { 
      id: '4', 
      companyName: 'Naija Snacks Inc', 
      email: 'contact@naijasnacks.ng', 
      phone: '+234 800 456 7890', 
      status: 'suspended', 
      products: 18, 
      revenue: '$12,450', 
      joinedDate: '2024-03-05',
      cacNumber: 'RC-4567890',
      tinNumber: '45678901-0001',
      proofOfAddress: 'property_deed_2023.pdf',
      businessAddress: '23 Snack Lane, Abuja',
      registrationDate: '2021-05-18',
      verifiedDate: '2024-03-06'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);

  const filteredManufacturers = manufacturers.filter((mfg) => {
    const matchesSearch = mfg.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mfg.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || mfg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setManufacturers(manufacturers.map((mfg) =>
      mfg.id === id ? { ...mfg, status: 'approved' as const } : mfg
    ));
    toast.success('Manufacturer approved');
  };

  const handleSuspend = (id: string) => {
    if (confirm('Are you sure you want to suspend this manufacturer?')) {
      setManufacturers(manufacturers.map((mfg) =>
        mfg.id === id ? { ...mfg, status: 'suspended' as const } : mfg
      ));
      toast.success('Manufacturer suspended');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this manufacturer?')) {
      setManufacturers(manufacturers.filter((mfg) => mfg.id !== id));
      toast.success('Manufacturer deleted');
    }
  };

  const handleView = (mfg: Manufacturer) => {
    setSelectedManufacturer(mfg);
    setShowViewModal(true);
  };

  const handleExport = () => {
    toast.success('Exporting manufacturers data...');
  };

  const handleVerifyTIN = (manufacturer: Manufacturer) => {
    toast.success(`Verifying TIN Number: ${manufacturer.tinNumber}`, {
      description: 'Document verification in progress...',
      duration: 3000,
    });
    // Simulate verification process
    setTimeout(() => {
      toast.success('TIN Number verified successfully!');
    }, 2000);
  };

  const handleDownloadProofOfAddress = (manufacturer: Manufacturer) => {
    toast.success(`Downloading: ${manufacturer.proofOfAddress}`, {
      description: 'Your download will begin shortly',
      duration: 2000,
    });
    // Simulate download
  };

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manufacturers</h1>
            <p className="text-gray-600 mt-1">Manage manufacturer accounts</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search manufacturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold mt-1">{manufacturers.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {manufacturers.filter((m) => m.status === 'approved').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {manufacturers.filter((m) => m.status === 'pending').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Suspended</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {manufacturers.filter((m) => m.status === 'suspended').length}
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManufacturers.map((mfg) => (
                  <tr key={mfg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#BE220E] text-white flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{mfg.companyName}</div>
                          <div className="text-sm text-gray-500">{mfg.joinedDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{mfg.email}</div>
                      <div className="text-sm text-gray-500">{mfg.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{mfg.products}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">{mfg.revenue}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        mfg.status === 'approved' ? 'bg-green-100 text-green-700' :
                        mfg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {mfg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleView(mfg)} variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        {mfg.status === 'pending' && (
                          <Button onClick={() => handleApprove(mfg.id)} variant="ghost" size="sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        {mfg.status === 'approved' && (
                          <Button onClick={() => handleSuspend(mfg.id)} variant="ghost" size="sm">
                            <Ban className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                        <Button onClick={() => handleDelete(mfg.id)} variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manufacturer Details</DialogTitle>
              <DialogDescription>Complete manufacturer information and verification details</DialogDescription>
            </DialogHeader>
            {selectedManufacturer && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-[#BE220E] text-white flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{selectedManufacturer.companyName}</div>
                    <div className="text-gray-600">{selectedManufacturer.email}</div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedManufacturer.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedManufacturer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedManufacturer.status}
                  </span>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#BE220E]" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium mt-1">{selectedManufacturer.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Business Address</div>
                      <div className="font-medium mt-1">{selectedManufacturer.businessAddress}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Products</div>
                      <div className="font-medium mt-1">{selectedManufacturer.products}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Revenue</div>
                      <div className="font-medium mt-1 text-green-600">{selectedManufacturer.revenue}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Joined Date</div>
                      <div className="font-medium mt-1">{selectedManufacturer.joinedDate}</div>
                    </div>
                    {selectedManufacturer.verifiedDate && (
                      <div>
                        <div className="text-sm text-gray-600">Verified Date</div>
                        <div className="font-medium mt-1">{selectedManufacturer.verifiedDate}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Documents */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#BE220E]" />
                    Verification Documents
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-[#BE220E] transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">CAC Registration Number</div>
                          <div className="text-lg font-bold mt-1 text-[#BE220E]">{selectedManufacturer.cacNumber}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Registered: {selectedManufacturer.registrationDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:border-[#BE220E] transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">TIN Number</div>
                          <div className="text-lg font-bold mt-1 text-[#BE220E]">{selectedManufacturer.tinNumber}</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVerifyTIN(selectedManufacturer)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:border-[#BE220E] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Proof of Address</div>
                            <div className="text-sm text-gray-600 mt-1">{selectedManufacturer.proofOfAddress}</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadProofOfAddress(selectedManufacturer)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Pending Status */}
                {selectedManufacturer.status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">This manufacturer is pending approval. Review all documents before approving.</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          handleApprove(selectedManufacturer.id);
                          setShowViewModal(false);
                        }}
                        className="text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Manufacturer
                      </Button>
                      <Button variant="outline">
                        Request More Info
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
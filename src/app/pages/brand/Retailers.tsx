import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Download, Eye, Trash2, Ban, CheckCircle, Store, Users, FileText, MapPin, Calendar, IdCard } from 'lucide-react';
import { toast } from 'sonner';

interface Retailer {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  nin: string;
  address: string;
  status: 'approved' | 'pending' | 'suspended';
  products: number;
  customers: number;
  orders: number;
  revenue: string;
  joinedDate: string;
  // Verification details
  cacNumber: string;
  tinNumber: string;
  proofOfAddress: string;
  registrationDate: string;
  verifiedDate?: string;
}

export default function BrandRetailers() {
  const [retailers, setRetailers] = useState<Retailer[]>([
    {
      id: '1',
      businessName: 'Lagos Mega Store',
      ownerName: 'Adebayo Okonkwo',
      email: 'contact@lagosmega.ng',
      phone: '+234 800 111 2222',
      nin: '12345678901',
      address: '45 Broad Street, Lagos Island, Lagos',
      status: 'approved',
      products: 234,
      customers: 1234,
      orders: 3456,
      revenue: '$145,890',
      joinedDate: '2024-01-20',
      cacNumber: 'RC-8765432',
      tinNumber: '87654321-0001',
      proofOfAddress: 'property_document_lagos.pdf',
      registrationDate: '2020-06-12',
      verifiedDate: '2024-01-21'
    },
    {
      id: '2',
      businessName: 'Sunny Mart Network',
      ownerName: 'Chioma Eze',
      email: 'info@sunnymart.ng',
      phone: '+234 800 222 3333',
      nin: '98765432109',
      address: '12 Market Road, Kano, Kano State',
      status: 'approved',
      products: 156,
      customers: 892,
      orders: 2134,
      revenue: '$98,450',
      joinedDate: '2024-02-15',
      cacNumber: 'RC-7654321',
      tinNumber: '76543210-0001',
      proofOfAddress: 'utility_bill_kano_feb2024.pdf',
      registrationDate: '2021-01-10',
      verifiedDate: '2024-02-16'
    },
    {
      id: '3',
      businessName: 'Quick Shop Express',
      ownerName: 'Oluwaseun Adeyemi',
      email: 'quick@shopexpress.ng',
      phone: '+234 800 333 4444',
      nin: '45678912345',
      address: '78 Independence Ave, Abuja',
      status: 'pending',
      products: 0,
      customers: 0,
      orders: 0,
      revenue: '$0',
      joinedDate: '2024-06-14',
      cacNumber: 'RC-6543210',
      tinNumber: '65432109-0001',
      proofOfAddress: 'lease_agreement_abuja.pdf',
      registrationDate: '2023-12-05',
    },
    {
      id: '4',
      businessName: 'Fresh Market Hub',
      ownerName: 'Ibrahim Mohammed',
      email: 'fresh@markethub.ng',
      phone: '+234 800 444 5555',
      nin: '78945612378',
      address: '23 New Market, Port Harcourt',
      status: 'suspended',
      products: 89,
      customers: 456,
      orders: 678,
      revenue: '$34,230',
      joinedDate: '2024-03-10',
      cacNumber: 'RC-5432109',
      tinNumber: '54321098-0001',
      proofOfAddress: 'utility_bill_portharcourt.pdf',
      registrationDate: '2022-05-18',
      verifiedDate: '2024-03-11'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);

  const filteredRetailers = retailers.filter((retailer) => {
    const matchesSearch = retailer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         retailer.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         retailer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || retailer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setRetailers(retailers.map((r) =>
      r.id === id ? { ...r, status: 'approved' as const } : r
    ));
    toast.success('Retailer approved successfully');
  };

  const handleSuspend = (id: string) => {
    if (confirm('Are you sure you want to suspend this retailer?')) {
      setRetailers(retailers.map((r) =>
        r.id === id ? { ...r, status: 'suspended' as const } : r
      ));
      toast.success('Retailer suspended');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this retailer? This will remove all their data.')) {
      setRetailers(retailers.filter((r) => r.id !== id));
      toast.success('Retailer deleted successfully');
    }
  };

  const handleView = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setShowViewModal(true);
  };

  const handleExport = () => {
    toast.success('Exporting retailers data...');
  };

  const handleVerifyNIN = (retailer: Retailer) => {
    toast.success(`Verifying NIN: ${retailer.nin}`, {
      description: 'Document verification in progress...',
      duration: 3000,
    });
    // Simulate verification process
    setTimeout(() => {
      toast.success('NIN verified successfully!');
    }, 2000);
  };

  const handleVerifyTIN = (retailer: Retailer) => {
    toast.success(`Verifying TIN Number: ${retailer.tinNumber}`, {
      description: 'Document verification in progress...',
      duration: 3000,
    });
    // Simulate verification process
    setTimeout(() => {
      toast.success('TIN Number verified successfully!');
    }, 2000);
  };

  const handleDownloadProofOfAddress = (retailer: Retailer) => {
    toast.success(`Downloading: ${retailer.proofOfAddress}`, {
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
            <h1 className="text-3xl font-bold">Retailers</h1>
            <p className="text-gray-600 mt-1">Manage retailer accounts and permissions</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search retailers..."
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
            <div className="text-sm text-gray-600">Total Retailers</div>
            <div className="text-2xl font-bold mt-1">{retailers.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {retailers.filter((r) => r.status === 'approved').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {retailers.filter((r) => r.status === 'pending').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Suspended</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {retailers.filter((r) => r.status === 'suspended').length}
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRetailers.map((retailer) => (
                  <tr key={retailer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Store className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{retailer.businessName}</div>
                          <div className="text-sm text-gray-500">{retailer.ownerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{retailer.email}</div>
                      <div className="text-sm text-gray-500">{retailer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{retailer.products} products</div>
                        <div className="text-gray-500">{retailer.orders} orders</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">{retailer.revenue}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        retailer.status === 'approved' ? 'bg-green-100 text-green-700' :
                        retailer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {retailer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleView(retailer)} variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        {retailer.status === 'pending' && (
                          <Button onClick={() => handleApprove(retailer.id)} variant="ghost" size="sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        {retailer.status === 'approved' && (
                          <Button onClick={() => handleSuspend(retailer.id)} variant="ghost" size="sm">
                            <Ban className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                        <Button onClick={() => handleDelete(retailer.id)} variant="ghost" size="sm">
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
              <DialogTitle>Retailer Details</DialogTitle>
              <DialogDescription>Complete retailer information and verification details</DialogDescription>
            </DialogHeader>
            {selectedRetailer && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <Store className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{selectedRetailer.businessName}</div>
                    <div className="text-gray-600">{selectedRetailer.ownerName}</div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedRetailer.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedRetailer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedRetailer.status}
                  </span>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-purple-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium mt-1">{selectedRetailer.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium mt-1">{selectedRetailer.phone}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-600">Business Address</div>
                      <div className="font-medium mt-1">{selectedRetailer.address}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Joined Date</div>
                      <div className="font-medium mt-1">{selectedRetailer.joinedDate}</div>
                    </div>
                    {selectedRetailer.verifiedDate && (
                      <div>
                        <div className="text-sm text-gray-600">Verified Date</div>
                        <div className="font-medium mt-1">{selectedRetailer.verifiedDate}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Documents */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Verification Documents
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IdCard className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">National Identification Number</div>
                            <div className="text-lg font-bold mt-1 text-purple-600">{selectedRetailer.nin}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleVerifyNIN(selectedRetailer)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">CAC Registration Number</div>
                          <div className="text-lg font-bold mt-1 text-purple-600">{selectedRetailer.cacNumber}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Registered: {selectedRetailer.registrationDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">TIN Number</div>
                          <div className="text-lg font-bold mt-1 text-purple-600">{selectedRetailer.tinNumber}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleVerifyTIN(selectedRetailer)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Proof of Address</div>
                            <div className="text-sm text-gray-600 mt-1">{selectedRetailer.proofOfAddress}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadProofOfAddress(selectedRetailer)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border-purple-100">
                      <div className="text-sm text-gray-600">Products</div>
                      <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>
                        {selectedRetailer.products}
                      </div>
                    </Card>
                    <Card className="p-4 border-purple-100">
                      <div className="text-sm text-gray-600">Customers</div>
                      <div className="text-2xl font-bold mt-1 text-blue-600">
                        {selectedRetailer.customers}
                      </div>
                    </Card>
                    <Card className="p-4 border-purple-100">
                      <div className="text-sm text-gray-600">Total Orders</div>
                      <div className="text-2xl font-bold mt-1 text-purple-600">
                        {selectedRetailer.orders}
                      </div>
                    </Card>
                    <Card className="p-4 border-purple-100">
                      <div className="text-sm text-gray-600">Total Revenue</div>
                      <div className="text-2xl font-bold mt-1 text-green-600">
                        {selectedRetailer.revenue}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Action Buttons for Pending Status */}
                {selectedRetailer.status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">This retailer is pending approval. Review all documents before approving.</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          handleApprove(selectedRetailer.id);
                          setShowViewModal(false);
                        }}
                        className="text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Retailer
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
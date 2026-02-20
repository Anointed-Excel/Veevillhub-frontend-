import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Download, Eye, Trash2, Ban, CheckCircle, ShoppingBag, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  totalOrders: number;
  totalSpent: string;
  lastOrder: string;
  joinedDate: string;
  verified: boolean;
}

export default function BrandBuyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+234 800 123 4567',
      status: 'active',
      totalOrders: 45,
      totalSpent: '$12,450',
      lastOrder: '2 days ago',
      joinedDate: '2024-01-15',
      verified: true,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+234 800 234 5678',
      status: 'active',
      totalOrders: 32,
      totalSpent: '$8,920',
      lastOrder: '1 week ago',
      joinedDate: '2024-02-10',
      verified: true,
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '+234 800 345 6789',
      status: 'active',
      totalOrders: 67,
      totalSpent: '$18,340',
      lastOrder: '1 day ago',
      joinedDate: '2023-12-05',
      verified: true,
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      phone: '+234 800 456 7890',
      status: 'suspended',
      totalOrders: 12,
      totalSpent: '$2,340',
      lastOrder: '2 months ago',
      joinedDate: '2024-03-20',
      verified: false,
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david@example.com',
      phone: '+234 800 567 8901',
      status: 'active',
      totalOrders: 89,
      totalSpent: '$23,780',
      lastOrder: '3 hours ago',
      joinedDate: '2023-11-12',
      verified: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  const filteredBuyers = buyers.filter((buyer) => {
    const matchesSearch = buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         buyer.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || buyer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSuspend = (id: string) => {
    if (confirm('Are you sure you want to suspend this buyer account?')) {
      setBuyers(buyers.map((b) =>
        b.id === id ? { ...b, status: 'suspended' as const } : b
      ));
      toast.success('Buyer account suspended');
    }
  };

  const handleActivate = (id: string) => {
    setBuyers(buyers.map((b) =>
      b.id === id ? { ...b, status: 'active' as const } : b
    ));
    toast.success('Buyer account activated');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this buyer? All their data will be permanently removed.')) {
      setBuyers(buyers.filter((b) => b.id !== id));
      toast.success('Buyer account deleted');
    }
  };

  const handleView = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setShowViewModal(true);
  };

  const handleExport = () => {
    toast.success('Exporting buyers data...');
  };

  const totalBuyers = buyers.length;
  const activeBuyers = buyers.filter((b) => b.status === 'active').length;
  const verifiedBuyers = buyers.filter((b) => b.verified).length;
  const totalRevenue = buyers.reduce((sum, b) => sum + parseFloat(b.totalSpent.replace(/[$,]/g, '')), 0);

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Buyers</h1>
            <p className="text-gray-600 mt-1">Manage customer accounts and activity</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Buyers</div>
            <div className="text-2xl font-bold mt-1">{totalBuyers}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active Buyers</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{activeBuyers}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Verified</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{verifiedBuyers}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>
              ${totalRevenue.toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search buyers by name, email, or phone..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-medium">
                          {buyer.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium flex items-center gap-2">
                            {buyer.name}
                            {buyer.verified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">Joined {buyer.joinedDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {buyer.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {buyer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{buyer.totalOrders}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">{buyer.totalSpent}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{buyer.lastOrder}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        buyer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {buyer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleView(buyer)} variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        {buyer.status === 'active' ? (
                          <Button onClick={() => handleSuspend(buyer.id)} variant="ghost" size="sm">
                            <Ban className="w-4 h-4 text-red-600" />
                          </Button>
                        ) : (
                          <Button onClick={() => handleActivate(buyer.id)} variant="ghost" size="sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button onClick={() => handleDelete(buyer.id)} variant="ghost" size="sm">
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buyer Details</DialogTitle>
            </DialogHeader>
            {selectedBuyer && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-bold text-2xl">
                    {selectedBuyer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg flex items-center gap-2">
                      {selectedBuyer.name}
                      {selectedBuyer.verified && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="text-gray-600">{selectedBuyer.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Phone Number</div>
                    <div className="font-medium mt-1">{selectedBuyer.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Account Status</div>
                    <div className="font-medium mt-1 capitalize">{selectedBuyer.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="font-bold mt-1 text-2xl text-blue-600">
                      {selectedBuyer.totalOrders}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                    <div className="font-bold mt-1 text-2xl text-green-600">
                      {selectedBuyer.totalSpent}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Order</div>
                    <div className="font-medium mt-1">{selectedBuyer.lastOrder}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Joined Date</div>
                    <div className="font-medium mt-1">{selectedBuyer.joinedDate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Verified</div>
                    <div className="font-medium mt-1">
                      {selectedBuyer.verified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg. Order Value</div>
                    <div className="font-medium mt-1">
                      ${(parseFloat(selectedBuyer.totalSpent.replace(/[$,]/g, '')) / selectedBuyer.totalOrders).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">Quick Actions</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Orders</Button>
                    <Button size="sm" variant="outline">Send Email</Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
              {selectedBuyer && selectedBuyer.status === 'suspended' && (
                <Button
                  onClick={() => {
                    handleActivate(selectedBuyer.id);
                    setShowViewModal(false);
                  }}
                  className="text-white"
                  style={{ backgroundColor: '#BE220E' }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate Account
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

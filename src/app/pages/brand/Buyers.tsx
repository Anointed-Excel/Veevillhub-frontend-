import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Download, Eye, Trash2, Ban, CheckCircle, ShoppingBag, Mail, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

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

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface BuyerAddress {
  id: string;
  full_name: string;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
}

interface BuyerDetail extends Buyer {
  recentOrders: RecentOrder[];
  addresses: BuyerAddress[];
}

export default function BrandBuyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBuyers = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ buyers: Record<string, unknown>[] }>('/admin/buyers');
      const rawBuyers = (res.data as unknown as { buyers: Record<string, unknown>[] }).buyers || [];
      setBuyers(rawBuyers.map((b) => ({
        id: b.id as string,
        name: (b.full_name as string) || '',
        email: (b.email as string) || '',
        phone: (b.phone_number as string) || '—',
        status: (b.status === 'active' ? 'active' : 'suspended') as Buyer['status'],
        totalOrders: (b.total_orders as number) || 0,
        totalSpent: `₦${((b.total_spent as number) || 0).toLocaleString()}`,
        lastOrder: b.last_order_date ? new Date(b.last_order_date as string).toLocaleDateString() : 'Never',
        joinedDate: b.created_at ? new Date(b.created_at as string).toLocaleDateString() : '—',
        verified: !!(b.is_verified),
      })));
    } catch {
      toast.error('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBuyers(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedBuyerDetail, setSelectedBuyerDetail] = useState<BuyerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const filteredBuyers = buyers.filter((buyer) => {
    const matchesSearch = buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         buyer.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || buyer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSuspend = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this buyer account?')) return;
    try {
      await api.patch(`/admin/buyers/${id}/status`, { status: 'suspended' });
      setBuyers(buyers.map((b) => b.id === id ? { ...b, status: 'suspended' as const } : b));
      toast.success('Buyer account suspended');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to suspend buyer');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.patch(`/admin/buyers/${id}/status`, { status: 'active' });
      setBuyers(buyers.map((b) => b.id === id ? { ...b, status: 'active' as const } : b));
      toast.success('Buyer account activated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to activate buyer');
    }
  };

  const handleDelete = (id: string) => {
    toast.error('Delete is not supported — suspend the account instead');
  };

  const handleView = async (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setSelectedBuyerDetail(null);
    setShowViewModal(true);
    setDetailLoading(true);
    try {
      const res = await api.get<unknown>(`/admin/buyers/${buyer.id}`);
      const d = res.data as Record<string, unknown>;
      setSelectedBuyerDetail({
        ...buyer,
        recentOrders: (d.recentOrders as RecentOrder[]) || [],
        addresses: (d.addresses as BuyerAddress[]) || [],
      });
    } catch {
      // modal still shows basic info from the list
    } finally {
      setDetailLoading(false);
    }
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buyer Details</DialogTitle>
            </DialogHeader>
            {selectedBuyer && (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-bold text-2xl">
                    {selectedBuyer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg flex items-center gap-2">
                      {selectedBuyer.name}
                      {selectedBuyer.verified && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="text-gray-600">{selectedBuyer.email}</div>
                    <div className="text-sm text-gray-500">{selectedBuyer.phone}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedBuyer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedBuyer.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="font-bold text-2xl text-blue-600 mt-1">{selectedBuyer.totalOrders}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                    <div className="font-bold text-2xl text-green-600 mt-1">{selectedBuyer.totalSpent}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Order</div>
                    <div className="font-medium mt-1">{selectedBuyer.lastOrder}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Joined</div>
                    <div className="font-medium mt-1">{selectedBuyer.joinedDate}</div>
                  </div>
                </div>

                {detailLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                )}

                {/* Recent Orders */}
                {selectedBuyerDetail && selectedBuyerDetail.recentOrders.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Recent Orders</div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Order #</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedBuyerDetail.recentOrders.slice(0, 5).map((o) => (
                            <tr key={o.id}>
                              <td className="px-3 py-2 text-sm font-mono">{o.order_number}</td>
                              <td className="px-3 py-2 text-sm capitalize">{o.status.replace('_', ' ')}</td>
                              <td className="px-3 py-2 text-sm font-medium">₦{Number(o.total).toLocaleString()}</td>
                              <td className="px-3 py-2 text-sm text-gray-500">
                                {new Date(o.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Saved Addresses */}
                {selectedBuyerDetail && selectedBuyerDetail.addresses.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Saved Addresses</div>
                    <div className="space-y-2">
                      {selectedBuyerDetail.addresses.map((addr) => (
                        <div key={addr.id} className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
                          <div className="font-medium">{addr.full_name}</div>
                          <div className="text-gray-600">
                            {addr.street_address}, {addr.city}, {addr.state} {addr.zipcode}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
              {selectedBuyer && selectedBuyer.status === 'suspended' && (
                <Button
                  onClick={() => { handleActivate(selectedBuyer.id); setShowViewModal(false); }}
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

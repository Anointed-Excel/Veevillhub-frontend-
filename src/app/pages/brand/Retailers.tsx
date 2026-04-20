import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Download, Eye, Trash2, Ban, CheckCircle, Store, Users, FileText, MapPin, Calendar, IdCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';

interface BusinessProfile {
  company_name: string | null;
  owner_name: string | null;
  nin_number: string | null;
  cac_number: string | null;
  tin_number: string | null;
  business_address: string | null;
  proof_of_address_url: string | null;
  registration_date: string | null;
  verified_date: string | null;
}

interface Retailer {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: 'approved' | 'pending' | 'suspended';
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  joinedDate: string;
  isVerified: boolean;
  profile: BusinessProfile | null;
}

const statusFromBackend = (s: string): Retailer['status'] => {
  if (s === 'active') return 'approved';
  if (s === 'inactive') return 'pending';
  return 'suspended';
};
const statusToBackend = (s: string): string => {
  if (s === 'approved') return 'active';
  if (s === 'pending') return 'inactive';
  return 'suspended';
};

export default function BrandRetailers() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRetailers = async () => {
    setLoading(true);
    try {
      const res = await api.get<Record<string, unknown>[]>('/admin/retailers');
      const raw = (res.data as unknown as Record<string, unknown>[]) || [];
      setRetailers(raw.map((r) => {
        const bp = r.business_profile as BusinessProfile | null;
        return {
          id: r.id as string,
          businessName: bp?.company_name || (r.full_name as string) || '',
          ownerName: bp?.owner_name || (r.full_name as string) || '',
          email: r.email as string,
          phone: (r.phone_number as string) || '—',
          status: statusFromBackend(r.status as string),
          totalProducts: (r.totalProducts as number) || 0,
          totalOrders: (r.totalOrders as number) || 0,
          totalRevenue: (r.totalRevenue as number) || 0,
          joinedDate: r.created_at ? new Date(r.created_at as string).toLocaleDateString() : '—',
          isVerified: !!(r.is_verified),
          profile: bp || null,
        };
      }));
    } catch {
      toast.error('Failed to load retailers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRetailers(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredRetailers = retailers.filter((r) => {
    const matchesSearch = r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: Retailer['status']) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/retailers/${id}/status`, { status: statusToBackend(newStatus) });
      setRetailers(retailers.map((r) => r.id === id ? { ...r, status: newStatus } : r));
      if (selectedRetailer?.id === id) {
        setSelectedRetailer((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
      toast.success(`Retailer ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    toast.error('Delete is not supported — suspend the account instead');
  };

  const handleView = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setShowViewModal(true);
  };

  const handleExport = () => {
    const rows = retailers.map((r) =>
      `${r.businessName},${r.ownerName},${r.email},${r.phone},${r.status},${r.totalProducts},${r.totalOrders},₦${r.totalRevenue.toLocaleString()},${r.joinedDate}`
    );
    const csv = ['Business,Owner,Email,Phone,Status,Products,Orders,Revenue,Joined', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retailers.csv';
    a.click();
    URL.revokeObjectURL(url);
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
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-full rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-full rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-full rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    </tr>
                  ))
                ) : filteredRetailers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-2">
                      <EmptyState
                        icon={Store}
                        title={searchQuery || filterStatus !== 'all' ? 'No retailers match your filters' : 'No retailers yet'}
                        description={searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or status filter.' : 'Retailers will appear here once they register.'}
                        action={searchQuery || filterStatus !== 'all' ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setFilterStatus('all'); } } : undefined}
                      />
                    </td>
                  </tr>
                ) : filteredRetailers.map((retailer) => (
                    <tr key={retailer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Store className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium flex items-center gap-2">
                              {retailer.businessName}
                              {retailer.isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
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
                          <div>{retailer.totalProducts} products</div>
                          <div className="text-gray-500">{retailer.totalOrders} orders</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">
                          ₦{retailer.totalRevenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          retailer.status === 'approved' ? 'bg-green-100 text-green-700' :
                          retailer.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
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
                            <Button onClick={() => handleStatusChange(retailer.id, 'approved')} variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {retailer.status === 'approved' && (
                            <Button onClick={() => handleStatusChange(retailer.id, 'suspended')} variant="ghost" size="sm">
                              <Ban className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                          {retailer.status === 'suspended' && (
                            <Button onClick={() => handleStatusChange(retailer.id, 'approved')} variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button onClick={handleDelete} variant="ghost" size="sm">
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
                {/* Header */}
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
                    selectedRetailer.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedRetailer.status}
                  </span>
                </div>

                {/* Basic Info */}
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
                      <div className="font-medium mt-1">
                        {selectedRetailer.profile?.business_address || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Joined Date</div>
                      <div className="font-medium mt-1">{selectedRetailer.joinedDate}</div>
                    </div>
                    {selectedRetailer.profile?.verified_date && (
                      <div>
                        <div className="text-sm text-gray-600">Verified Date</div>
                        <div className="font-medium mt-1">
                          {new Date(selectedRetailer.profile.verified_date).toLocaleDateString()}
                        </div>
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
                  {selectedRetailer.profile ? (
                    <div className="space-y-3">
                      {selectedRetailer.profile.nin_number && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <IdCard className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">National Identification Number</div>
                              <div className="text-lg font-bold mt-1 text-purple-600">
                                {selectedRetailer.profile.nin_number}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">CAC Registration Number</div>
                            <div className="text-lg font-bold mt-1 text-purple-600">
                              {selectedRetailer.profile.cac_number || '—'}
                            </div>
                          </div>
                          {selectedRetailer.profile.registration_date && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              Registered: {new Date(selectedRetailer.profile.registration_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">TIN Number</div>
                        <div className="text-lg font-bold mt-1 text-purple-600">
                          {selectedRetailer.profile.tin_number || '—'}
                        </div>
                      </div>

                      {selectedRetailer.profile.proof_of_address_url && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">Proof of Address</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {selectedRetailer.profile.proof_of_address_url}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={selectedRetailer.profile.proof_of_address_url} target="_blank" rel="noreferrer">
                                View
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                      No verification documents submitted yet.
                    </p>
                  )}
                </div>

                {/* Performance */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border-purple-100">
                      <div className="text-sm text-gray-600">Products</div>
                      <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>
                        {selectedRetailer.totalProducts}
                      </div>
                    </Card>
                    <Card className="p-4 border-purple-100">
                      <div className="text-sm text-gray-600">Total Orders</div>
                      <div className="text-2xl font-bold mt-1 text-purple-600">
                        {selectedRetailer.totalOrders}
                      </div>
                    </Card>
                    <Card className="p-4 border-purple-100 col-span-2">
                      <div className="text-sm text-gray-600">Total Revenue</div>
                      <div className="text-2xl font-bold mt-1 text-green-600">
                        ₦{selectedRetailer.totalRevenue.toLocaleString()}
                      </div>
                    </Card>
                  </div>
                </div>

                {selectedRetailer.status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      This retailer is pending approval. Review all documents before approving.
                    </p>
                    <Button
                      disabled={actionLoading}
                      onClick={() => {
                        handleStatusChange(selectedRetailer.id, 'approved');
                        setShowViewModal(false);
                      }}
                      className="text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Retailer
                    </Button>
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

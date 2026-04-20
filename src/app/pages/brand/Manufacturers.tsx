import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Download, Eye, Trash2, Ban, CheckCircle, Building2, FileText, MapPin, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';

interface BusinessProfile {
  company_name: string | null;
  cac_number: string | null;
  tin_number: string | null;
  business_address: string | null;
  proof_of_address_url: string | null;
  registration_date: string | null;
  verified_date: string | null;
}

interface Manufacturer {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  status: 'approved' | 'pending' | 'suspended';
  totalProducts: number;
  joinedDate: string;
  isVerified: boolean;
  profile: BusinessProfile | null;
}

// Map backend status → frontend display
const statusFromBackend = (s: string): Manufacturer['status'] => {
  if (s === 'active') return 'approved';
  if (s === 'inactive') return 'pending';
  return 'suspended';
};
const statusToBackend = (s: string): string => {
  if (s === 'approved') return 'active';
  if (s === 'pending') return 'inactive';
  return 'suspended';
};

export default function BrandManufacturers() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadManufacturers = async () => {
    setLoading(true);
    try {
      const res = await api.get<Record<string, unknown>[]>('/admin/manufacturers');
      const raw = (res.data as unknown as Record<string, unknown>[]) || [];
      setManufacturers(raw.map((m) => {
        const bp = m.business_profile as BusinessProfile | null;
        return {
          id: m.id as string,
          companyName: (bp?.company_name) || (m.full_name as string) || '',
          email: m.email as string,
          phone: (m.phone_number as string) || '—',
          status: statusFromBackend(m.status as string),
          totalProducts: (m.totalProducts as number) || 0,
          joinedDate: m.created_at ? new Date(m.created_at as string).toLocaleDateString() : '—',
          isVerified: !!(m.is_verified),
          profile: bp || null,
        };
      }));
    } catch {
      toast.error('Failed to load manufacturers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadManufacturers(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredManufacturers = manufacturers.filter((mfg) => {
    const matchesSearch = mfg.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mfg.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || mfg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: Manufacturer['status']) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/manufacturers/${id}/status`, { status: statusToBackend(newStatus) });
      setManufacturers(manufacturers.map((m) => m.id === id ? { ...m, status: newStatus } : m));
      if (selectedManufacturer?.id === id) {
        setSelectedManufacturer((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
      toast.success(`Manufacturer ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    toast.error('Delete is not supported — suspend the account instead');
  };

  const handleView = (mfg: Manufacturer) => {
    setSelectedManufacturer(mfg);
    setShowViewModal(true);
  };

  const handleExport = () => {
    const rows = manufacturers.map((m) =>
      `${m.companyName},${m.email},${m.phone},${m.status},${m.totalProducts},${m.joinedDate}`
    );
    const csv = ['Company,Email,Phone,Status,Products,Joined', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manufacturers.csv';
    a.click();
    URL.revokeObjectURL(url);
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
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    </tr>
                  ))
                ) : filteredManufacturers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-2">
                      <EmptyState
                        icon={Building2}
                        title={searchQuery || filterStatus !== 'all' ? 'No manufacturers match your filters' : 'No manufacturers yet'}
                        description={searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or status filter.' : 'Manufacturers will appear here once they register.'}
                        action={searchQuery || filterStatus !== 'all' ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setFilterStatus('all'); } } : undefined}
                      />
                    </td>
                  </tr>
                ) : filteredManufacturers.map((mfg) => (
                    <tr key={mfg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#BE220E] text-white flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium flex items-center gap-2">
                              {mfg.companyName}
                              {mfg.isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="text-sm text-gray-500">{mfg.joinedDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{mfg.email}</div>
                        <div className="text-sm text-gray-500">{mfg.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{mfg.totalProducts}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          mfg.status === 'approved' ? 'bg-green-100 text-green-700' :
                          mfg.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
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
                            <Button onClick={() => handleStatusChange(mfg.id, 'approved')} variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {mfg.status === 'approved' && (
                            <Button onClick={() => handleStatusChange(mfg.id, 'suspended')} variant="ghost" size="sm">
                              <Ban className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                          {mfg.status === 'suspended' && (
                            <Button onClick={() => handleStatusChange(mfg.id, 'approved')} variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
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
                {/* Header */}
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
                    selectedManufacturer.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedManufacturer.status}
                  </span>
                </div>

                {/* Basic Info */}
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
                      <div className="font-medium mt-1">
                        {selectedManufacturer.profile?.business_address || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Products</div>
                      <div className="font-medium mt-1">{selectedManufacturer.totalProducts}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Joined Date</div>
                      <div className="font-medium mt-1">{selectedManufacturer.joinedDate}</div>
                    </div>
                    {selectedManufacturer.profile?.verified_date && (
                      <div>
                        <div className="text-sm text-gray-600">Verified Date</div>
                        <div className="font-medium mt-1">
                          {new Date(selectedManufacturer.profile.verified_date).toLocaleDateString()}
                        </div>
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
                  {selectedManufacturer.profile ? (
                    <div className="space-y-3">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">CAC Registration Number</div>
                            <div className="text-lg font-bold mt-1 text-[#BE220E]">
                              {selectedManufacturer.profile.cac_number || '—'}
                            </div>
                          </div>
                          {selectedManufacturer.profile.registration_date && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              Registered: {new Date(selectedManufacturer.profile.registration_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">TIN Number</div>
                        <div className="text-lg font-bold mt-1 text-[#BE220E]">
                          {selectedManufacturer.profile.tin_number || '—'}
                        </div>
                      </div>

                      {selectedManufacturer.profile.proof_of_address_url && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">Proof of Address</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {selectedManufacturer.profile.proof_of_address_url}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={selectedManufacturer.profile.proof_of_address_url} target="_blank" rel="noreferrer">
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

                {/* Approve banner for pending */}
                {selectedManufacturer.status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      This manufacturer is pending approval. Review all documents before approving.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        disabled={actionLoading}
                        onClick={() => {
                          handleStatusChange(selectedManufacturer.id, 'approved');
                          setShowViewModal(false);
                        }}
                        className="text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Manufacturer
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

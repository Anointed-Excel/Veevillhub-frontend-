import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Tag, Edit2, Trash2, Eye, Calendar, Percent, DollarSign, Package, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';

interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  discount: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  startDate: string;
  endDate: string;
  applicableTo: 'all' | 'categories' | 'products';
  categories?: string[];
  createdDate: string;
}

function normalizePromo(p: Record<string, unknown>): Promotion {
  return {
    id: p.id as string,
    title: (p.title as string) || '',
    description: (p.description as string) || '',
    code: (p.promo_code as string) || '',
    type: 'percentage' as const,
    discount: Number(p.discount_percentage) || 0,
    minPurchase: Number(p.min_purchase) || 0,
    maxDiscount: p.max_discount ? Number(p.max_discount) : undefined,
    usageLimit: Number(p.usage_limit) || 0,
    usedCount: Number(p.used_count) || 0,
    status: (p.status as Promotion['status']) || 'inactive',
    startDate: p.start_date ? String(p.start_date).split('T')[0] : '',
    endDate: p.end_date ? String(p.end_date).split('T')[0] : '',
    applicableTo: (p.applicable_to as Promotion['applicableTo']) || 'all',
    createdDate: p.created_at ? String(p.created_at).split('T')[0] : '',
  };
}

const emptyForm = {
  title: '',
  description: '',
  code: '',
  type: 'percentage' as 'percentage' | 'fixed' | 'shipping',
  discount: '',
  minPurchase: '',
  maxDiscount: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
  applicableTo: 'all' as 'all' | 'categories' | 'products',
  categories: [] as string[],
};

export default function BrandPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const res = await api.get<unknown>('/admin/promotions');
      const raw = ((res.data as Record<string, unknown>).promotions || res.data) as Record<string, unknown>[];
      setPromotions((Array.isArray(raw) ? raw : []).map(normalizePromo));
    } catch {
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPromotions(); }, []);

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch = promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         promo.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || promo.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!formData.title || !formData.code || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.type !== 'shipping' && !formData.discount) {
      toast.error('Please enter a discount value');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/promotions', {
        title: formData.title,
        description: formData.description,
        promo_code: formData.code.toUpperCase(),
        discount_percentage: formData.type === 'percentage' ? parseFloat(formData.discount) : 0,
        min_purchase: parseFloat(formData.minPurchase) || 0,
        max_discount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usage_limit: parseInt(formData.usageLimit) || 1000,
        start_date: formData.startDate,
        end_date: formData.endDate,
        applicable_to: formData.applicableTo,
      });
      toast.success('Promotion created successfully!');
      setShowCreateModal(false);
      setFormData(emptyForm);
      loadPromotions();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPromotion) return;
    setSaving(true);
    try {
      await api.put(`/admin/promotions/${selectedPromotion.id}`, {
        title: formData.title,
        description: formData.description,
        promo_code: formData.code.toUpperCase(),
        discount_percentage: parseFloat(formData.discount) || 0,
        min_purchase: parseFloat(formData.minPurchase) || 0,
        max_discount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usage_limit: parseInt(formData.usageLimit) || 1000,
        start_date: formData.startDate,
        end_date: formData.endDate,
        applicable_to: formData.applicableTo,
      });
      toast.success('Promotion updated successfully!');
      setShowEditModal(false);
      setSelectedPromotion(null);
      setFormData(emptyForm);
      loadPromotions();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      await api.delete(`/admin/promotions/${id}`);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      toast.success('Promotion deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete promotion');
    }
  };

  const handleView = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setShowViewModal(true);
  };

  const handleEditClick = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setFormData({
      title: promo.title,
      description: promo.description,
      code: promo.code,
      type: promo.type,
      discount: promo.discount.toString(),
      minPurchase: promo.minPurchase.toString(),
      maxDiscount: promo.maxDiscount?.toString() || '',
      usageLimit: promo.usageLimit.toString(),
      startDate: promo.startDate,
      endDate: promo.endDate,
      applicableTo: promo.applicableTo,
      categories: promo.categories || [],
    });
    setShowEditModal(true);
  };

  const toggleStatus = async (promo: Promotion) => {
    const disable = promo.status === 'active';
    try {
      await api.patch(`/admin/promotions/${promo.id}/toggle`, { disable });
      setPromotions((prev) => prev.map((p) =>
        p.id === promo.id
          ? { ...p, status: disable ? ('inactive' as const) : ('active' as const) }
          : p
      ));
      toast.success(`Promotion ${disable ? 'disabled' : 'enabled'}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update promotion status');
    }
  };

  const getStatusColor = (status: Promotion['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: Promotion['type']) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'shipping': return <Package className="w-4 h-4" />;
    }
  };

  const getDiscountDisplay = (promo: Promotion) => {
    switch (promo.type) {
      case 'percentage': return `${promo.discount}%`;
      case 'fixed': return `$${promo.discount}`;
      case 'shipping': return 'Free Shipping';
    }
  };

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Promotions</h1>
            <p className="text-gray-600 mt-1">Create and manage promotional campaigns</p>
          </div>
          <Button
            onClick={() => { setFormData(emptyForm); setShowCreateModal(true); }}
            className="text-white"
            style={{ backgroundColor: '#BE220E' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Promotion
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search promotions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Promotions</div>
            <div className="text-2xl font-bold mt-1">{promotions.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {promotions.filter((p) => p.status === 'active').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Scheduled</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {promotions.filter((p) => p.status === 'scheduled').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Usage</div>
            <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>
              {promotions.reduce((sum, p) => sum + p.usedCount, 0)}
            </div>
          </Card>
        </div>

        {/* Promotions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-14 w-14 rounded-lg mb-4" />
                <Skeleton className="h-5 w-3/4 rounded mb-2" />
                <Skeleton className="h-4 w-full rounded mb-1" />
                <Skeleton className="h-4 w-2/3 rounded mb-4" />
                <Skeleton className="h-4 w-full rounded mb-2" />
                <Skeleton className="h-4 w-full rounded mb-2" />
                <Skeleton className="h-4 w-full rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promo) => (
              <Card key={promo.id} className="p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(promo.status)}`}>
                    {promo.status}
                  </span>
                </div>
                <div className="w-14 h-14 bg-[#BE220E] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <Tag className="w-7 h-7" style={{ color: '#BE220E' }} />
                </div>
                <h3 className="font-bold text-lg mb-2">{promo.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{promo.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-mono font-medium bg-gray-100 px-2 py-1 rounded">{promo.code}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      {getTypeIcon(promo.type)} Discount:
                    </span>
                    <span className="font-bold text-lg" style={{ color: '#BE220E' }}>{getDiscountDisplay(promo)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Min Purchase:</span>
                    <span className="font-medium">₦{promo.minPurchase.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Usage:</span>
                    <span className="font-medium">{promo.usedCount} / {promo.usageLimit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Valid:
                    </span>
                    <span className="text-xs">{promo.startDate} → {promo.endDate}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((promo.usedCount / Math.max(promo.usageLimit, 1)) * 100, 100)}%`,
                        backgroundColor: '#BE220E',
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <Button onClick={() => handleView(promo)} variant="outline" size="sm" className="hover:bg-blue-50">
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  <Button onClick={() => handleEditClick(promo)} variant="outline" size="sm" className="hover:bg-yellow-50">
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    onClick={() => toggleStatus(promo)}
                    variant="outline"
                    size="sm"
                    disabled={promo.status === 'expired'}
                    className={promo.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                  >
                    {promo.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button onClick={() => handleDelete(promo.id)} variant="outline" size="sm" className="hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPromotions.length === 0 && (
          <EmptyState
            icon={Tag}
            title={searchQuery || filterStatus !== 'all' ? 'No promotions match your filters' : 'No promotions yet'}
            description={searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or status filter.' : 'Create your first promotion to drive sales.'}
            action={
              searchQuery || filterStatus !== 'all'
                ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setFilterStatus('all'); } }
                : { label: 'Create Promotion', onClick: () => { setFormData(emptyForm); setShowCreateModal(true); } }
            }
          />
        )}

        {/* Create / Edit Modal */}
        <Dialog open={showCreateModal || showEditModal} onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedPromotion(null);
            setFormData(emptyForm);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{showEditModal ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
              <DialogDescription>
                {showEditModal ? 'Update promotion details below' : 'Fill in the details to create a new promotion'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Promotion Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your promotion..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Promo Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER2024"
                  className="uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'percentage' | 'fixed' | 'shipping') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                      <SelectItem value="shipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.type !== 'shipping' && (
                  <div>
                    <Label>{formData.type === 'percentage' ? 'Discount (%)' : 'Discount (₦)'} *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder={formData.type === 'percentage' ? '20' : '2500'}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Purchase Amount (₦)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="0"
                  />
                </div>
                {formData.type === 'percentage' && (
                  <div>
                    <Label>Max Discount (₦)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="10000"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="1000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Applicable To</Label>
                <Select
                  value={formData.applicableTo}
                  onValueChange={(value: 'all' | 'categories' | 'products') =>
                    setFormData({ ...formData, applicableTo: value })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="categories">Specific Categories</SelectItem>
                    <SelectItem value="products">Specific Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedPromotion(null);
                setFormData(emptyForm);
              }}>
                Cancel
              </Button>
              <Button
                onClick={showEditModal ? handleEdit : handleCreate}
                className="text-white"
                style={{ backgroundColor: '#BE220E' }}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {showEditModal ? 'Update Promotion' : 'Create Promotion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Promotion Details</DialogTitle>
            </DialogHeader>
            {selectedPromotion && (
              <div className="space-y-6">
                <div className="flex items-start justify-between pb-4 border-b">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-[#BE220E] bg-opacity-10 rounded-lg flex items-center justify-center">
                      <Tag className="w-8 h-8" style={{ color: '#BE220E' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{selectedPromotion.title}</h3>
                      <p className="text-gray-600 text-sm">{selectedPromotion.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPromotion.status)}`}>
                    {selectedPromotion.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Promo Code</div>
                    <div className="font-mono font-bold text-lg">{selectedPromotion.code}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      {getTypeIcon(selectedPromotion.type)} Discount
                    </div>
                    <div className="font-bold text-lg" style={{ color: '#BE220E' }}>
                      {getDiscountDisplay(selectedPromotion)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Min Purchase</div>
                    <div className="font-bold text-lg">₦{selectedPromotion.minPurchase.toLocaleString()}</div>
                  </div>
                  {selectedPromotion.maxDiscount && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Max Discount</div>
                      <div className="font-bold text-lg">₦{selectedPromotion.maxDiscount.toLocaleString()}</div>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Usage</div>
                    <div className="font-bold text-lg">
                      {selectedPromotion.usedCount} / {selectedPromotion.usageLimit}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min((selectedPromotion.usedCount / Math.max(selectedPromotion.usageLimit, 1)) * 100, 100)}%`,
                          backgroundColor: '#BE220E',
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Valid Period</div>
                    <div className="font-medium text-sm">{selectedPromotion.startDate}</div>
                    <div className="text-xs text-gray-500">to</div>
                    <div className="font-medium text-sm">{selectedPromotion.endDate}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Applicable To</div>
                    <div className="font-medium capitalize">{selectedPromotion.applicableTo}</div>
                    {selectedPromotion.categories && selectedPromotion.categories.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">{selectedPromotion.categories.join(', ')}</div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Created Date</div>
                    <div className="font-medium">{selectedPromotion.createdDate}</div>
                  </div>
                </div>
                {selectedPromotion.status === 'active' && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">Promotion is Active</div>
                      <div className="text-sm text-blue-700 mt-1">This promotion is live and can be used by customers.</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
              {selectedPromotion && selectedPromotion.status !== 'expired' && (
                <>
                  <Button variant="outline" onClick={() => { setShowViewModal(false); handleEditClick(selectedPromotion); }}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button
                    onClick={() => { toggleStatus(selectedPromotion); setShowViewModal(false); }}
                    variant={selectedPromotion.status === 'active' ? 'outline' : 'default'}
                    className={selectedPromotion.status === 'active' ? '' : 'text-white'}
                    style={selectedPromotion.status === 'active' ? {} : { backgroundColor: '#BE220E' }}
                  >
                    {selectedPromotion.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

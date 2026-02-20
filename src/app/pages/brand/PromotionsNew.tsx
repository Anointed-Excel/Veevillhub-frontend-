import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Tag, Edit2, Trash2, Eye, X, Calendar, Percent, DollarSign, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  products?: string[];
  createdDate: string;
}

export default function BrandPromotionsNew() {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      title: 'New Year Mega Sale',
      description: 'Start the year with amazing discounts on all food products',
      code: 'NEWYEAR2024',
      type: 'percentage',
      discount: 20,
      minPurchase: 50,
      maxDiscount: 100,
      usageLimit: 1000,
      usedCount: 245,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      applicableTo: 'categories',
      categories: ['Food & Beverage'],
      createdDate: '2023-12-15'
    },
    {
      id: '2',
      title: 'Free Shipping',
      description: 'Free shipping on orders above $100',
      code: 'FREESHIP',
      type: 'shipping',
      discount: 0,
      minPurchase: 100,
      usageLimit: 500,
      usedCount: 156,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      applicableTo: 'all',
      createdDate: '2024-01-01'
    },
    {
      id: '3',
      title: 'Black Friday Blowout',
      description: 'Massive 50% off on all products',
      code: 'BLACKFRI50',
      type: 'percentage',
      discount: 50,
      minPurchase: 0,
      maxDiscount: 500,
      usageLimit: 2000,
      usedCount: 1847,
      status: 'expired',
      startDate: '2023-11-24',
      endDate: '2023-11-27',
      applicableTo: 'all',
      createdDate: '2023-11-01'
    },
    {
      id: '4',
      title: 'VIP Customer Discount',
      description: '$25 off for loyal customers',
      code: 'VIP25',
      type: 'fixed',
      discount: 25,
      minPurchase: 200,
      usageLimit: 100,
      usedCount: 0,
      status: 'scheduled',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      applicableTo: 'all',
      createdDate: '2024-01-15'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
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
  });

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch = promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         promo.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || promo.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    if (!formData.title || !formData.code || !formData.discount || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newPromotion: Promotion = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      code: formData.code.toUpperCase(),
      type: formData.type,
      discount: parseFloat(formData.discount),
      minPurchase: parseFloat(formData.minPurchase) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: parseInt(formData.usageLimit) || 1000,
      usedCount: 0,
      status: new Date(formData.startDate) > new Date() ? 'scheduled' : 'active',
      startDate: formData.startDate,
      endDate: formData.endDate,
      applicableTo: formData.applicableTo,
      categories: formData.categories,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setPromotions([newPromotion, ...promotions]);
    setShowCreateModal(false);
    resetForm();
    toast.success('Promotion created successfully!');
  };

  const handleEdit = () => {
    if (!selectedPromotion) return;

    const updatedPromotion: Promotion = {
      ...selectedPromotion,
      title: formData.title,
      description: formData.description,
      code: formData.code.toUpperCase(),
      type: formData.type,
      discount: parseFloat(formData.discount),
      minPurchase: parseFloat(formData.minPurchase) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: parseInt(formData.usageLimit),
      startDate: formData.startDate,
      endDate: formData.endDate,
      applicableTo: formData.applicableTo,
      categories: formData.categories,
    };

    setPromotions(promotions.map((p) => p.id === selectedPromotion.id ? updatedPromotion : p));
    setShowEditModal(false);
    setSelectedPromotion(null);
    toast.success('Promotion updated successfully!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(promotions.filter((p) => p.id !== id));
      toast.success('Promotion deleted successfully');
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

  const toggleStatus = (id: string) => {
    setPromotions(promotions.map((p) =>
      p.id === id
        ? {
            ...p,
            status: p.status === 'active' ? ('inactive' as const) : ('active' as const)
          }
        : p
    ));
    const promo = promotions.find((p) => p.id === id);
    toast.success(`Promotion ${promo?.status === 'active' ? 'disabled' : 'enabled'} successfully`);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      type: 'percentage',
      discount: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      applicableTo: 'all',
      categories: [],
    });
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
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
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
            <div className="relative">
              <Input
                placeholder="Search promotions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3"
              />
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promo) => (
            <Card
              key={promo.id}
              className="p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(promo.status)}`}>
                  {promo.status}
                </span>
              </div>

              {/* Promo Icon */}
              <div className="w-14 h-14 bg-[#BE220E] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <Tag className="w-7 h-7" style={{ color: '#BE220E' }} />
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg mb-2">{promo.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{promo.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-mono font-medium bg-gray-100 px-2 py-1 rounded">{promo.code}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    {getTypeIcon(promo.type)}
                    Discount:
                  </span>
                  <span className="font-bold text-lg" style={{ color: '#BE220E' }}>{getDiscountDisplay(promo)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min Purchase:</span>
                  <span className="font-medium">${promo.minPurchase}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{promo.usedCount} / {promo.usageLimit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Valid:
                  </span>
                  <span className="text-xs">{promo.startDate} to {promo.endDate}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((promo.usedCount / promo.usageLimit) * 100, 100)}%`,
                      backgroundColor: '#BE220E'
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleView(promo)}
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  onClick={() => handleEditClick(promo)}
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => toggleStatus(promo.id)}
                  variant="outline"
                  size="sm"
                  className={`flex-1 transition-colors ${
                    promo.status === 'active'
                      ? 'hover:bg-red-50 hover:border-red-300'
                      : 'hover:bg-green-50 hover:border-green-300'
                  }`}
                  disabled={promo.status === 'expired'}
                >
                  {promo.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  onClick={() => handleDelete(promo.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPromotions.length === 0 && (
          <Card className="p-12 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Promotions Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first promotion to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="text-white"
                style={{ backgroundColor: '#BE220E' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Promotion
              </Button>
            )}
          </Card>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={showCreateModal || showEditModal} onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedPromotion(null);
            resetForm();
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
              {/* Basic Info */}
              <div>
                <Label htmlFor="title">Promotion Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your promotion..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="code">Promo Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER2024"
                  className="uppercase font-mono"
                />
              </div>

              {/* Discount Type & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Discount Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'percentage' | 'fixed' | 'shipping') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      <SelectItem value="shipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type !== 'shipping' && (
                  <div>
                    <Label htmlFor="discount">
                      {formData.type === 'percentage' ? 'Discount (%)' : 'Discount ($)'} *
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder={formData.type === 'percentage' ? '20' : '25.00'}
                    />
                  </div>
                )}
              </div>

              {/* Purchase Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPurchase">Min Purchase Amount ($)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                {formData.type === 'percentage' && (
                  <div>
                    <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="100.00"
                    />
                  </div>
                )}
              </div>

              {/* Usage & Dates */}
              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="1000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Applicable To */}
              <div>
                <Label htmlFor="applicableTo">Applicable To</Label>
                <Select
                  value={formData.applicableTo}
                  onValueChange={(value: 'all' | 'categories' | 'products') => 
                    setFormData({ ...formData, applicableTo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="categories">Specific Categories</SelectItem>
                    <SelectItem value="products">Specific Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedPromotion(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={showEditModal ? handleEdit : handleCreate}
                className="text-white"
                style={{ backgroundColor: '#BE220E' }}
              >
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
                {/* Header */}
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

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Promo Code</div>
                    <div className="font-mono font-bold text-lg">{selectedPromotion.code}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      {getTypeIcon(selectedPromotion.type)}
                      Discount
                    </div>
                    <div className="font-bold text-lg" style={{ color: '#BE220E' }}>
                      {getDiscountDisplay(selectedPromotion)}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Min Purchase</div>
                    <div className="font-bold text-lg">${selectedPromotion.minPurchase}</div>
                  </div>

                  {selectedPromotion.maxDiscount && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Max Discount</div>
                      <div className="font-bold text-lg">${selectedPromotion.maxDiscount}</div>
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
                          width: `${Math.min((selectedPromotion.usedCount / selectedPromotion.usageLimit) * 100, 100)}%`,
                          backgroundColor: '#BE220E'
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
                      <div className="text-xs text-gray-600 mt-1">
                        {selectedPromotion.categories.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Created Date</div>
                    <div className="font-medium">{selectedPromotion.createdDate}</div>
                  </div>
                </div>

                {/* Alert for expiring soon */}
                {selectedPromotion.status === 'active' && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-900">Promotion is Active</div>
                      <div className="text-sm text-blue-700 mt-1">
                        This promotion is currently live and can be used by customers.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
              {selectedPromotion && selectedPromotion.status !== 'expired' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditClick(selectedPromotion);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      toggleStatus(selectedPromotion.id);
                      setShowViewModal(false);
                    }}
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

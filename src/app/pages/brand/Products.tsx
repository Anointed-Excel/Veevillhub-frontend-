import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Plus, Search, Download, Eye, Trash2, Upload, Package, Image as ImageIcon, Tag, X, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  price: number;
  moq: number;
  stock: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'archived';
  image: string;
  commission: number;
  description?: string;
  tags?: string[];
  brand?: string;
  salesPrice?: number;
  attributes?: { name: string; value: string }[];
}

export default function BrandProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<unknown>('/products');
      const data = res.data as Record<string, unknown>;
      const raw = (data.products || []) as Record<string, unknown>[];
      setProducts(raw.map((p) => ({
        id: p.id as string,
        name: (p.name as string) || '',
        sku: (p.sku as string) || '',
        categoryId: (p.category_id as string) || '',
        categoryName: '',
        price: Number(p.regular_price) || 0,
        moq: Number(p.moq) || 1,
        stock: Number(p.stock_quantity) || 0,
        status: (p.status as Product['status']) || 'draft',
        image: (p.image_url as string) || '',
        commission: Number(p.platform_commission) || 0,
        description: (p.description as string) || '',
        tags: (p.tags as string[]) || [],
        brand: (p.brand as string) || '',
        salesPrice: p.sales_price ? Number(p.sales_price) : undefined,
        attributes: (p.attributes as { name: string; value: string }[]) || [],
      })));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get<unknown>('/categories');
      const data = res.data as Record<string, unknown>;
      const raw = (data.categories || []) as Record<string, unknown>[];
      setCategories(raw.map((c) => ({ id: c.id as string, name: (c.name as string) || '' })));
    } catch {
      // categories load failure is non-fatal
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    moq: '',
    stock: '',
    commission: '10',
    description: '',
    tags: [] as string[],
    brand: '',
    regularPrice: '',
    salesPrice: '',
    trackInventory: true,
    weight: '',
    shippingClass: 'standard',
    linkedSkus: [] as string[],
    attributes: [] as { name: string; value: string }[],
  });
  const [tagInput, setTagInput] = useState('');
  const [attributeInput, setAttributeInput] = useState({ name: '', value: '' });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.categoryId || !formData.regularPrice || !formData.moq || !formData.stock) {
      toast.error('Please fill in all required fields (name, category, price, MOQ, stock)');
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('description', formData.description || '');
      body.append('categoryId', formData.categoryId);
      body.append('brand', formData.brand || '');
      body.append('regularPrice', formData.regularPrice);
      if (formData.salesPrice) body.append('salesPrice', formData.salesPrice);
      body.append('moq', formData.moq);
      body.append('platformCommission', formData.commission);
      body.append('stockQuantity', formData.stock);
      body.append('trackInventory', String(formData.trackInventory));
      if (formData.weight) body.append('weight', formData.weight);
      body.append('shippingClass', formData.shippingClass);
      body.append('tags', JSON.stringify(formData.tags));
      body.append('linkedSkus', JSON.stringify(formData.linkedSkus));
      body.append('attributes', JSON.stringify(formData.attributes));
      if (imageFile) body.append('image', imageFile);
      galleryFiles.forEach((f) => body.append('gallery', f));

      await api.post('/products', body);
      toast.success('Product created successfully');
      setShowCreateModal(false);
      resetFormData();
      loadProducts();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      categoryId: '',
      moq: '',
      stock: '',
      commission: '10',
      description: '',
      tags: [],
      brand: '',
      regularPrice: '',
      salesPrice: '',
      trackInventory: true,
      weight: '',
      shippingClass: 'standard',
      linkedSkus: [],
      attributes: [],
    });
    setTagInput('');
    setAttributeInput({ name: '', value: '' });
    setImageFile(null);
    setGalleryFiles([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) { toast.error('No products selected'); return; }
    if (!confirm(`Delete ${selectedProducts.length} product(s)?`)) return;
    try {
      await Promise.all(selectedProducts.map((id) => api.delete(`/products/${id}`)));
      setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} product(s) deleted`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete some products');
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const addAttribute = () => {
    if (attributeInput.name.trim() && attributeInput.value.trim()) {
      setFormData({
        ...formData,
        attributes: [...formData.attributes, { ...attributeInput }],
      });
      setAttributeInput({ name: '', value: '' });
    }
  };

  const removeAttribute = (index: number) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index),
    });
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await api.patch(`/products/${product.id}`, { status: newStatus });
      setProducts((prev) => prev.map((p) =>
        p.id === product.id ? { ...p, status: newStatus as Product['status'] } : p
      ));
      toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update product status');
    }
  };

  const openRestock = (product: Product) => {
    setSelectedProduct(product);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const handleRestock = async () => {
    if (!selectedProduct) return;
    const qty = parseInt(restockQuantity, 10);
    if (!qty || qty <= 0) { toast.error('Enter a valid quantity'); return; }
    setSaving(true);
    try {
      await api.patch(`/products/${selectedProduct.id}/restock`, { quantity: qty });
      setProducts((prev) => prev.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, stock: p.stock + qty, status: 'active' as const }
          : p
      ));
      toast.success(`Restocked ${selectedProduct.name} with ${qty} units`);
      setShowRestockModal(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to restock product');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpload = () => {
    toast.info('Bulk upload via CSV is coming soon');
    setShowBulkUploadModal(false);
  };

  const handleExport = () => {
    const csv = ['SKU,Name,Category,Price,Stock,Status'].concat(
      products.map((p) => {
        const catName = categories.find((c) => c.id === p.categoryId)?.name || p.categoryId;
        return `${p.sku},${p.name},${catName},${p.price},${p.stock},${p.status}`;
      })
    ).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'products.csv';
    link.click();
  };

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-600 mt-1">Manage all platform products and inventory</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowBulkUploadModal(true)} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="text-white" style={{ backgroundColor: '#BE220E' }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Products</div>
            <div className="text-2xl font-bold mt-1">{products.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {products.filter((p) => p.status === 'active').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Out of Stock</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {products.filter((p) => p.status === 'out_of_stock').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Results</div>
            <div className="text-2xl font-bold mt-1">{filteredProducts.length}</div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {selectedProducts.length > 0 && (
            <Button onClick={handleBulkDelete} variant="outline" size="sm" className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedProducts.length})
            </Button>
          )}
        </div>

        {/* Products Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No products found</td></tr>
                ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">MOQ: {product.moq} units</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">₦{product.price.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{product.commission}% commission</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' :
                        product.status === 'out_of_stock' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleView(product)} variant="ghost" size="sm" title="View">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button onClick={() => handleToggleStatus(product)} variant="ghost" size="sm" title={product.status === 'active' ? 'Deactivate' : 'Activate'}>
                          <Package className={`w-4 h-4 ${product.status === 'active' ? 'text-gray-600' : 'text-green-600'}`} />
                        </Button>
                        <Button onClick={() => openRestock(product)} variant="ghost" size="sm" title="Restock">
                          <RefreshCw className="w-4 h-4 text-orange-500" />
                        </Button>
                        <Button onClick={() => handleDelete(product.id)} variant="ghost" size="sm" title="Delete">
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

        {/* Create Modal with Tabs */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new product for VeevillHub</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="seo">SEO & Links</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto mt-4 px-1">
                <TabsContent value="general" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Product Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter detailed product description for buyers"
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Product Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="brand">Product Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div>
                    <Label>Product Image</Label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        {imageFile ? imageFile.name : 'Upload main product image'}
                      </p>
                      <Button variant="outline" size="sm" type="button">Browse Image</Button>
                    </div>
                  </div>
                  <div>
                    <Label>Product Gallery</Label>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
                    />
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        {galleryFiles.length > 0 ? `${galleryFiles.length} file(s) selected` : 'Upload multiple product images'}
                      </p>
                      <Button variant="outline" size="sm" type="button">Browse Images</Button>
                      <p className="text-xs text-gray-500 mt-2">Recommended: 800x800px, Max 5MB each</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="regularPrice">Regular Price (₦) *</Label>
                    <Input
                      id="regularPrice"
                      type="number"
                      step="0.01"
                      value={formData.regularPrice}
                      onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesPrice">Sales Price (₦)</Label>
                    <Input
                      id="salesPrice"
                      type="number"
                      step="0.01"
                      value={formData.salesPrice}
                      onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                      placeholder="Leave empty if no sale"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set a discounted price for this product</p>
                  </div>
                  <div>
                    <Label htmlFor="moq">Minimum Order Quantity (MOQ) *</Label>
                    <Input
                      id="moq"
                      type="number"
                      value={formData.moq}
                      onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission">Platform Commission (%) *</Label>
                    <Input
                      id="commission"
                      type="number"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900 mb-1">Price Summary</div>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>Regular Price: ₦{formData.regularPrice || '0.00'}</div>
                      <div>Sales Price: {formData.salesPrice ? `₦${formData.salesPrice}` : 'N/A'}</div>
                      <div>Commission: {formData.commission || '0'}%</div>
                      <div className="font-medium pt-1 border-t border-blue-300">
                        Net Price: ₦{formData.salesPrice
                          ? (parseFloat(formData.salesPrice) * (1 - parseFloat(formData.commission || '0') / 100)).toFixed(2)
                          : (parseFloat(formData.regularPrice || '0') * (1 - parseFloat(formData.commission || '0') / 100)).toFixed(2)
                        }
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="1000"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackInventory"
                      checked={formData.trackInventory}
                      onCheckedChange={(checked) => setFormData({ ...formData, trackInventory: checked as boolean })}
                    />
                    <Label htmlFor="trackInventory" className="cursor-pointer">
                      Track inventory for this product
                    </Label>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-amber-900 mb-1">Inventory Settings</div>
                    <div className="text-xs text-amber-700">
                      When inventory tracking is enabled, stock levels will automatically decrease when orders are placed.
                      The product will be marked as "Out of Stock" when quantity reaches zero.
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="weight">Product Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 2.5 kg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions">Product Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="e.g., 30 x 20 x 10 cm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingClass">Shipping Class</Label>
                    <Select value={formData.shippingClass} onValueChange={(value) => setFormData({ ...formData, shippingClass: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Shipping</SelectItem>
                        <SelectItem value="express">Express Shipping</SelectItem>
                        <SelectItem value="free">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="tags">Product Tags (Important for SEO)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Enter tag and press Enter"
                        className="flex-1"
                      />
                      <Button onClick={addTag} variant="outline" size="sm" type="button">
                        <Tag className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-blue-900" type="button">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Add relevant keywords to improve product discoverability</p>
                  </div>
                  <div>
                    <Label htmlFor="linkedSkus">Linked Product SKUs</Label>
                    <Input
                      id="linkedSkus"
                      value={formData.linkedSkus.join(', ')}
                      onChange={(e) => setFormData({ ...formData, linkedSkus: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="Enter product SKUs separated by commas"
                    />
                    <p className="text-xs text-gray-500 mt-1">Link related products to show in recommendations</p>
                  </div>
                </TabsContent>

                <TabsContent value="attributes" className="space-y-4 mt-0">
                  <div>
                    <Label>Product Attributes</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={attributeInput.name}
                          onChange={(e) => setAttributeInput({ ...attributeInput, name: e.target.value })}
                          placeholder="Attribute name (e.g., Color)"
                          className="flex-1"
                        />
                        <Input
                          value={attributeInput.value}
                          onChange={(e) => setAttributeInput({ ...attributeInput, value: e.target.value })}
                          placeholder="Attribute value (e.g., Red)"
                          className="flex-1"
                        />
                        <Button onClick={addAttribute} variant="outline" size="sm" type="button">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.attributes.map((attr, index) => (
                          <span key={index} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                            <strong>{attr.name}:</strong> {attr.value}
                            <button onClick={() => removeAttribute(index)} className="hover:text-purple-900" type="button">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Add product specifications like size, color, material, etc.</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-900 mb-2">Common Attributes Examples:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                      <div>• Size: Small, Medium, Large</div>
                      <div>• Color: Red, Blue, Green</div>
                      <div>• Material: Cotton, Polyester</div>
                      <div>• Weight: 500g, 1kg, 2kg</div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowCreateModal(false); resetFormData(); }}>Cancel</Button>
              <Button onClick={handleCreate} className="text-white" style={{ backgroundColor: '#BE220E' }} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-4 pb-4 border-b">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg">{selectedProduct.name}</div>
                    <div className="text-sm text-gray-600">{selectedProduct.sku}</div>
                    {selectedProduct.brand && <div className="text-sm text-gray-500">{selectedProduct.brand}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="font-bold mt-1" style={{ color: '#BE220E' }}>₦{selectedProduct.price.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">MOQ</div>
                    <div className="font-medium mt-1">{selectedProduct.moq} units</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Stock</div>
                    <div className="font-medium mt-1">{selectedProduct.stock} units</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Commission</div>
                    <div className="font-medium mt-1">{selectedProduct.commission}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-medium mt-1 capitalize">{selectedProduct.status.replace('_', ' ')}</div>
                  </div>
                </div>
                {selectedProduct.description && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Description</div>
                    <div className="text-sm bg-gray-50 p-3 rounded">{selectedProduct.description}</div>
                  </div>
                )}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag) => (
                        <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.attributes && selectedProduct.attributes.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Attributes</div>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProduct.attributes.map((attr, idx) => (
                        <div key={idx} className="bg-purple-50 p-2 rounded">
                          <span className="font-medium">{attr.name}:</span> {attr.value}
                        </div>
                      ))}
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

        {/* Bulk Upload Modal */}
        <Dialog open={showBulkUploadModal} onOpenChange={setShowBulkUploadModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Products</DialogTitle>
              <DialogDescription>Upload multiple products using CSV file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">Drag and drop your CSV file here, or</p>
                <Button variant="outline" type="button">Browse Files</Button>
                <p className="text-xs text-gray-500 mt-4">Supported format: CSV (Max 10MB)</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">CSV Template Requirements:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Columns: Name, SKU, Category, Price, MOQ, Stock, Commission</li>
                  <li>• All fields are required</li>
                  <li>• Price and Commission should be numbers</li>
                  <li>• SKU must be unique</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3" type="button">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkUploadModal(false)}>Cancel</Button>
              <Button onClick={handleBulkUpload} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                Upload Products
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restock Modal */}
        <Dialog open={showRestockModal} onOpenChange={setShowRestockModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Restock Product</DialogTitle>
              <DialogDescription>
                {selectedProduct?.name} — current stock: {selectedProduct?.stock ?? 0} units
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label htmlFor="restockQty">Quantity to add *</Label>
              <Input
                id="restockQty"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="e.g. 50"
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRestockModal(false)}>Cancel</Button>
              <Button onClick={handleRestock} disabled={saving} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Restock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

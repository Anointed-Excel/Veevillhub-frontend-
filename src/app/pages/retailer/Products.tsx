import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Search, Download, Eye, Edit2, Trash2, Package, AlertCircle, TrendingUp } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  retailPrice: number;
  stock: number;
  reorderLevel: number;
  status: 'active' | 'inactive' | 'low_stock' | 'out_of_stock';
  image: string;
  description: string;
  supplier: string;
  sales: number;
}

export default function RetailerProducts() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Premium African Print Dress',
      sku: 'RTL-DRS-001',
      category: 'Clothing',
      costPrice: 25.99,
      retailPrice: 49.99,
      stock: 45,
      reorderLevel: 20,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      description: 'Beautiful African print dress',
      supplier: 'Textile Masters Ltd',
      sales: 145,
    },
    {
      id: '2',
      name: 'Cotton Shirt (Men)',
      sku: 'RTL-SHT-001',
      category: 'Clothing',
      costPrice: 18.50,
      retailPrice: 34.99,
      stock: 12,
      reorderLevel: 30,
      status: 'low_stock',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
      description: 'Comfortable cotton shirt for men',
      supplier: 'Cotton Works Inc',
      sales: 89,
    },
    {
      id: '3',
      name: 'Leather Handbag',
      sku: 'RTL-BAG-001',
      category: 'Accessories',
      costPrice: 45.00,
      retailPrice: 89.99,
      stock: 28,
      reorderLevel: 15,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
      description: 'Premium leather handbag',
      supplier: 'Premium Leather Co',
      sales: 67,
    },
    {
      id: '4',
      name: 'Fashion Scarf',
      sku: 'RTL-ACC-001',
      category: 'Accessories',
      costPrice: 8.99,
      retailPrice: 19.99,
      stock: 0,
      reorderLevel: 40,
      status: 'out_of_stock',
      image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400',
      description: 'Stylish fashion scarf',
      supplier: 'Accessories Hub',
      sales: 54,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Clothing',
    costPrice: '',
    retailPrice: '',
    stock: '',
    reorderLevel: '',
    description: '',
    supplier: '',
  });

  const categories = ['Clothing', 'Accessories', 'Footwear', 'Jewelry', 'Home Decor'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.retailPrice - b.retailPrice;
      case 'stock':
        return a.stock - b.stock;
      case 'sales':
        return b.sales - a.sales;
      default:
        return 0;
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'Clothing',
      costPrice: '',
      retailPrice: '',
      stock: '',
      reorderLevel: '',
      description: '',
      supplier: '',
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.sku || !formData.costPrice || !formData.retailPrice || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    const stock = parseInt(formData.stock);
    const reorderLevel = parseInt(formData.reorderLevel);
    let status: Product['status'] = 'active';
    if (stock === 0) status = 'out_of_stock';
    else if (stock <= reorderLevel) status = 'low_stock';

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      costPrice: parseFloat(formData.costPrice),
      retailPrice: parseFloat(formData.retailPrice),
      stock: stock,
      reorderLevel: reorderLevel,
      status: status,
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
      description: formData.description,
      supplier: formData.supplier,
      sales: 0,
    };

    setProducts([...products, newProduct]);
    toast.success('Product added successfully');
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedProduct || !formData.name || !formData.sku) {
      toast.error('Please fill in all required fields');
      return;
    }

    const stock = parseInt(formData.stock);
    const reorderLevel = parseInt(formData.reorderLevel);
    let status: Product['status'] = 'active';
    if (stock === 0) status = 'out_of_stock';
    else if (stock <= reorderLevel) status = 'low_stock';

    setProducts(products.map(p => 
      p.id === selectedProduct.id 
        ? {
            ...p,
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            costPrice: parseFloat(formData.costPrice),
            retailPrice: parseFloat(formData.retailPrice),
            stock: stock,
            reorderLevel: reorderLevel,
            status: status,
            description: formData.description,
            supplier: formData.supplier,
          }
        : p
    ));
    toast.success('Product updated successfully');
    setShowEditModal(false);
    setSelectedProduct(null);
    resetForm();
  };

  const handleDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      costPrice: product.costPrice.toString(),
      retailPrice: product.retailPrice.toString(),
      stock: product.stock.toString(),
      reorderLevel: product.reorderLevel.toString(),
      description: product.description,
      supplier: product.supplier,
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'low_stock': return 'bg-orange-100 text-orange-700';
      case 'out_of_stock': return 'bg-red-100 text-red-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: Product['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.status === 'low_stock').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.retailPrice * p.stock), 0),
  };

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Products</h1>
            <p className="text-gray-600 mt-1">Manage your retail inventory</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              style={{ backgroundColor: '#BE220E' }} 
              className="text-white"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Total Products</div>
            <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Active</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{stats.active}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Low Stock</div>
            <div className="text-2xl font-bold mt-1 text-orange-600">{stats.lowStock}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Out of Stock</div>
            <div className="text-2xl font-bold mt-1 text-red-600">{stats.outOfStock}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Total Value</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">${stats.totalValue.toFixed(0)}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stock">Stock Level</SelectItem>
                  <SelectItem value="sales">Best Selling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const margin = product.retailPrice - product.costPrice;
            const marginPercent = ((margin / product.costPrice) * 100).toFixed(1);
            
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.sku}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-medium">${product.costPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Retail:</span>
                      <span className="text-lg font-bold" style={{ color: '#BE220E' }}>
                        ${product.retailPrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Margin:</span>
                      <span className="font-medium text-green-600">+{marginPercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div>
                      <div className="text-sm text-gray-600">Stock</div>
                      <div className={`font-bold ${
                        product.stock === 0 ? 'text-red-600' : 
                        product.stock <= product.reorderLevel ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>
                        {product.stock} units
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Sales</div>
                      <div className="font-bold flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        {product.sales}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowViewModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditModal(product)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <EmptyState
            icon={Package}
            title={searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? 'No products match your filters' : 'No products yet'}
            description={searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first product to start selling.'}
            action={
              searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all'); } }
                : { label: 'Add Product', onClick: () => { resetForm(); setShowCreateModal(true); } }
            }
          />
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Enter product details for your retail inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label>SKU *</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="RTL-XXX-001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Supplier</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cost Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Retail Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.retailPrice}
                  onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  placeholder="20"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button style={{ backgroundColor: '#BE220E' }} className="text-white" onClick={handleCreate}>
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>SKU *</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Supplier</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cost Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                />
              </div>
              <div>
                <Label>Retail Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.retailPrice}
                  onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
              <div>
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button style={{ backgroundColor: '#BE220E' }} className="text-white" onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Product Name</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">SKU</Label>
                  <p className="font-medium">{selectedProduct.sku}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Category</Label>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedProduct.status)}`}>
                    {getStatusLabel(selectedProduct.status)}
                  </span>
                </div>
                <div>
                  <Label className="text-gray-600">Cost Price</Label>
                  <p className="font-medium">${selectedProduct.costPrice}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Retail Price</Label>
                  <p className="font-medium text-lg" style={{ color: '#BE220E' }}>${selectedProduct.retailPrice}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Stock</Label>
                  <p className="font-medium">{selectedProduct.stock} units</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Sales</Label>
                  <p className="font-medium">{selectedProduct.sales} units</p>
                </div>
                <div>
                  <Label className="text-gray-600">Supplier</Label>
                  <p className="font-medium">{selectedProduct.supplier || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Profit Margin</Label>
                  <p className="font-medium text-green-600">
                    {(((selectedProduct.retailPrice - selectedProduct.costPrice) / selectedProduct.costPrice) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Description</Label>
                <p className="text-sm">{selectedProduct.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            <Button 
              style={{ backgroundColor: '#BE220E' }} 
              className="text-white"
              onClick={() => {
                setShowViewModal(false);
                if (selectedProduct) openEditModal(selectedProduct);
              }}
            >
              Edit Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">{selectedProduct.sku}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

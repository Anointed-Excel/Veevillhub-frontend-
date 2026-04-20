import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Search, Download, Eye, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  moq: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image: string;
  description: string;
}

export default function ManufacturerProducts() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Premium African Print Fabric',
      sku: 'MFG-FAB-001',
      category: 'Textiles',
      price: 25.99,
      moq: 100,
      stock: 5000,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea9c5b0d?w=200',
      description: 'High-quality African print fabric',
    },
    {
      id: '2',
      name: 'Cotton Fabric Roll',
      sku: 'MFG-FAB-002',
      category: 'Textiles',
      price: 18.50,
      moq: 50,
      stock: 1200,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200',
      description: '100% pure cotton fabric roll',
    },
    {
      id: '3',
      name: 'Leather Material Pack',
      sku: 'MFG-LEA-001',
      category: 'Materials',
      price: 45.00,
      moq: 30,
      stock: 0,
      status: 'out_of_stock',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200',
      description: 'Premium leather material',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Textiles',
    price: '',
    moq: '',
    stock: '',
    description: '',
  });

  const categories = ['Textiles', 'Materials', 'Accessories', 'Packaging', 'Components'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = () => {
    if (!formData.name || !formData.sku || !formData.price || !formData.moq || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      price: parseFloat(formData.price),
      moq: parseInt(formData.moq),
      stock: parseInt(formData.stock),
      status: 'active',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      description: formData.description,
    };

    setProducts([...products, newProduct]);
    setShowCreateModal(false);
    setFormData({ name: '', sku: '', category: 'Textiles', price: '', moq: '', stock: '', description: '' });
    toast.success('Product created successfully');
  };

  const handleEdit = () => {
    if (!selectedProduct) return;
    setProducts(products.map((p) =>
      p.id === selectedProduct.id
        ? {
            ...p,
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            price: parseFloat(formData.price),
            moq: parseInt(formData.moq),
            stock: parseInt(formData.stock),
            description: formData.description,
          }
        : p
    ));
    setShowEditModal(false);
    setSelectedProduct(null);
    toast.success('Product updated successfully');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    }
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      moq: product.moq.toString(),
      stock: product.stock.toString(),
      description: product.description,
    });
    setShowEditModal(true);
  };

  const handleToggleStatus = (id: string) => {
    setProducts(products.map((p) =>
      p.id === id
        ? { ...p, status: p.status === 'active' ? 'inactive' as const : 'active' as const }
        : p
    ));
    toast.success('Product status updated');
  };

  const handleExport = () => {
    toast.success('Exporting products...');
  };

  return (
    <DashboardLayout role="manufacturer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Products</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="text-white" style={{ backgroundColor: '#BE220E' }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

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
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title={searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? 'No products match your filters' : 'No products yet'}
            description={searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first product to start selling.'}
            action={
              searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all'); } }
                : { label: 'Add Product', onClick: () => setShowCreateModal(true) }
            }
          />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' ? 'bg-green-100 text-green-700' :
                    product.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.status.replace('_', ' ')}
                  </span>
                </div>
                {product.stock < product.moq && product.stock > 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Low Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-mono font-medium">{product.sku}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold" style={{ color: '#BE220E' }}>${product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">MOQ:</span>
                    <span className="font-medium">{product.moq} units</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < product.moq ? 'text-orange-600' : 'text-green-600'}`}>
                      {product.stock} units
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleView(product)} variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button onClick={() => handleEditClick(product)} variant="outline" size="sm" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button onClick={() => handleToggleStatus(product.id)} variant="outline" size="sm">
                    <Package className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDelete(product.id)} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new product for your catalog</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
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
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="MFG-XXX-001"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="moq">MOQ (units) *</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
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
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-sku">SKU *</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price ($) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-moq">MOQ (units) *</Label>
                  <Input
                    id="edit-moq"
                    type="number"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleEdit} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-24 h-24 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-lg">{selectedProduct.name}</div>
                    <div className="text-sm text-gray-600">{selectedProduct.sku}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Category</div>
                    <div className="font-medium mt-1">{selectedProduct.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="font-bold mt-1" style={{ color: '#BE220E' }}>${selectedProduct.price}</div>
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
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-medium mt-1 capitalize">{selectedProduct.status.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Description</div>
                    <div className="font-medium mt-1">{selectedProduct.description}</div>
                  </div>
                </div>
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

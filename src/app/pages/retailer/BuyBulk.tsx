import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, ShoppingCart, Package, Building2, Star, TrendingUp, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ManufacturerProduct {
  id: string;
  name: string;
  manufacturer: string;
  sku: string;
  category: string;
  price: number;
  moq: number;
  stock: number;
  rating: number;
  image: string;
  description: string;
}

interface CartItem {
  product: ManufacturerProduct;
  quantity: number;
}

export default function RetailerBuyBulk() {
  const [products] = useState<ManufacturerProduct[]>([
    {
      id: '1',
      name: 'Premium African Print Fabric',
      manufacturer: 'Textile Masters Ltd',
      sku: 'MFG-FAB-001',
      category: 'Textiles',
      price: 25.99,
      moq: 100,
      stock: 5000,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea9c5b0d?w=400',
      description: 'High-quality African print fabric perfect for dresses and home decor',
    },
    {
      id: '2',
      name: 'Cotton Fabric Roll',
      manufacturer: 'Cotton Works Inc',
      sku: 'MFG-FAB-002',
      category: 'Textiles',
      price: 18.50,
      moq: 50,
      stock: 1200,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400',
      description: '100% pure cotton fabric roll, ideal for clothing',
    },
    {
      id: '3',
      name: 'Leather Material Pack',
      manufacturer: 'Premium Leather Co',
      sku: 'MFG-LEA-001',
      category: 'Materials',
      price: 45.00,
      moq: 30,
      stock: 800,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
      description: 'Premium leather material for bags and accessories',
    },
    {
      id: '4',
      name: 'Fashion Buttons Set',
      manufacturer: 'Accessories Hub',
      sku: 'MFG-ACC-001',
      category: 'Accessories',
      price: 8.99,
      moq: 200,
      stock: 15000,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=400',
      description: 'Assorted fashion buttons for clothing',
    },
    {
      id: '5',
      name: 'Zipper Pack',
      manufacturer: 'FastClip Manufacturing',
      sku: 'MFG-ACC-002',
      category: 'Accessories',
      price: 12.50,
      moq: 100,
      stock: 8000,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
      description: 'High-quality zippers in various sizes',
    },
    {
      id: '6',
      name: 'Packaging Boxes',
      manufacturer: 'BoxWorks Ltd',
      sku: 'MFG-PKG-001',
      category: 'Packaging',
      price: 5.99,
      moq: 500,
      stock: 20000,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
      description: 'Eco-friendly packaging boxes for retail',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterManufacturer, setFilterManufacturer] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ManufacturerProduct | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  const categories = ['Textiles', 'Materials', 'Accessories', 'Packaging', 'Components'];
  const manufacturers = Array.from(new Set(products.map(p => p.manufacturer)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesManufacturer = filterManufacturer === 'all' || product.manufacturer === filterManufacturer;
    return matchesSearch && matchesCategory && matchesManufacturer;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.rating - a.rating;
    }
  });

  const handleAddToCart = () => {
    if (!selectedProduct || !orderQuantity) {
      toast.error('Please enter quantity');
      return;
    }

    const qty = parseInt(orderQuantity);
    if (qty < selectedProduct.moq) {
      toast.error(`Minimum order quantity is ${selectedProduct.moq} units`);
      return;
    }

    const existingItem = cart.find(item => item.product.id === selectedProduct.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === selectedProduct.id
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
      toast.success('Updated cart quantity');
    } else {
      setCart([...cart, { product: selectedProduct, quantity: qty }]);
      toast.success('Added to cart');
    }

    setShowOrderModal(false);
    setSelectedProduct(null);
    setOrderQuantity('');
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast.success('Removed from cart');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    toast.success(`Order placed! Total: $${total.toFixed(2)}`);
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Buy in Bulk</h1>
            <p className="text-gray-600 mt-1">Browse and order from verified manufacturers</p>
          </div>
          <div className="relative">
            <Button 
              style={{ backgroundColor: '#BE220E' }} 
              className="text-white"
              onClick={() => cart.length > 0 && window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({cartCount})
            </Button>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
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
              <Label>Manufacturer</Label>
              <Select value={filterManufacturer} onValueChange={setFilterManufacturer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Manufacturers</SelectItem>
                  {manufacturers.map((mfg) => (
                    <SelectItem key={mfg} value={mfg}>{mfg}</SelectItem>
                  ))}
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
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
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
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Building2 className="w-4 h-4" />
                      {product.manufacturer}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-gray-600 text-sm">SKU: </span>
                    <span className="text-sm font-medium">{product.sku}</span>
                  </div>
                  <span className="text-sm px-2 py-1 bg-gray-100 rounded">{product.category}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: '#BE220E' }}>
                      ${product.price}
                    </div>
                    <div className="text-xs text-gray-600">per unit</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">MOQ: {product.moq}</div>
                    <div className="text-xs text-gray-600">{product.stock} in stock</div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  style={{ backgroundColor: '#BE220E' }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setOrderQuantity(product.moq.toString());
                    setShowOrderModal(true);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Order Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          </Card>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-600">{item.product.manufacturer}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} units × ${item.product.price}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: '#BE220E' }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-bold" style={{ color: '#BE220E' }}>
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setCart([])}
                >
                  Clear Cart
                </Button>
                <Button 
                  className="flex-1" 
                  style={{ backgroundColor: '#BE220E' }}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Order Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Product</DialogTitle>
            <DialogDescription>
              Enter the quantity you want to order
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedProduct.manufacturer}</p>
                  <div className="text-2xl font-bold mb-2" style={{ color: '#BE220E' }}>
                    ${selectedProduct.price} per unit
                  </div>
                  <div className="text-sm text-gray-600">
                    Minimum Order Quantity: {selectedProduct.moq} units
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Quantity (units)</Label>
                <Input
                  type="number"
                  placeholder={`Min: ${selectedProduct.moq}`}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  min={selectedProduct.moq}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Minimum order: {selectedProduct.moq} units
                </p>
              </div>

              {orderQuantity && parseInt(orderQuantity) >= selectedProduct.moq && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium">${selectedProduct.price}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{orderQuantity} units</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="font-bold">Total:</span>
                    <span className="text-2xl font-bold" style={{ color: '#BE220E' }}>
                      ${(selectedProduct.price * parseInt(orderQuantity)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderModal(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: '#BE220E' }} 
              className="text-white"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Search, ShoppingCart, Package, Building2, Star, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

interface BulkProduct {
  id: string;
  name: string;
  manufacturer: string;
  sku: string;
  category: string;
  price: number;
  moq: number;
  stock: number;
  image: string;
  description: string;
}

interface CartItem {
  product: BulkProduct;
  quantity: number;
}

const mapProduct = (p: Record<string, unknown>): BulkProduct => ({
  id: p.id as string,
  name: (p.name as string) || '',
  manufacturer: (p.vendor_name as string) || (p.brand as string) || 'Manufacturer',
  sku: (p.sku as string) || '',
  category: (p.category_name as string) || (p.category as string) || '',
  price: Number(p.regular_price) || Number(p.price) || 0,
  moq: Number(p.moq) || 1,
  stock: Number(p.stock_quantity) || Number(p.stock) || 0,
  image: (p.image_url as string) || (p.image as string) || '',
  description: (p.description as string) || '',
});

export default function RetailerBuyBulk() {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BulkProduct | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutAddress, setCheckoutAddress] = useState({
    fullName: '', phone: '', streetAddress: '', city: '', state: '', zipcode: '',
  });
  const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string; label: string; full_name: string; phone_number: string; street_address: string; city: string; state: string; zipcode: string }>>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get<unknown>('/products'),
        api.get<unknown>('/shop/categories'),
      ]);
      const prodData = prodRes.data as Record<string, unknown>;
      const catData = catRes.data as Record<string, unknown>;

      const raw = (prodData.products || []) as Record<string, unknown>[];
      // Only show products with an MOQ set (manufacturer products)
      const bulk = raw.filter((p) => Number(p.moq) >= 1);
      setProducts(bulk.map(mapProduct));

      // Extract flat category names
      const rawCats = (catData.categories || []) as Record<string, unknown>[];
      const catNames: string[] = [];
      const flatten = (items: Record<string, unknown>[]) => {
        items.forEach((c) => {
          catNames.push((c.name as string) || '');
          if (c.children) flatten(c.children as Record<string, unknown>[]);
        });
      };
      flatten(rawCats);
      setCategories(catNames.filter(Boolean));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load saved addresses for checkout
  useEffect(() => {
    api.get<unknown>('/checkout/addresses').then((res) => {
      const d = res.data as Record<string, unknown>;
      const raw = (d.addresses || []) as Record<string, unknown>[];
      setSavedAddresses(raw.map((a) => ({
        id: a.id as string,
        label: `${a.full_name} — ${a.street_address}, ${a.city}`,
        full_name: a.full_name as string,
        phone_number: a.phone_number as string,
        street_address: a.street_address as string,
        city: a.city as string,
        state: a.state as string,
        zipcode: (a.zipcode as string) || '',
      })));
    }).catch(() => {});
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.manufacturer.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  const handleAddToCart = () => {
    if (!selectedProduct || !orderQuantity) { toast.error('Enter quantity'); return; }
    const qty = parseInt(orderQuantity);
    if (isNaN(qty) || qty < selectedProduct.moq) {
      toast.error(`Minimum order is ${selectedProduct.moq} units`); return;
    }
    if (qty > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} units available`); return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === selectedProduct.id);
      if (existing) return prev.map((i) => i.product.id === selectedProduct.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product: selectedProduct, quantity: qty }];
    });
    toast.success('Added to cart');
    setShowOrderModal(false);
    setSelectedProduct(null);
    setOrderQuantity('');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    let shippingAddressId = selectedAddressId !== 'new' ? selectedAddressId : undefined;

    // If using new address, save it first
    if (selectedAddressId === 'new') {
      const { fullName, phone, streetAddress, city, state } = checkoutAddress;
      if (!fullName || !phone || !streetAddress || !city || !state) {
        toast.error('Fill in all required address fields'); return;
      }
      try {
        const res = await api.post<unknown>('/checkout/address', {
          fullName,
          phoneNumber: phone,
          streetAddress,
          city,
          state,
          zipcode: checkoutAddress.zipcode,
          isDefault: savedAddresses.length === 0,
        });
        const saved = res.data as Record<string, unknown>;
        shippingAddressId = (saved.id as string) || '';
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to save address');
        return;
      }
    }

    if (!shippingAddressId) { toast.error('Address required'); return; }

    setPlacingOrder(true);
    try {
      await api.post('/checkout/place-order', { shippingAddressId });
      setCart([]);
      setShowCheckout(false);
      toast.success('Bulk order placed successfully!');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Buy in Bulk</h1>
            <p className="text-gray-600 mt-1">Browse and order from verified manufacturers</p>
          </div>
          {cartCount > 0 && (
            <Button className="bg-[#BE220E] hover:bg-[#9a1b0b] relative" onClick={() => setShowCheckout(true)}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({cartCount})
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState icon={Package} title="No bulk products available" description="Manufacturer products for bulk purchase will appear here." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                <div className="h-48 bg-gray-100">
                  {product.image
                    ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-300" /></div>}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{product.manufacturer}</span>
                  </div>
                  {product.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-[#BE220E]">₦{product.price.toLocaleString()}</span>
                      <div className="text-xs text-gray-500">per unit</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">MOQ: {product.moq}</div>
                      <div className="text-gray-500">{product.stock} in stock</div>
                    </div>
                  </div>
                  <Button className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]" onClick={() => { setSelectedProduct(product); setOrderQuantity(String(product.moq)); setShowOrderModal(true); }}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Order Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-gray-500">{item.quantity} units × ₦{item.product.price.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#BE220E]">₦{(item.product.price * item.quantity).toLocaleString()}</span>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 h-7 w-7 p-0" onClick={() => setCart((p) => p.filter((i) => i.product.id !== item.product.id))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex items-center justify-between">
              <div>
                <span className="text-gray-600">Total: </span>
                <span className="text-2xl font-bold text-[#BE220E]">₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCart([])}>Clear</Button>
                <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]" onClick={() => setShowCheckout(true)}>Checkout</Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Order Quantity Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Product</DialogTitle>
            <DialogDescription>Enter the quantity you want to order</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex gap-3">
                {selectedProduct.image
                  ? <img src={selectedProduct.image} alt={selectedProduct.name} className="w-24 h-24 object-cover rounded-lg" />
                  : <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>}
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">{selectedProduct.manufacturer}</p>
                  <p className="text-xl font-bold text-[#BE220E]">₦{selectedProduct.price.toLocaleString()} / unit</p>
                  <p className="text-sm text-gray-500">Min: {selectedProduct.moq} units</p>
                </div>
              </div>
              <div>
                <Label>Quantity (units)</Label>
                <Input type="number" value={orderQuantity} min={selectedProduct.moq} max={selectedProduct.stock} onChange={(e) => setOrderQuantity(e.target.value)} className="mt-1" />
              </div>
              {orderQuantity && parseInt(orderQuantity) >= selectedProduct.moq && (
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-[#BE220E]">₦{(selectedProduct.price * parseInt(orderQuantity)).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderModal(false)}>Cancel</Button>
            <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]" onClick={handleAddToCart}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Confirm delivery address for your bulk order</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Order summary */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {cart.map((i) => (
                <div key={i.product.id} className="flex justify-between text-sm">
                  <span>{i.product.name} × {i.quantity}</span>
                  <span className="font-medium">₦{(i.product.price * i.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[#BE220E]">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Address selection */}
            {savedAddresses.length > 0 && (
              <div>
                <Label>Delivery Address</Label>
                <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {savedAddresses.map((a) => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                    <SelectItem value="new">+ Enter new address</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* New address form */}
            {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={checkoutAddress.fullName} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, fullName: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input value={checkoutAddress.phone} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, phone: e.target.value })} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Street Address *</Label>
                  <Input value={checkoutAddress.streetAddress} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, streetAddress: e.target.value })} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City *</Label>
                    <Input value={checkoutAddress.city} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, city: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input value={checkoutAddress.state} onChange={(e) => setCheckoutAddress({ ...checkoutAddress, state: e.target.value })} className="mt-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>Cancel</Button>
            <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]" onClick={handlePlaceOrder} disabled={placingOrder}>
              {placingOrder ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

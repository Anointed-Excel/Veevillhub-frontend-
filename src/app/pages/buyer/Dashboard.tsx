import DashboardLayout from '@/app/components/DashboardLayout';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  ShoppingCart,
  Package,
  Heart,
  TrendingUp,
  Tag,
  Star,
  Truck,
  Gift,
  Zap,
  ArrowRight,
  MapPin,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  retailerName?: string;
  rating?: number;
  reviews?: number;
  discount?: number;
}

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartCount, wishlistCount, addToCart, addToWishlist } = useCart();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [dashStats, setDashStats] = useState<{ totalOrders?: number; activeOrders?: number } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    // Load recent orders from API
    api.get<unknown>('/orders?limit=3').then((res) => {
      const data = res.data as Record<string, unknown>;
      const orders = (data.orders || []) as Record<string, unknown>[];
      setRecentOrders(orders.map((o) => ({
        id: o.order_number || o.id,
        items: (o.items as unknown[]) || [],
        total: Number(o.total) || 0,
        status: (o.status as string) || 'pending',
        date: o.created_at,
        estimatedDelivery: o.estimated_delivery,
      })));
    }).catch(() => {}).finally(() => setOrdersLoading(false));

    // Load recommended products from shop
    api.get<unknown>('/shop/products?limit=4').then((res) => {
      const data = res.data as Record<string, unknown>;
      const products = (data.products || []) as Record<string, unknown>[];
      setRecommendedProducts(products.map((p) => ({
        id: p.id as string,
        name: (p.name as string) || '',
        price: Number(p.regular_price) || 0,
        images: p.image_url ? [p.image_url as string] : [],
        category: '',
        discount: p.sales_price ? Math.round((1 - Number(p.sales_price) / Number(p.regular_price)) * 100) : 0,
      })));
    }).catch(() => {}).finally(() => setProductsLoading(false));

    // Load dashboard stats
    api.get<unknown>('/buyer/dashboard').then((res) => {
      setDashStats(res.data as Record<string, unknown>);
    }).catch(() => {});
  }, []);

  const stats = [
    {
      label: 'Active Orders',
      value: recentOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length.toString(),
      icon: ShoppingCart,
      color: '#BE220E',
      description: 'In transit or processing',
      link: '/buyer/orders',
    },
    {
      label: 'Wishlist Items',
      value: wishlistCount.toString(),
      icon: Heart,
      color: '#EC4899',
      description: 'Saved for later',
      link: '/buyer/wishlist',
    },
    {
      label: 'Cart Items',
      value: cartCount.toString(),
      icon: ShoppingBag,
      color: '#2563EB',
      description: 'Ready to checkout',
      link: '/buyer/cart',
    },
    {
      label: 'Total Orders',
      value: (dashStats as any)?.totalOrders?.toString() ?? '—',
      icon: Package,
      color: '#16A34A',
      description: 'All time purchases',
      link: '/buyer/orders',
    },
  ];

  const quickActions = [
    { icon: ShoppingCart, label: 'Continue Shopping', link: '/buyer/shop', color: '#BE220E' },
    { icon: Package, label: 'Track Order', link: '/buyer/orders', color: '#2563EB' },
    { icon: Tag, label: 'View Deals', link: '/buyer/deals', color: '#16A34A' },
    { icon: Heart, label: 'My Wishlist', link: '/buyer/wishlist', color: '#EC4899' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  const handleAddToWishlist = (product: Product) => {
    addToWishlist(product.id);
  };

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#BE220E] to-[#9a1b0b] rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-white/90">Discover amazing deals and shop your favorite products</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} to={stat.link}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center" 
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                  <div className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
                    {stat.value === '—' ? <Skeleton className="h-8 w-20 rounded" /> : stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.description}</div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.link}>
                  <button 
                    className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-[#BE220E] hover:shadow-md transition text-center group"
                  >
                    <div 
                      className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: action.color }} />
                    </div>
                    <div className="text-sm font-medium text-gray-700 group-hover:text-[#BE220E]">
                      {action.label}
                    </div>
                  </button>
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link to="/buyer/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No orders yet"
                description="Start shopping to see your orders here"
                action={{ label: 'Start Shopping', onClick: () => navigate('/buyer/shop') }}
              />
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} to={`/buyer/track-order/${order.id}`}>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {order.items?.[0]?.image && (
                          <img 
                            src={order.items[0].image} 
                            alt={order.items[0].name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">Order #{order.id}</div>
                        <div className="text-sm text-gray-600">
                          {order.items?.length || 0} item(s)
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#BE220E]">
                          ₦{order.total.toLocaleString()}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Flash Deals */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#BE220E]" />
                <h2 className="text-xl font-bold">Flash Deals</h2>
              </div>
              <Link to="/buyer/deals">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Check out our latest deals</p>
              <Link to="/buyer/deals">
                <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                  <Zap className="w-4 h-4 mr-2" /> Explore Deals
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recommended Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#BE220E]" />
              <h2 className="text-xl font-bold">Recommended for You</h2>
            </div>
            <Link to="/buyer/shop">
              <Button variant="outline" size="sm" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <Skeleton className="h-9 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendedProducts.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No recommendations yet"
              description="Browse the shop to discover products you'll love"
              action={{ label: 'Explore Products', onClick: () => navigate('/buyer/shop') }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition group">
                  <Link to={`/buyer/product/${product.id}`}>
                    <div className="relative overflow-hidden bg-gray-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-[#BE220E] text-white px-2 py-1 rounded-lg text-xs font-bold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/buyer/product/${product.id}`}>
                      <h3 className="font-semibold mb-2 hover:text-[#BE220E] line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{product.retailerName}</span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-xl font-bold text-[#BE220E]">
                            ₦{(product.price * (1 - product.discount / 100)).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₦{product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-[#BE220E]">
                          ₦{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-[#BE220E] hover:bg-[#9a1b0b]"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={() => handleAddToWishlist(product)}
                        variant="outline"
                        size="sm"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Shopping Benefits Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Fast Delivery</h3>
            <p className="text-sm text-gray-600">Get your orders delivered within 2-5 business days</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Secure Payment</h3>
            <p className="text-sm text-gray-600">Your payment information is safe and encrypted</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Special Offers</h3>
            <p className="text-sm text-gray-600">Exclusive deals and discounts for loyal customers</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

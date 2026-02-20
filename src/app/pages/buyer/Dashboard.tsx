import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  ShoppingCart, 
  Package, 
  Heart, 
  TrendingUp, 
  Clock,
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
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { cartCount, wishlistCount, addToCart, addToWishlist } = useCart();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);

  useEffect(() => {
    // Load recent orders from localStorage
    const orders = JSON.parse(localStorage.getItem('buyer_orders') || '[]');
    setRecentOrders(orders.slice(0, 3));

    // Load products for recommendations
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Enhanced products with buyer-specific data
    const enhancedProducts = storedProducts.map((p: any) => ({
      ...p,
      retailerName: p.retailerName || 'Test Retailer',
      rating: p.rating || (Math.random() * 2 + 3).toFixed(1),
      reviews: p.reviews || Math.floor(Math.random() * 500) + 50,
      discount: p.discount || (Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 10 : 0),
    }));

    // Get recommended products (random selection)
    const recommended = enhancedProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    setRecommendedProducts(recommended);

    // Get flash deals (products with highest discount)
    const deals = enhancedProducts
      .filter((p: Product) => p.discount && p.discount > 0)
      .sort((a: Product, b: Product) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 3);
    setFlashDeals(deals);
  }, []);

  const stats = [
    { 
      label: 'Active Orders', 
      value: recentOrders.filter(o => o.status !== 'delivered').length.toString(), 
      icon: ShoppingCart, 
      color: '#BE220E', 
      description: 'In transit or processing',
      link: '/buyer/orders' 
    },
    { 
      label: 'Wishlist Items', 
      value: wishlistCount.toString(), 
      icon: Heart, 
      color: '#EC4899', 
      description: 'Saved for later',
      link: '/buyer/wishlist' 
    },
    { 
      label: 'Cart Items', 
      value: cartCount.toString(), 
      icon: ShoppingBag, 
      color: '#2563EB', 
      description: 'Ready to checkout',
      link: '/buyer/cart' 
    },
    { 
      label: 'Total Orders', 
      value: recentOrders.length.toString(), 
      icon: Package, 
      color: '#16A34A', 
      description: 'All time purchases',
      link: '/buyer/orders' 
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
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      quantity: 1,
      image: product.images[0],
      retailerId: '3',
      retailerName: product.retailerName || 'Test Retailer',
    });
  };

  const handleAddToWishlist = (product: Product) => {
    addToWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      retailerId: '3',
      retailerName: product.retailerName || 'Test Retailer',
    });
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
                    {stat.value}
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
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link to="/buyer/shop">
                  <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} to={`/buyer/order-tracking/${order.id}`}>
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
            
            {flashDeals.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No deals available right now</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flashDeals.map((product) => (
                  <Link key={product.id} to={`/buyer/product/${product.id}`}>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.discount > 0 && (
                          <div className="absolute top-1 right-1 bg-[#BE220E] text-white px-2 py-0.5 rounded text-xs font-bold">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate mb-1">{product.name}</div>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-[#BE220E]">
                            ₦{(product.price * (1 - (product.discount || 0) / 100)).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            ₦{product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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

          {recommendedProducts.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No recommendations yet</p>
              <Link to="/buyer/shop">
                <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                  Explore Products
                </Button>
              </Link>
            </div>
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

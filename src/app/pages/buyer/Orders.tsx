import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import {
  ArrowLeft,
  Package,
  Search,
  MapPin,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Filter,
  Home,
  Heart,
  User,
  ShoppingCart,
} from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';

interface Order {
  id: string;
  items: any[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: any;
  paymentMethod: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

export default function BuyerOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    api.get<unknown>('/orders').then((res) => {
      const data = res.data as Record<string, unknown>;
      const raw = (data.orders || []) as Record<string, unknown>[];
      const mapped: Order[] = raw.map((o) => ({
        id: (o.order_number as string) || (o.id as string),
        items: (o.items as any[]) || [],
        subtotal: Number(o.subtotal) || 0,
        shippingFee: Number(o.shipping_fee) || 0,
        total: Number(o.total) || 0,
        status: (o.status as Order['status']) || 'pending',
        createdAt: (o.created_at as string) || '',
        estimatedDelivery: (o.estimated_delivery as string) || '',
        shippingAddress: o.shipping_address || {},
        paymentMethod: (o.payment_method as string) || '',
      }));
      setOrders(mapped);
      setFilteredOrders(mapped);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/buyer" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#BE220E] rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">My Orders</h1>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="px-4 pb-2 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-[#BE220E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({getStatusCount('all')})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-[#BE220E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({getStatusCount('pending')})
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                statusFilter === 'processing'
                  ? 'bg-[#BE220E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Processing ({getStatusCount('processing')})
            </button>
            <button
              onClick={() => setStatusFilter('shipped')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                statusFilter === 'shipped'
                  ? 'bg-[#BE220E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Shipped ({getStatusCount('shipped')})
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                statusFilter === 'delivered'
                  ? 'bg-[#BE220E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Delivered ({getStatusCount('delivered')})
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between mb-4 pb-4 border-b">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <Skeleton className="h-3 w-1/4 rounded" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded" />
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title={searchQuery || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}
            description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or status filter.' : 'Start shopping to see your orders here.'}
            action={
              searchQuery || statusFilter !== 'all'
                ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setStatusFilter('all'); } }
                : { label: 'Start Shopping', onClick: () => navigate('/buyer/shop') }
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              const statusColor = statusConfig[order.status].color;
              const statusBg = statusConfig[order.status].bg;
              const statusLabel = statusConfig[order.status].label;

              return (
                <Card key={order.id} className="p-4 hover:shadow-lg transition">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order #{order.id}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${statusBg}`}>
                      <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                      <span className={`text-sm font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/buyer/product/${item.productId}`}
                            className="font-medium hover:text-[#BE220E] line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold text-[#BE220E]">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600 pl-2">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-[#BE220E]">
                        ₦{order.total.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <Link to={`/buyer/track-order/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Truck className="w-4 h-4 mr-1" />
                            Track Order
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // View order details (can expand this later)
                          navigate(`/buyer/track-order/${order.id}`);
                        }}
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4" />
                      <span>
                        Estimated delivery:{' '}
                        <span className="font-medium text-gray-900">
                          {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around">
          <Link to="/buyer" className="flex flex-col items-center gap-1 text-gray-600">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/buyer/orders"
            className="flex flex-col items-center gap-1 text-[#BE220E]"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link
            to="/buyer/wishlist"
            className="flex flex-col items-center gap-1 text-gray-600"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Wishlist</span>
          </Link>
          <Link
            to="/buyer/profile"
            className="flex flex-col items-center gap-1 text-gray-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

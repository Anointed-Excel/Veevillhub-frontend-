import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Share2,
  Home,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils/clipboard';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  trackingNumber?: string;
}

interface TrackingStep {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  icon: any;
}

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);

  useEffect(() => {
    if (!id) return;

    const statusMap: Record<string, Order['status']> = {
      pending_payment: 'pending',
      confirmed: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };

    api.get<unknown>(`/orders/${id}`).then((res) => {
      const raw = res.data as Record<string, unknown>;
      const addr = (raw.shipping_address || {}) as Record<string, unknown>;
      const rawItems = (raw.items || []) as Record<string, unknown>[];

      const mapped: Order = {
        id: (raw.id as string) || '',
        orderNumber: (raw.order_number as string) || (raw.id as string) || '',
        subtotal: Number(raw.subtotal) || 0,
        shippingFee: Number(raw.shipping_fee) || 0,
        total: Number(raw.total) || 0,
        status: statusMap[(raw.status as string) || ''] || 'pending',
        createdAt: (raw.created_at as string) || new Date().toISOString(),
        estimatedDelivery: new Date(
          new Date((raw.created_at as string) || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        shippingAddress: {
          fullName: (addr.full_name as string) || '',
          phone: (addr.phone_number as string) || '',
          address: (addr.street_address as string) || '',
          city: (addr.city as string) || '',
          state: (addr.state as string) || '',
          zipCode: (addr.zipcode as string) || '',
        },
        items: rawItems.map((item) => ({
          id: (item.id as string) || '',
          productId: (item.product_id as string) || '',
          name: (item.product_name as string) || '',
          image: (item.product_image as string) || '',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        })),
      };

      setOrder(mapped);
      setTrackingSteps(generateTrackingSteps(mapped));
    }).catch(() => {});
  }, [id]);

  const generateTrackingSteps = (order: Order): TrackingStep[] => {
    const baseSteps = [
      {
        title: 'Order Placed',
        description: 'Your order has been received and confirmed',
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        completed: true,
        icon: CheckCircle,
      },
      {
        title: 'Processing',
        description: 'Your order is being prepared for shipment',
        date: new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
        icon: Package,
      },
      {
        title: 'Shipped',
        description: 'Your order is on the way',
        date: new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        completed: ['shipped', 'delivered'].includes(order.status),
        icon: Truck,
      },
      {
        title: 'Delivered',
        description: 'Order delivered successfully',
        date: new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        completed: order.status === 'delivered',
        icon: CheckCircle,
      },
    ];

    if (order.status === 'cancelled') {
      return [
        baseSteps[0],
        {
          title: 'Cancelled',
          description: 'Your order has been cancelled',
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          completed: true,
          icon: CheckCircle,
        },
      ];
    }

    return baseSteps;
  };

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      toast.success('Order tracking link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/buyer/orders">
            <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">View My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const trackingNumber = order.trackingNumber || `TRK${order.orderNumber.slice(-10).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Link to="/buyer" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#BE220E] rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden md:inline">VeevillHub</span>
          </Link>
          <div className="flex-1"></div>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        {/* Order Summary Card */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
              <p className="text-gray-600">Order #{order.orderNumber}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
              <p className="font-bold text-lg mb-2">{trackingNumber}</p>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'shipped'
                    ? 'bg-purple-100 text-purple-700'
                    : order.status === 'processing'
                    ? 'bg-blue-100 text-blue-700'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                <span className="text-sm font-medium capitalize">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Estimated Delivery */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Estimated Delivery</p>
                <p className="text-sm text-blue-700">
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Tracking Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Order Timeline</h2>

          <div className="relative">
            {trackingSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === trackingSteps.length - 1;

              return (
                <div key={index} className="relative pb-8 last:pb-0">
                  {/* Connector Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-5 top-11 w-0.5 h-full ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            step.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <span
                          className={`text-sm ${
                            step.completed ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {step.date}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          step.completed ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <Link to={`/buyer/product/${item.productId}`} className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/buyer/product/${item.productId}`}
                      className="font-semibold hover:text-[#BE220E] line-clamp-2 mb-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-[#BE220E]">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="font-medium">
                  {order.shippingFee === 0 ? 'Free' : `₦${order.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#BE220E]">₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Delivery & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-[#BE220E] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    {order.shippingAddress.zipCode && <p>{order.shippingAddress.zipCode}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#BE220E] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <p className="text-sm text-gray-600 capitalize">Online Payment</p>
              <p className="text-sm text-green-600 font-medium mt-2">✓ Payment Confirmed</p>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {order.status !== 'cancelled' && (
                <>
                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Tracking Link
                  </Button>
                  <Link to="/buyer/orders">
                    <Button variant="outline" className="w-full">
                      <Package className="w-4 h-4 mr-2" />
                      View All Orders
                    </Button>
                  </Link>
                </>
              )}
              <Link to="/buyer">
                <Button className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <Card className="p-6 mt-6 bg-gray-50">
          <h3 className="font-semibold mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#BE220E] flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium mb-1">Customer Support</p>
                <p className="text-sm text-gray-600">+234 800 123 4567</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#BE220E] flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium mb-1">Email Support</p>
                <p className="text-sm text-gray-600">support@anointed.com</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

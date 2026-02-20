import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Bell,
  Package,
  Tag,
  Heart,
  TrendingDown,
  Truck,
  CheckCircle,
  AlertCircle,
  Info,
  Gift,
  Zap,
  Star,
  Clock,
  ShoppingCart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'order' | 'price_drop' | 'wishlist' | 'promo' | 'delivery' | 'review' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLink?: string;
  actionText?: string;
  metadata?: any;
}

export default function BuyerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Generate mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'order',
        title: 'Order Shipped',
        message: 'Your order #12345 has been shipped and is on the way!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        read: false,
        actionLink: '/buyer/order-tracking/12345',
        actionText: 'Track Order',
      },
      {
        id: '2',
        type: 'price_drop',
        title: 'Price Drop Alert! 💰',
        message: 'Premium Wireless Headphones is now 25% off! Only ₦45,000',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        actionLink: '/buyer/product/prod-123',
        actionText: 'View Product',
      },
      {
        id: '3',
        type: 'wishlist',
        title: 'Wishlist Item Back in Stock',
        message: 'Great news! "Designer Sunglasses" from your wishlist is back in stock.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        read: false,
        actionLink: '/buyer/wishlist',
        actionText: 'View Wishlist',
      },
      {
        id: '4',
        type: 'promo',
        title: 'Flash Sale Starting Soon! ⚡',
        message: 'Flash sale on Electronics category starts in 1 hour. Up to 70% off!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        read: true,
        actionLink: '/buyer/deals',
        actionText: 'Shop Now',
      },
      {
        id: '5',
        type: 'delivery',
        title: 'Order Delivered',
        message: 'Your order #12340 has been delivered. Thank you for shopping with us!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        actionLink: '/buyer/orders',
        actionText: 'View Order',
      },
      {
        id: '6',
        type: 'review',
        title: 'Rate Your Recent Purchase',
        message: 'How was your experience with "Smart Watch Pro"? Share your review.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        read: true,
        actionLink: '/buyer/orders',
        actionText: 'Write Review',
      },
      {
        id: '7',
        type: 'promo',
        title: 'Exclusive Offer for You! 🎁',
        message: 'Get 15% off on your next purchase. Use code: LOYAL15',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        read: true,
        actionLink: '/buyer/shop',
        actionText: 'Start Shopping',
      },
      {
        id: '8',
        type: 'order',
        title: 'Order Confirmed',
        message: 'We\'ve received your order #12350. Processing will begin shortly.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
        read: true,
        actionLink: '/buyer/orders',
        actionText: 'View Details',
      },
      {
        id: '9',
        type: 'price_drop',
        title: 'Price Drop on Watched Item',
        message: 'Running Shoes you viewed is now 30% cheaper at ₦28,000',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        read: true,
        actionLink: '/buyer/product/prod-456',
        actionText: 'Check it Out',
      },
      {
        id: '10',
        type: 'general',
        title: 'Welcome to VeeVill Hub!',
        message: 'Thank you for joining us. Explore thousands of products from trusted retailers.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
        read: true,
        actionLink: '/buyer/shop',
        actionText: 'Explore',
      },
    ];

    // Load from localStorage or use mock data
    const stored = localStorage.getItem('buyer_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(mockNotifications);
      localStorage.setItem('buyer_notifications', JSON.stringify(mockNotifications));
    }
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return Package;
      case 'price_drop': return TrendingDown;
      case 'wishlist': return Heart;
      case 'promo': return Tag;
      case 'delivery': return Truck;
      case 'review': return Star;
      case 'general': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-600';
      case 'price_drop': return 'bg-green-100 text-green-600';
      case 'wishlist': return 'bg-pink-100 text-pink-600';
      case 'promo': return 'bg-purple-100 text-purple-600';
      case 'delivery': return 'bg-orange-100 text-orange-600';
      case 'review': return 'bg-yellow-100 text-yellow-600';
      case 'general': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('buyer_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('buyer_notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('buyer_notifications', JSON.stringify(updated));
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filters = [
    { id: 'all', name: 'All', icon: Bell, count: notifications.length },
    { id: 'unread', name: 'Unread', icon: AlertCircle, count: unreadCount },
    { id: 'order', name: 'Orders', icon: Package, count: notifications.filter(n => n.type === 'order').length },
    { id: 'price_drop', name: 'Price Drops', icon: TrendingDown, count: notifications.filter(n => n.type === 'price_drop').length },
    { id: 'promo', name: 'Promotions', icon: Tag, count: notifications.filter(n => n.type === 'promo').length },
  ];

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Stay updated with your orders and special offers
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{notifications.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'price_drop').length}
                </div>
                <div className="text-sm text-gray-600">Price Alerts</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'promo').length}
                </div>
                <div className="text-sm text-gray-600">Promotions</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  filter === f.id
                    ? 'bg-[#BE220E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.name}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  filter === f.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
            <Link to="/buyer/shop">
              <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <Card
                  key={notification.id}
                  className={`p-4 transition hover:shadow-md ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-[#BE220E]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-[#BE220E] rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(notification.timestamp)}
                        </div>
                        <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {notification.actionLink && (
                        <Link to={notification.actionLink}>
                          <Button
                            size="sm"
                            className="bg-[#BE220E] hover:bg-[#9a1b0b] whitespace-nowrap"
                            onClick={() => markAsRead(notification.id)}
                          >
                            {notification.actionText || 'View'}
                          </Button>
                        </Link>
                      )}
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Notification Preferences */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="font-bold text-lg mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Order Updates</div>
                  <div className="text-sm text-gray-600">Get notified about order status changes</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BE220E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BE220E]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Price Drop Alerts</div>
                  <div className="text-sm text-gray-600">Notify when prices drop on watched items</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BE220E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BE220E]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium">Promotional Offers</div>
                  <div className="text-sm text-gray-600">Receive updates about deals and promotions</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BE220E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BE220E]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-600" />
                <div>
                  <div className="font-medium">Wishlist Updates</div>
                  <div className="text-sm text-gray-600">Get notified when wishlist items are restocked</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#BE220E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BE220E]"></div>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

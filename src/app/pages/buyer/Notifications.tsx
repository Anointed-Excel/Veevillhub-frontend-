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
  Star,
  Clock,
  ShoppingCart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';

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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadNotifications = () => {
    setLoading(true);
    api.get<unknown>('/notifications').then((res) => {
      const data = res.data as Record<string, unknown>;
      const raw = (data.notifications || res.data) as Record<string, unknown>[];
      if (Array.isArray(raw)) {
        setNotifications(raw.map((n) => ({
          id: n.id as string,
          type: ((n.type as string) || 'general') as Notification['type'],
          title: (n.title as string) || '',
          message: (n.message as string) || '',
          timestamp: (n.created_at as string) || new Date().toISOString(),
          read: !!(n.is_read),
          actionLink: (n.action_link as string) || undefined,
          actionText: (n.action_text as string) || undefined,
        })));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadNotifications(); }, []);

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

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to mark all as read');
    }
  };

  const deleteNotification = (id: string) => {
    // No delete endpoint in backend — just hide locally
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/4 rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
            description={filter === 'unread' ? 'No unread notifications.' : 'Notifications about your orders and deals will appear here.'}
            action={filter !== 'all' ? { label: 'Show All', onClick: () => setFilter('all') } : undefined}
          />
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

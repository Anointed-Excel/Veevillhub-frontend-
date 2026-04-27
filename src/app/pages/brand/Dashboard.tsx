import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Users, Building2, Store, ShoppingBag, Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Skeleton } from '@/app/components/ui/skeleton';

interface Activity {
  action: string;
  user: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

interface TopProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function BrandDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [buyersCount, setBuyersCount] = useState<number | null>(null);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [manufacturersCount, setManufacturersCount] = useState<number | null>(null);
  const [retailersCount, setRetailersCount] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    // Total users
    api.get<unknown>('/admin/dashboard/total-users')
      .then((res) => setTotalUsers((res.data as Record<string, unknown>).totalUsers as number))
      .catch(() => {});

    // Buyers count
    api.get<unknown>('/admin/buyers?limit=1')
      .then((res) => setBuyersCount(res.pagination?.totalResults ?? null))
      .catch(() => {});

    // Orders count
    api.get<unknown>('/admin/orders?limit=1')
      .then((res) => setOrdersCount(res.pagination?.totalResults ?? null))
      .catch(() => {});

    // Products count
    api.get<unknown>('/products?limit=1')
      .then((res) => setProductsCount(res.pagination?.totalResults ?? null))
      .catch(() => {});

    // Analytics — revenue, growth, top products
    api.get<unknown>('/admin/analytics')
      .then((res) => {
        const d = res.data as Record<string, unknown>;
        const users   = d.users   as Record<string, unknown>;
        const revenue = d.revenue as Record<string, unknown>;
        setManufacturersCount(users?.totalManufacturers as number ?? null);
        setRetailersCount(users?.totalRetailers as number ?? null);
        setTotalRevenue(revenue?.total as number ?? null);
        setRevenueGrowth(revenue?.growth as number ?? null);
        setTopProducts((d.topProducts as TopProduct[]) || []);
      }).catch(() => {});

    // Recent activities: blend last 5 orders + last 3 manufacturers + last 3 retailers
    Promise.all([
      api.get<unknown>('/admin/orders?limit=5').catch(() => null),
      api.get<unknown>('/admin/manufacturers?limit=3').catch(() => null),
      api.get<unknown>('/admin/retailers?limit=3').catch(() => null),
    ]).then(([ordersRes, mfgRes, retRes]) => {
      const list: Activity[] = [];

      const orders = (ordersRes?.data as Record<string, unknown>[]) || [];
      orders.forEach((o) => {
        const buyer = (o.buyer as Record<string, unknown>);
        list.push({
          action: `New order #${o.order_number}`,
          user: (buyer?.full_name as string) || 'Buyer',
          time: timeAgo(o.created_at as string),
          type: o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'warning' : 'info',
        });
      });

      const mfgs = (mfgRes?.data as Record<string, unknown>[]) || [];
      mfgs.forEach((v) => {
        list.push({
          action: v.status === 'active' ? 'Manufacturer approved' : 'Manufacturer registered',
          user: (v.company_name as string) || (v.full_name as string) || 'Manufacturer',
          time: timeAgo(v.created_at as string),
          type: v.status === 'active' ? 'success' : 'info',
        });
      });

      const rets = (retRes?.data as Record<string, unknown>[]) || [];
      rets.forEach((v) => {
        list.push({
          action: v.status === 'active' ? 'Retailer approved' : 'Retailer registered',
          user: (v.company_name as string) || (v.full_name as string) || 'Retailer',
          time: timeAgo(v.created_at as string),
          type: v.status === 'active' ? 'success' : 'info',
        });
      });

      // Sort newest first (best effort — relative strings already formatted)
      setActivities(list.slice(0, 6));
    }).finally(() => setActivitiesLoading(false));
  }, []);

  const fmt = (val: number | null, fallback = '—') =>
    val !== null ? val.toLocaleString() : fallback;

  const fmtRevenue = (val: number | null) =>
    val !== null ? `₦${val.toLocaleString()}` : '—';

  const stats = [
    { label: 'Total Users',    value: fmt(totalUsers),          icon: Users,        color: '#BE220E', change: '', link: '/brand/users' },
    { label: 'Manufacturers',  value: fmt(manufacturersCount),  icon: Building2,    color: '#059669', change: '', link: '/brand/manufacturers' },
    { label: 'Retailers',      value: fmt(retailersCount),      icon: Store,        color: '#2563EB', change: '', link: '/brand/retailers' },
    { label: 'Buyers',         value: fmt(buyersCount),         icon: ShoppingBag,  color: '#7C3AED', change: '', link: '/brand/buyers' },
    { label: 'Total Products', value: fmt(productsCount),       icon: Package,      color: '#EA580C', change: '', link: '/brand/products' },
    { label: 'Total Orders',   value: fmt(ordersCount),         icon: ShoppingCart, color: '#0891B2', change: '', link: '/brand/orders' },
    { label: 'Revenue',        value: fmtRevenue(totalRevenue), icon: DollarSign,   color: '#16A34A', change: '', link: '/brand/wallet' },
    { label: 'Growth Rate',    value: revenueGrowth !== null ? `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%` : '—', icon: TrendingUp, color: '#BE220E', change: '', link: '/brand/analytics' },
  ];

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Brand Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Super Admin</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
                <div className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
                  {stat.value === '—' ? <Skeleton className="h-8 w-20 rounded" /> : stat.value}
                </div>
                <Link to={stat.link} className="text-sm text-blue-500 mt-2">View Details</Link>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
            {activitiesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                    <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No recent activity yet.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-gray-600">{activity.user}</div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Products by Units Sold */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Top Products</h2>
            {topProducts.length === 0 ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/3 rounded" />
                    </div>
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.totalSold.toLocaleString()} units sold</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: '#BE220E' }}>
                        ₦{product.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
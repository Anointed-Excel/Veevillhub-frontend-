import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Users, Building2, Store, ShoppingBag, Package, ShoppingCart, TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function BrandDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [buyersCount, setBuyersCount] = useState<number | null>(null);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [manufacturersCount, setManufacturersCount] = useState<number | null>(null);
  const [retailersCount, setRetailersCount] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<number | null>(null);

  useEffect(() => {
    // Total users
    api.get<unknown>('/admin/dashboard/total-users')
      .then((res) => setTotalUsers((res.data as Record<string, unknown>).totalUsers as number))
      .catch(() => {});

    // Buyers count — pagination is at res.pagination (top level), not inside res.data
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

    // Analytics for manufacturers, retailers, revenue, growth
    api.get<unknown>('/admin/analytics')
      .then((res) => {
        const d = res.data as Record<string, unknown>;
        const users = d.users as Record<string, unknown>;
        const revenue = d.revenue as Record<string, unknown>;
        setManufacturersCount(users?.totalManufacturers as number ?? null);
        setRetailersCount(users?.totalRetailers as number ?? null);
        setTotalRevenue(revenue?.total as number ?? null);
        setRevenueGrowth(revenue?.growth as number ?? null);
      }).catch(() => {});
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

  const recentActivities = [
    { action: 'New manufacturer approved', user: 'Alaro Foods Ltd', time: '2 min ago', type: 'success' },
    { action: 'Product uploaded', user: 'Golden Pasta Co.', time: '15 min ago', type: 'info' },
    { action: 'Order completed', user: 'Buyer #1234', time: '1 hour ago', type: 'success' },
    { action: 'Withdrawal processed', user: 'Lagos Retailers', time: '2 hours ago', type: 'warning' },
    { action: 'New retailer registered', user: 'Sunny Mart', time: '3 hours ago', type: 'info' },
  ];

  const topPerformers = [
    { name: 'Golden Pasta Co.', type: 'Manufacturer', revenue: '$45,890', growth: '+34%' },
    { name: 'Lagos Mega Store', type: 'Retailer', revenue: '$38,450', growth: '+28%' },
    { name: 'Alaro Foods Ltd', type: 'Manufacturer', revenue: '$32,100', growth: '+22%' },
    { name: 'Sunny Mart Network', type: 'Retailer', revenue: '$29,780', growth: '+19%' },
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
                  {stat.value}
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
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
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
          </Card>

          {/* Top Performers */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Top Performers</h2>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{performer.name}</div>
                    <div className="text-sm text-gray-600">{performer.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: '#BE220E' }}>{performer.revenue}</div>
                    <div className="text-sm text-green-600">{performer.growth}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
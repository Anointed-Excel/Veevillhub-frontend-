import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign, Building2, Store, Download, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface AnalyticsData {
  revenue: { total: number; thisMonth: number; lastMonth: number; growth: number };
  orders: { total: number; thisMonth: number; pending: number; completed: number };
  users: { total: number; totalBuyers: number; totalManufacturers: number; totalRetailers: number; newThisMonth: number };
  products: { total: number; active: number; outOfStock: number };
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; totalSold: number; revenue: number }[];
  ordersByStatus: Record<string, number>;
}

export default function BrandAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsData>('/admin/analytics')
      .then((res) => setData(res.data as unknown as AnalyticsData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="brand">
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  const avgOrderValue = data && data.orders.total > 0
    ? (data.revenue.total / data.orders.total)
    : 0;

  const metrics = [
    {
      label: 'Total Revenue',
      value: data ? `₦${data.revenue.total.toLocaleString()}` : '—',
      change: data ? `${data.revenue.growth >= 0 ? '+' : ''}${data.revenue.growth}%` : '—',
      trend: data && data.revenue.growth >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: '#16A34A',
    },
    {
      label: 'Total Orders',
      value: data ? data.orders.total.toLocaleString() : '—',
      change: data ? `+${data.orders.thisMonth} this month` : '—',
      trend: 'up',
      icon: ShoppingCart,
      color: '#2563EB',
    },
    {
      label: 'Total Users',
      value: data ? data.users.total.toLocaleString() : '—',
      change: data ? `+${data.users.newThisMonth} this month` : '—',
      trend: 'up',
      icon: Users,
      color: '#BE220E',
    },
    {
      label: 'Active Products',
      value: data ? data.products.active.toLocaleString() : '—',
      change: data ? `${data.products.outOfStock} out of stock` : '—',
      trend: 'up',
      icon: Package,
      color: '#7C3AED',
    },
    {
      label: 'Avg Order Value',
      value: data ? `₦${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—',
      change: '',
      trend: 'up',
      icon: TrendingUp,
      color: '#EA580C',
    },
    {
      label: 'Pending Orders',
      value: data ? data.orders.pending.toLocaleString() : '—',
      change: data ? `${data.orders.completed} completed` : '—',
      trend: 'down',
      icon: TrendingDown,
      color: '#DC2626',
    },
  ];

  const monthlyData = data?.revenueByMonth || [];
  const topProducts = data?.topProducts || [];

  const userGrowth = data ? [
    { type: 'Manufacturers', total: data.users.totalManufacturers },
    { type: 'Retailers',     total: data.users.totalRetailers },
    { type: 'Buyers',        total: data.users.totalBuyers },
  ] : [];

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: metric.color }} />
                  </div>
                  {metric.change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {metric.change}
                    </div>
                  )}
                </div>
                <div className="text-gray-600 text-sm">{metric.label}</div>
                <div className="text-3xl font-bold mt-2" style={{ color: metric.color }}>
                  {metric.value}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Top Selling Products + Orders by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No sales data available yet.</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <div className="w-8 h-8 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.totalSold} units sold</div>
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

          {/* Orders by Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Orders by Status</h2>
            {data?.ordersByStatus ? (
              <div className="space-y-3">
                {Object.entries(data.ordersByStatus).map(([status, count]) => {
                  const total = data.orders.total || 1;
                  const pct = Math.round((count / total) * 100);
                  const colors: Record<string, string> = {
                    pending_payment: '#F59E0B',
                    confirmed:       '#3B82F6',
                    shipped:         '#8B5CF6',
                    delivered:       '#10B981',
                    cancelled:       '#EF4444',
                  };
                  const color = colors[status] || '#6B7280';
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                        <span className="text-sm font-bold" style={{ color }}>{count.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4">No order data available yet.</p>
            )}
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Monthly Performance (Last 6 Months)</h2>
          {monthlyData.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No monthly data available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Revenue Chart */}
                <div className="mb-8">
                  <div className="text-sm font-medium text-gray-600 mb-2">Revenue Trend</div>
                  <div className="h-48 flex items-end gap-2">
                    {monthlyData.map((d) => {
                      const maxRev = Math.max(...monthlyData.map((x) => x.revenue), 1);
                      const height = (d.revenue / maxRev) * 100;
                      return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full relative group">
                            <div
                              className="w-full rounded-t transition-all cursor-pointer hover:opacity-80"
                              style={{ height: `${height}%`, backgroundColor: '#BE220E', minHeight: '4px' }}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              ₦{d.revenue.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 font-medium">{d.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Orders Chart */}
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Orders Trend</div>
                  <div className="h-32 flex items-end gap-2">
                    {monthlyData.map((d) => {
                      const maxOrd = Math.max(...monthlyData.map((x) => x.orders), 1);
                      const height = (d.orders / maxOrd) * 100;
                      return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full relative group">
                            <div
                              className="w-full rounded-t transition-all cursor-pointer hover:opacity-80"
                              style={{ height: `${height}%`, backgroundColor: '#2563EB', minHeight: '4px' }}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              {d.orders} orders
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 font-medium">{d.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* User Breakdown */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">User Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userGrowth.map((u) => (
              <div key={u.type} className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#BE220E15' }}>
                  {u.type === 'Manufacturers' ? (
                    <Building2 className="w-8 h-8" style={{ color: '#BE220E' }} />
                  ) : u.type === 'Retailers' ? (
                    <Store className="w-8 h-8" style={{ color: '#BE220E' }} />
                  ) : (
                    <Users className="w-8 h-8" style={{ color: '#BE220E' }} />
                  )}
                </div>
                <h3 className="font-semibold text-gray-700">{u.type}</h3>
                <div className="text-3xl font-bold mt-2" style={{ color: '#BE220E' }}>
                  {u.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-sm text-green-700 mb-1">Total Revenue (All Time)</div>
            <div className="text-2xl font-bold text-green-900">
              {data ? `₦${data.revenue.total.toLocaleString()}` : '—'}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-sm text-blue-700 mb-1">Revenue This Month</div>
            <div className="text-2xl font-bold text-blue-900">
              {data ? `₦${data.revenue.thisMonth.toLocaleString()}` : '—'}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-sm text-purple-700 mb-1">Orders This Month</div>
            <div className="text-2xl font-bold text-purple-900">
              {data ? data.orders.thisMonth.toLocaleString() : '—'}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

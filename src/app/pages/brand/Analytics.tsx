import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign, Building2, Store, Download, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function BrandAnalytics() {
  const [timeRange, setTimeRange] = useState('30days');
  const [compareWith, setCompareWith] = useState('previous');

  const metrics = [
    {
      label: 'Total Revenue',
      value: '$485,678',
      change: '+31.2%',
      trend: 'up',
      icon: DollarSign,
      color: '#16A34A',
    },
    {
      label: 'Total Orders',
      value: '12,890',
      change: '+27.5%',
      trend: 'up',
      icon: ShoppingCart,
      color: '#2563EB',
    },
    {
      label: 'Active Users',
      value: '2,847',
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      color: '#BE220E',
    },
    {
      label: 'Products Sold',
      value: '45,234',
      change: '+18.9%',
      trend: 'up',
      icon: Package,
      color: '#7C3AED',
    },
    {
      label: 'Avg Order Value',
      value: '$376.82',
      change: '+5.4%',
      trend: 'up',
      icon: TrendingUp,
      color: '#EA580C',
    },
    {
      label: 'Conversion Rate',
      value: '3.24%',
      change: '-0.8%',
      trend: 'down',
      icon: TrendingDown,
      color: '#DC2626',
    },
  ];

  const revenueByCategory = [
    { category: 'Food & Beverage', revenue: 185430, percentage: 38.2, color: '#BE220E' },
    { category: 'Textiles', revenue: 145890, percentage: 30.0, color: '#2563EB' },
    { category: 'Electronics', revenue: 97234, percentage: 20.0, color: '#7C3AED' },
    { category: 'Accessories', revenue: 35670, percentage: 7.3, color: '#EA580C' },
    { category: 'Others', revenue: 21454, percentage: 4.5, color: '#6B7280' },
  ];

  const topSellingProducts = [
    { name: 'VeeVill Premium Rice', sold: 4523, revenue: 207908, growth: 34 },
    { name: 'Golden Pasta Spaghetti', sold: 3821, revenue: 49633, growth: 28 },
    { name: 'African Print Fabric', sold: 2156, revenue: 193964, growth: 22 },
    { name: 'VeeVill Cooking Oil', sold: 2890, revenue: 67915, growth: 19 },
    { name: 'Artisan Coffee Beans', sold: 1934, revenue: 30924, growth: 15 },
  ];

  const salesBySellerType = [
    { type: 'Brand', orders: 4234, revenue: 178456, percentage: 36.7 },
    { type: 'Manufacturers', orders: 5678, revenue: 198234, percentage: 40.8 },
    { type: 'Retailers', orders: 2978, revenue: 108988, percentage: 22.5 },
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 38450, orders: 1023 },
    { month: 'Feb', revenue: 42130, orders: 1145 },
    { month: 'Mar', revenue: 45780, orders: 1289 },
    { month: 'Apr', revenue: 48920, orders: 1367 },
    { month: 'May', revenue: 52340, orders: 1456 },
    { month: 'Jun', revenue: 49870, orders: 1398 },
    { month: 'Jul', revenue: 55230, orders: 1523 },
    { month: 'Aug', revenue: 58940, orders: 1645 },
    { month: 'Sep', revenue: 61780, orders: 1734 },
    { month: 'Oct', revenue: 64120, orders: 1812 },
    { month: 'Nov', revenue: 68450, orders: 1956 },
    { month: 'Dec', revenue: 72890, orders: 2089 },
  ];

  const userGrowth = [
    { type: 'Manufacturers', total: 156, new: 12, growth: 8.3 },
    { type: 'Retailers', total: 892, new: 67, growth: 8.1 },
    { type: 'Buyers', total: 1799, new: 234, growth: 15.0 },
  ];

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: metric.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {metric.change}
                  </div>
                </div>
                <div className="text-gray-600 text-sm">{metric.label}</div>
                <div className="text-3xl font-bold mt-2" style={{ color: metric.color }}>
                  {metric.value}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Revenue by Category</h2>
            <div className="space-y-4">
              {revenueByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>
                      ${item.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.percentage}% of total revenue</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Selling Products */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
            <div className="space-y-4">
              {topSellingProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.sold} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: '#BE220E' }}>
                      ${product.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">+{product.growth}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sales by Seller Type */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Sales by Seller Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {salesBySellerType.map((seller) => (
              <div key={seller.type} className="text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#BE220E15' }}>
                  {seller.type === 'Brand' ? (
                    <Store className="w-10 h-10" style={{ color: '#BE220E' }} />
                  ) : seller.type === 'Manufacturers' ? (
                    <Building2 className="w-10 h-10" style={{ color: '#BE220E' }} />
                  ) : (
                    <Store className="w-10 h-10" style={{ color: '#BE220E' }} />
                  )}
                </div>
                <h3 className="font-bold text-lg">{seller.type}</h3>
                <div className="text-2xl font-bold mt-2" style={{ color: '#BE220E' }}>
                  ${seller.revenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">{seller.orders} orders</div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${seller.percentage}%`, backgroundColor: '#BE220E' }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{seller.percentage}% of total</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Performance */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Monthly Performance (2024)</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Revenue Chart */}
              <div className="mb-8">
                <div className="text-sm font-medium text-gray-600 mb-2">Revenue Trend</div>
                <div className="h-48 flex items-end gap-2">
                  {monthlyData.map((data) => {
                    const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));
                    const height = (data.revenue / maxRevenue) * 100;
                    return (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full relative group">
                          <div
                            className="w-full rounded-t transition-all cursor-pointer hover:opacity-80"
                            style={{ height: `${height}%`, backgroundColor: '#BE220E', minHeight: '20px' }}
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            ${data.revenue.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">{data.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Orders Chart */}
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Orders Trend</div>
                <div className="h-32 flex items-end gap-2">
                  {monthlyData.map((data) => {
                    const maxOrders = Math.max(...monthlyData.map((d) => d.orders));
                    const height = (data.orders / maxOrders) * 100;
                    return (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full relative group">
                          <div
                            className="w-full rounded-t transition-all cursor-pointer hover:opacity-80"
                            style={{ height: `${height}%`, backgroundColor: '#2563EB', minHeight: '15px' }}
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            {data.orders} orders
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">{data.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* User Growth */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">User Growth Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userGrowth.map((user) => (
              <div key={user.type} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700">{user.type}</h3>
                  <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{user.growth}%
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: '#BE220E' }}>
                  {user.total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">+{user.new}</span> new this month
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-sm text-green-700 mb-1">Lifetime Value</div>
            <div className="text-2xl font-bold text-green-900">$1,245,890</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-sm text-blue-700 mb-1">Customer Retention</div>
            <div className="text-2xl font-bold text-blue-900">84.5%</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-sm text-purple-700 mb-1">Repeat Purchase Rate</div>
            <div className="text-2xl font-bold text-purple-900">62.3%</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="text-sm text-orange-700 mb-1">Avg. Session Duration</div>
            <div className="text-2xl font-bold text-orange-900">8m 34s</div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

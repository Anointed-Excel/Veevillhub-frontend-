import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, Calendar, Download } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RetailerAnalytics() {
  const [timeRange, setTimeRange] = useState('7days');

  // Sales data over time
  const salesData = [
    { date: 'Jan 8', revenue: 450, orders: 12, customers: 8 },
    { date: 'Jan 9', revenue: 680, orders: 18, customers: 14 },
    { date: 'Jan 10', revenue: 520, orders: 15, customers: 11 },
    { date: 'Jan 11', revenue: 890, orders: 24, customers: 19 },
    { date: 'Jan 12', revenue: 720, orders: 19, customers: 15 },
    { date: 'Jan 13', revenue: 960, orders: 26, customers: 21 },
    { date: 'Jan 14', revenue: 1100, orders: 28, customers: 23 },
  ];

  // Product category performance
  const categoryData = [
    { name: 'Clothing', value: 45, sales: 12450 },
    { name: 'Accessories', value: 30, sales: 8320 },
    { name: 'Footwear', value: 15, sales: 4150 },
    { name: 'Jewelry', value: 10, sales: 2780 },
  ];

  // Top selling products
  const topProducts = [
    { name: 'African Print Dress', sales: 145, revenue: 7250, trend: 'up' },
    { name: 'Cotton Shirts', sales: 89, revenue: 3110, trend: 'up' },
    { name: 'Leather Bags', sales: 67, revenue: 6030, trend: 'down' },
    { name: 'Fashion Accessories', sales: 54, revenue: 1080, trend: 'up' },
    { name: 'Designer Fabric', sales: 48, revenue: 750, trend: 'up' },
  ];

  // Customer acquisition data
  const customerData = [
    { month: 'Aug', new: 12, returning: 5 },
    { month: 'Sep', new: 18, returning: 15 },
    { month: 'Oct', new: 25, returning: 28 },
    { month: 'Nov', new: 32, returning: 42 },
    { month: 'Dec', new: 28, returning: 56 },
    { month: 'Jan', new: 35, returning: 68 },
  ];

  // Order status distribution
  const orderStatusData = [
    { name: 'Delivered', value: 245, color: '#16A34A' },
    { name: 'Shipped', value: 45, color: '#7C3AED' },
    { name: 'Processing', value: 28, color: '#2563EB' },
    { name: 'Pending', value: 18, color: '#F59E0B' },
    { name: 'Cancelled', value: 6, color: '#DC2626' },
  ];

  // Revenue by channel
  const channelData = [
    { channel: 'Online Store', revenue: 8900 },
    { channel: 'Walk-in', revenue: 4200 },
    { channel: 'Social Media', revenue: 2140 },
  ];

  const COLORS = ['#BE220E', '#2563EB', '#16A34A', '#F59E0B', '#7C3AED'];

  const stats = [
    {
      label: 'Total Revenue',
      value: '$15,240',
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: '#16A34A',
    },
    {
      label: 'Total Orders',
      value: '342',
      change: '+12.5%',
      trend: 'up',
      icon: ShoppingBag,
      color: '#2563EB',
    },
    {
      label: 'Customers',
      value: '89',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: '#7C3AED',
    },
    {
      label: 'Avg Order Value',
      value: '$44.56',
      change: '-2.4%',
      trend: 'down',
      icon: Package,
      color: '#BE220E',
    },
  ];

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Insights</h1>
            <p className="text-gray-600 mt-1">Track your business performance</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
                <div className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Revenue & Orders Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Revenue & Orders Trend</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#BE220E' }}></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BE220E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#BE220E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#BE220E" 
                strokeWidth={2}
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#2563EB" 
                strokeWidth={2}
                fill="url(#colorOrders)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Sales by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{category.name}</div>
                    <div className="text-xs text-gray-600">${category.sales.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Order Status Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Order Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {orderStatusData.map((status) => (
                <div key={status.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-sm font-medium">{status.name}</span>
                  </div>
                  <span className="font-bold">{status.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Customer Acquisition */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Customer Acquisition</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="new" fill="#BE220E" name="New Customers" radius={[8, 8, 0, 0]} />
              <Bar dataKey="returning" fill="#2563EB" name="Returning Customers" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
            {topProducts.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No sales data yet"
                description="Top selling products will appear here once you start receiving orders."
              />
            ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="text-2xl font-bold" style={{ color: '#BE220E' }}>
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.sales} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${product.revenue.toLocaleString()}
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${
                      product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {product.trend === 'up' ? 'Up' : 'Down'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </Card>

          {/* Revenue by Channel */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Revenue by Channel</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={channelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="channel" type="category" stroke="#6b7280" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="#BE220E" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Channel Revenue</span>
                <span className="text-2xl font-bold" style={{ color: '#BE220E' }}>
                  ${channelData.reduce((sum, ch) => sum + ch.revenue, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Insights & Recommendations */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Insights & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Strong Performance</h3>
              </div>
              <p className="text-sm text-green-800">
                Your sales have increased by 18.3% this week. Keep promoting your top-selling products!
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">Customer Growth</h3>
              </div>
              <p className="text-sm text-blue-800">
                You've gained 23 new customers this week. Focus on retention strategies.
              </p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-orange-900">Inventory Alert</h3>
              </div>
              <p className="text-sm text-orange-800">
                4 products are running low on stock. Consider restocking from your suppliers.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManufacturerDashboard() {
  const stats = [
    { label: 'Total Products', value: '45', icon: Package, color: '#BE220E', change: '+5 this month', link: '/manufacturer/products' },
    { label: 'Total Orders', value: '123', icon: ShoppingCart, color: '#2563EB', change: '+18 this week', link: '/manufacturer/orders' },
    { label: 'Total Earnings', value: '$8,900', icon: DollarSign, color: '#16A34A', change: '+12.5%', link: '/manufacturer/wallet' },
    { label: 'Growth Rate', value: '24%', icon: TrendingUp, color: '#7C3AED', change: '+3.2%', link: '/manufacturer/orders' },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Lagos Mega Store', product: 'Premium Fabric Bundle', amount: '$450', status: 'pending', date: '2 hours ago' },
    { id: 'ORD-002', customer: 'Sunny Mart', product: 'Cotton Textiles', amount: '$780', status: 'processing', date: '5 hours ago' },
    { id: 'ORD-003', customer: 'Quick Shop', product: 'Leather Goods', amount: '$320', status: 'shipped', date: '1 day ago' },
    { id: 'ORD-004', customer: 'Fresh Market', product: 'Fabric Collection', amount: '$590', status: 'delivered', date: '2 days ago' },
  ];

  const lowStockProducts = [
    { name: 'Premium African Print', stock: 45, moq: 100, status: 'low' },
    { name: 'Cotton Fabric Roll', stock: 12, moq: 50, status: 'critical' },
    { name: 'Leather Material', stock: 78, moq: 100, status: 'low' },
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

  return (
    <DashboardLayout role="manufacturer">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business summary</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} to={stat.link}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                  <div className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.change}</div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link to="/manufacturer/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <div className="flex-1">
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-sm text-gray-600">{order.product}</div>
                    <div className="text-xs text-gray-500 mt-1">{order.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: '#BE220E' }}>{order.amount}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Low Stock Alert */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Low Stock Alert</h2>
              <Link to="/manufacturer/products">
                <Button variant="outline" size="sm">Manage Stock</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{product.name}</div>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Stock: <span className="font-bold text-orange-600">{product.stock}</span></span>
                    <span className="text-gray-600">MOQ: {product.moq}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${(product.stock / product.moq) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/manufacturer/products">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Package className="w-6 h-6" style={{ color: '#BE220E' }} />
                <span className="text-sm">Add Product</span>
              </Button>
            </Link>
            <Link to="/manufacturer/orders">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <ShoppingCart className="w-6 h-6" style={{ color: '#BE220E' }} />
                <span className="text-sm">View Orders</span>
              </Button>
            </Link>
            <Link to="/manufacturer/wallet">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <DollarSign className="w-6 h-6" style={{ color: '#BE220E' }} />
                <span className="text-sm">Withdraw Funds</span>
              </Button>
            </Link>
            <Link to="/manufacturer/messages">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Clock className="w-6 h-6" style={{ color: '#BE220E' }} />
                <span className="text-sm">Messages</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

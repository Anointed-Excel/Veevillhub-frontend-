import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Package, ShoppingCart, DollarSign, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RetailerDashboard() {
  const stats = [
    { label: 'Total Products', value: '128', icon: Package, color: '#BE220E', change: '+12 this week', link: '/retailer/products' },
    { label: 'Customer Orders', value: '342', icon: ShoppingCart, color: '#2563EB', change: '+28 today', link: '/retailer/orders' },
    { label: 'Total Revenue', value: '$15,240', icon: DollarSign, color: '#16A34A', change: '+18.3%', link: '/retailer/wallet' },
    { label: 'Active Customers', value: '89', icon: Users, color: '#7C3AED', change: '+5 this week', link: '/retailer/customers' },
  ];

  const recentOrders = [
    { id: 'ORD-R-001', customer: 'Sarah Johnson', product: 'Premium African Print Dress', amount: '$89.99', status: 'pending', date: '30 mins ago' },
    { id: 'ORD-R-002', customer: 'Michael Chen', product: 'Cotton Shirt Bundle', amount: '$125.50', status: 'processing', date: '2 hours ago' },
    { id: 'ORD-R-003', customer: 'Aisha Okafor', product: 'Leather Handbag', amount: '$65.00', status: 'shipped', date: '5 hours ago' },
    { id: 'ORD-R-004', customer: 'James Wilson', product: 'Fashion Accessories Set', amount: '$45.99', status: 'delivered', date: '1 day ago' },
    { id: 'ORD-R-005', customer: 'Fatima Abdul', product: 'Designer Fabric', amount: '$78.00', status: 'delivered', date: '1 day ago' },
  ];

  const lowStockProducts = [
    { name: 'Premium African Print Dress', stock: 8, reorderLevel: 20, status: 'low' },
    { name: 'Cotton Shirt (Medium)', stock: 3, reorderLevel: 15, status: 'critical' },
    { name: 'Leather Wallet', stock: 12, reorderLevel: 25, status: 'low' },
    { name: 'Fashion Scarf', stock: 5, reorderLevel: 20, status: 'critical' },
  ];

  const topSellingProducts = [
    { name: 'African Print Dress', sales: 145, revenue: '$12,995' },
    { name: 'Cotton Shirts', sales: 89, revenue: '$8,010' },
    { name: 'Leather Bags', sales: 67, revenue: '$4,355' },
    { name: 'Fashion Accessories', sales: 54, revenue: '$2,430' },
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

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'low': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Retailer Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your store overview</p>
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
              <h2 className="text-xl font-bold">Recent Customer Orders</h2>
              <Link to="/retailer/orders">
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
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Low Stock Alert
              </h2>
              <Link to="/retailer/buy-bulk">
                <Button size="sm" style={{ backgroundColor: '#BE220E' }} className="text-white">
                  Reorder
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      Reorder level: {product.reorderLevel} units
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getStockStatusColor(product.status)}`}>
                      {product.stock} left
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Selling Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Selling Products</h2>
            <Link to="/retailer/analytics">
              <Button variant="outline" size="sm">Full Analytics</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topSellingProducts.map((product, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold" style={{ color: '#BE220E' }}>#{index + 1}</span>
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div className="font-medium mb-1">{product.name}</div>
                <div className="text-sm text-gray-600">{product.sales} sales</div>
                <div className="text-lg font-bold mt-2" style={{ color: '#16A34A' }}>{product.revenue}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/retailer/buy-bulk">
              <Button className="w-full" style={{ backgroundColor: '#BE220E' }}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Bulk Products
              </Button>
            </Link>
            <Link to="/retailer/products">
              <Button variant="outline" className="w-full">
                <Package className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
            </Link>
            <Link to="/retailer/orders">
              <Button variant="outline" className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Link to="/retailer/customers">
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                View Customers
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

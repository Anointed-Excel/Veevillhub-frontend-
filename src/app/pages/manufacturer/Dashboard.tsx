import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

interface DashboardData {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
  };
  recentProducts: { id: string; name: string; sku: string; sales_price: number; stock_quantity: number; image_url?: string }[];
  recentOrders: { id: string; order_number: string; total: number; status: string; created_at: string }[];
  lowStockProducts: { id: string; name: string; sku: string; stock_quantity: number; moq: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  confirmed:       'bg-blue-100 text-blue-700',
  shipped:         'bg-purple-100 text-purple-700',
  delivered:       'bg-green-100 text-green-700',
  cancelled:       'bg-red-100 text-red-700',
};

function fmt(n: number) {
  return '₦' + n.toLocaleString();
}

export default function ManufacturerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>('/vendor/dashboard')
      .then((res) => setData(res.data))
      .catch(() => {/* keep null — fallback UI shown */})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  const statCards = [
    { label: 'Total Products',  value: loading ? '…' : String(stats?.totalProducts ?? 0),  icon: Package,      color: '#BE220E', link: '/manufacturer/products' },
    { label: 'Platform Orders', value: loading ? '…' : String(stats?.totalOrders ?? 0),     icon: ShoppingCart, color: '#2563EB', link: '/manufacturer/orders'  },
    { label: 'Total Revenue',   value: loading ? '…' : fmt(stats?.totalRevenue ?? 0),       icon: DollarSign,   color: '#16A34A', link: '/manufacturer/wallet'  },
    { label: 'Delivered',       value: loading ? '…' : String(stats?.deliveredOrders ?? 0), icon: TrendingUp,   color: '#7C3AED', link: '/manufacturer/orders'  },
  ];

  return (
    <DashboardLayout role="manufacturer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business summary</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} to={stat.link}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${stat.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                  <div className="text-3xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</div>
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
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (data?.recentOrders?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {data!.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: '#BE220E' }}>{fmt(order.total)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Low Stock */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Low Stock Alert</h2>
              <Link to="/manufacturer/products">
                <Button variant="outline" size="sm">Manage Stock</Button>
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (data?.lowStockProducts?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">All products are well stocked</p>
            ) : (
              <div className="space-y-3">
                {data!.lowStockProducts.map((product) => (
                  <div key={product.id} className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{product.name}</div>
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Stock: <span className="font-bold text-orange-600">{product.stock_quantity}</span></span>
                      <span>MOQ: {product.moq}</span>
                    </div>
                    <div className="mt-2 w-full bg-orange-200 rounded-full h-1.5">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min((product.stock_quantity / (product.moq || 20)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Platform Products</h2>
            <Link to="/manufacturer/products">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(data?.recentProducts ?? []).map((p) => (
                <div key={p.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer text-center">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-full h-16 object-cover rounded mb-2" />
                  )}
                  <div className="text-xs font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.sku}</div>
                  <div className="text-sm font-bold mt-1" style={{ color: '#BE220E' }}>{fmt(p.sales_price)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

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
                <span className="text-sm">Wallet</span>
              </Button>
            </Link>
            <Link to="/manufacturer/messages">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="w-6 h-6" style={{ color: '#BE220E' }} />
                <span className="text-sm">Analytics</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

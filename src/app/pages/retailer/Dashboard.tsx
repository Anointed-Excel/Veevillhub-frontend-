import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Package, ShoppingCart, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';
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
  recentOrders: { id: string; order_number: string; total: number; status: string; payment_status: string; created_at: string }[];
  lowStockProducts: { id: string; name: string; sku: string; stock_quantity: number; moq: number }[];
  recentProducts: { id: string; name: string; sku: string; sales_price: number; image_url?: string }[];
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

export default function RetailerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>('/vendor/dashboard')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  const statCards = [
    { label: 'Total Products',   value: loading ? '…' : String(stats?.totalProducts ?? 0),  icon: Package,      color: '#BE220E', link: '/retailer/products'  },
    { label: 'Platform Orders',  value: loading ? '…' : String(stats?.totalOrders ?? 0),    icon: ShoppingCart, color: '#2563EB', link: '/retailer/orders'    },
    { label: 'Total Revenue',    value: loading ? '…' : fmt(stats?.totalRevenue ?? 0),      icon: DollarSign,   color: '#16A34A', link: '/retailer/wallet'    },
    { label: 'Delivered Orders', value: loading ? '…' : String(stats?.deliveredOrders ?? 0),icon: Users,        color: '#7C3AED', link: '/retailer/orders'    },
  ];

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Retailer Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your store overview</p>
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
              <h2 className="text-xl font-bold">Recent Customer Orders</h2>
              <Link to="/retailer/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (data?.recentOrders?.length ?? 0) === 0 ? (
              <EmptyState icon={ShoppingCart} title="No orders yet" description="Customer orders will appear here once received." />
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
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (data?.lowStockProducts?.length ?? 0) === 0 ? (
              <EmptyState icon={Package} title="All products well stocked" description="Low stock alerts will appear here when inventory is running low." />
            ) : (
              <div className="space-y-3">
                {data!.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">Reorder level: {product.moq} units</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${product.stock_quantity <= 5 ? 'text-red-600' : 'text-orange-600'}`}>
                        {product.stock_quantity} left
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock_quantity <= 5 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {product.stock_quantity <= 5 ? 'critical' : 'low'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Available Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Available Products</h2>
            <Link to="/retailer/products">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(data?.recentProducts ?? []).map((p) => (
                <div key={p.id} className="p-3 bg-gray-50 rounded-lg hover:shadow transition cursor-pointer text-center">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-full h-16 object-cover rounded mb-2" />
                  )}
                  <div className="text-xs font-medium truncate">{p.name}</div>
                  <div className="text-sm font-bold mt-1" style={{ color: '#BE220E' }}>{fmt(p.sales_price)}</div>
                </div>
              ))}
            </div>
          )}
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
            <Link to="/retailer/wallet">
              <Button variant="outline" className="w-full">
                <DollarSign className="w-4 h-4 mr-2" />
                Wallet
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Download, Eye, Edit2, RefreshCw, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  seller: string;
  sellerType: 'Brand' | 'Manufacturer' | 'Retailer';
  products: { name: string; qty: number; price: number }[];
  totalAmount: number;
  commission: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  date: string;
  shippingAddress: string;
}

export default function BrandOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get<unknown>('/admin/orders');
      const raw = ((res.data as Record<string, unknown>).orders || res.data) as Record<string, unknown>[];
      setOrders((Array.isArray(raw) ? raw : []).map((o) => ({
        id: o.id as string,
        orderNumber: (o.order_number as string) || String(o.id).slice(0, 8).toUpperCase(),
        customer: (o.user_name as string) || (o.customer_name as string) || 'Customer',
        customerEmail: (o.user_email as string) || '',
        seller: 'Anointed',
        sellerType: 'Brand' as const,
        products: (o.items as { product_name: string; quantity: number; price: number }[] || []).map((i) => ({
          name: i.product_name,
          qty: i.quantity,
          price: Number(i.price),
        })),
        totalAmount: Number(o.total) || 0,
        commission: Number(o.total) * 0.1 || 0,
        status: (o.status as Order['status']) || 'pending',
        paymentStatus: (o.payment_status as Order['paymentStatus']) || 'pending',
        date: o.created_at ? new Date(o.created_at as string).toLocaleDateString() : '—',
        shippingAddress: (o.shipping_address as string) || '—',
      })));
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    const matchesSeller = filterSeller === 'all' || order.sellerType === filterSeller;
    return matchesSearch && matchesStatus && matchesPayment && matchesSeller;
  });

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowEditModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/admin/orders/${selectedOrder.id}/status`, { status: newStatus });
      setOrders(orders.map((o) => o.id === selectedOrder.id ? { ...o, status: newStatus as Order['status'] } : o));
      setShowEditModal(false);
      toast.success('Order status updated successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update status');
    }
  };

  const handleRefundClick = (order: Order) => {
    setSelectedOrder(order);
    setShowRefundModal(true);
  };

  const handleForceRefund = async () => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/admin/orders/${selectedOrder.id}/status`, { status: 'cancelled' });
      setOrders(orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: 'refunded' as const, paymentStatus: 'refunded' as const } : o
      ));
      setShowRefundModal(false);
      toast.success('Refund processed successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to process refund');
    }
  };

  const handleExport = () => {
    toast.success('Exporting orders data...');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'refunded': return <RefreshCw className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalCommission = orders.reduce((sum, order) => sum + order.commission, 0);

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all platform orders</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-2xl font-bold mt-1">{orders.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {orders.filter((o) => o.status === 'pending').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Processing</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {orders.filter((o) => o.status === 'processing').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Delivered</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {orders.filter((o) => o.status === 'delivered').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>
              ${totalRevenue.toFixed(2)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Commission</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              ${totalCommission.toFixed(2)}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search orders, customer, seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeller} onValueChange={setFilterSeller}>
              <SelectTrigger>
                <SelectValue placeholder="Seller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sellers</SelectItem>
                <SelectItem value="Brand">Brand</SelectItem>
                <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                <SelectItem value="Retailer">Retailer</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              Results: <span className="font-bold ml-1">{filteredOrders.length}</span>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{order.seller}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.sellerType === 'Brand' ? 'bg-red-100 text-red-700' :
                        order.sellerType === 'Manufacturer' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {order.sellerType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold" style={{ color: '#BE220E' }}>
                        ${order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.products.length} item{order.products.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-green-600">
                        ${order.commission.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        order.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleView(order)} variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button onClick={() => handleEditClick(order)} variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4 text-yellow-600" />
                        </Button>
                        {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
                          <Button onClick={() => handleRefundClick(order)} variant="ghost" size="sm">
                            <RefreshCw className="w-4 h-4 text-orange-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="font-bold text-xl">{selectedOrder.orderNumber}</div>
                    <div className="text-sm text-gray-600">{selectedOrder.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Customer Information</div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium">{selectedOrder.customer}</div>
                      <div className="text-sm text-gray-600">{selectedOrder.customerEmail}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Seller Information</div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium">{selectedOrder.seller}</div>
                      <div className="text-sm">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedOrder.sellerType === 'Brand' ? 'bg-red-100 text-red-700' :
                          selectedOrder.sellerType === 'Manufacturer' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {selectedOrder.sellerType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Shipping Address</div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm">{selectedOrder.shippingAddress}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Order Items</div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrder.products.map((product, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{product.name}</td>
                            <td className="px-4 py-2 text-sm">{product.qty}</td>
                            <td className="px-4 py-2 text-sm">${product.price}</td>
                            <td className="px-4 py-2 text-sm font-medium">${(product.qty * product.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="font-medium">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Platform Commission ({((selectedOrder.commission / selectedOrder.totalAmount) * 100).toFixed(0)}%):</span>
                    <span className="font-medium text-green-600">${selectedOrder.commission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-xl" style={{ color: '#BE220E' }}>
                      ${selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      selectedOrder.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
              {selectedOrder && selectedOrder.paymentStatus === 'paid' && selectedOrder.status !== 'refunded' && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleRefundClick(selectedOrder);
                  }}
                  variant="outline"
                  className="text-orange-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Process Refund
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Status Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>Change the status of order {selectedOrder?.orderNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <div className="mt-2 flex items-center gap-2">
                  {selectedOrder && getStatusIcon(selectedOrder.status)}
                  <span className="capitalize font-medium">{selectedOrder?.status}</span>
                </div>
              </div>
              <div>
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdateStatus} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Modal */}
        <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Force Refund</DialogTitle>
              <DialogDescription>Process a refund for order {selectedOrder?.orderNumber}</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This action will immediately refund the customer and update the order status.
                    This cannot be undone.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Number:</span>
                    <span className="font-medium">{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedOrder.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Refund Amount:</span>
                    <span className="font-bold text-xl" style={{ color: '#BE220E' }}>
                      ${selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Commission Lost:</span>
                    <span className="font-medium text-red-600">-${selectedOrder.commission.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRefundModal(false)}>Cancel</Button>
              <Button
                onClick={handleForceRefund}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Confirm Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
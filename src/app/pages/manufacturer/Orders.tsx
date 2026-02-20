import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Download, Eye, Edit2, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  products: { name: string; qty: number; price: number }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'pending' | 'paid';
  date: string;
  shippingAddress: string;
}

export default function ManufacturerOrders() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-MFG-001',
      customer: 'Lagos Mega Store',
      customerEmail: 'contact@lagosmega.ng',
      products: [
        { name: 'Premium African Print Fabric', qty: 200, price: 25.99 },
      ],
      totalAmount: 5198.00,
      status: 'delivered',
      paymentStatus: 'paid',
      date: '2024-01-10',
      shippingAddress: '45 Broad Street, Lagos Island, Lagos',
    },
    {
      id: '2',
      orderNumber: 'ORD-MFG-002',
      customer: 'Sunny Mart Network',
      customerEmail: 'info@sunnymart.ng',
      products: [
        { name: 'Cotton Fabric Roll', qty: 150, price: 18.50 },
      ],
      totalAmount: 2775.00,
      status: 'shipped',
      paymentStatus: 'paid',
      date: '2024-01-12',
      shippingAddress: '12 Market Road, Kano, Kano State',
    },
    {
      id: '3',
      orderNumber: 'ORD-MFG-003',
      customer: 'Quick Shop Express',
      customerEmail: 'quick@shopexpress.ng',
      products: [
        { name: 'Leather Material Pack', qty: 100, price: 45.00 },
      ],
      totalAmount: 4500.00,
      status: 'processing',
      paymentStatus: 'paid',
      date: '2024-01-14',
      shippingAddress: '78 Independence Ave, Abuja',
    },
    {
      id: '4',
      orderNumber: 'ORD-MFG-004',
      customer: 'Fresh Market Hub',
      customerEmail: 'fresh@markethub.ng',
      products: [
        { name: 'Premium African Print Fabric', qty: 300, price: 25.99 },
      ],
      totalAmount: 7797.00,
      status: 'pending',
      paymentStatus: 'pending',
      date: '2024-01-15',
      shippingAddress: '23 New Market, Port Harcourt',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
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

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    setOrders(orders.map((o) =>
      o.id === selectedOrder.id ? { ...o, status: newStatus as any } : o
    ));
    setShowEditModal(false);
    toast.success('Order status updated successfully');
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
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <DashboardLayout role="manufacturer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your orders</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search orders or customer..."
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
              </SelectContent>
            </Select>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
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
                      <div className="font-bold" style={{ color: '#BE220E' }}>
                        ${order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.products.length} item{order.products.length > 1 ? 's' : ''}
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
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
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

                <div>
                  <div className="text-sm text-gray-600 mb-2">Customer Information</div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium">{selectedOrder.customer}</div>
                    <div className="text-sm text-gray-600">{selectedOrder.customerEmail}</div>
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

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-xl" style={{ color: '#BE220E' }}>
                      ${selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">Payment Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Status Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
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
      </div>
    </DashboardLayout>
  );
}

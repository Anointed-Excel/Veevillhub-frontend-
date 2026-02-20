import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Eye, Download, Package, Truck, CheckCircle, XCircle, Clock, Filter, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    productName: string;
    sku: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  orderDate: string;
  shippingDate?: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
}

export default function RetailerOrders() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-R-001',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+234 801 234 5678',
        address: '15 Victoria Island, Lagos, Nigeria',
      },
      items: [
        { productName: 'Premium African Print Dress', sku: 'RTL-DRS-001', quantity: 2, price: 49.99 },
        { productName: 'Fashion Scarf', sku: 'RTL-ACC-001', quantity: 1, price: 19.99 },
      ],
      subtotal: 119.97,
      shipping: 10.00,
      total: 129.97,
      status: 'pending',
      paymentStatus: 'paid',
      orderDate: '2024-01-14 09:30 AM',
      notes: 'Please pack carefully',
    },
    {
      id: '2',
      orderNumber: 'ORD-R-002',
      customer: {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+234 802 345 6789',
        address: '42 Lekki Phase 1, Lagos, Nigeria',
      },
      items: [
        { productName: 'Cotton Shirt (Men)', sku: 'RTL-SHT-001', quantity: 3, price: 34.99 },
      ],
      subtotal: 104.97,
      shipping: 8.00,
      total: 112.97,
      status: 'processing',
      paymentStatus: 'paid',
      orderDate: '2024-01-14 11:15 AM',
      notes: '',
    },
    {
      id: '3',
      orderNumber: 'ORD-R-003',
      customer: {
        name: 'Aisha Okafor',
        email: 'aisha.okafor@email.com',
        phone: '+234 803 456 7890',
        address: '8 Ikeja GRA, Lagos, Nigeria',
      },
      items: [
        { productName: 'Leather Handbag', sku: 'RTL-BAG-001', quantity: 1, price: 89.99 },
      ],
      subtotal: 89.99,
      shipping: 12.00,
      total: 101.99,
      status: 'shipped',
      paymentStatus: 'paid',
      orderDate: '2024-01-13 02:45 PM',
      shippingDate: '2024-01-14 10:00 AM',
      trackingNumber: 'TRK-894561237',
    },
    {
      id: '4',
      orderNumber: 'ORD-R-004',
      customer: {
        name: 'James Wilson',
        email: 'james.w@email.com',
        phone: '+234 804 567 8901',
        address: '23 Surulere, Lagos, Nigeria',
      },
      items: [
        { productName: 'Fashion Accessories Set', sku: 'RTL-ACC-002', quantity: 2, price: 24.99 },
      ],
      subtotal: 49.98,
      shipping: 5.00,
      total: 54.98,
      status: 'delivered',
      paymentStatus: 'paid',
      orderDate: '2024-01-12 08:20 AM',
      shippingDate: '2024-01-12 03:00 PM',
      deliveryDate: '2024-01-13 11:30 AM',
      trackingNumber: 'TRK-783492156',
    },
    {
      id: '5',
      orderNumber: 'ORD-R-005',
      customer: {
        name: 'Fatima Abdul',
        email: 'fatima.a@email.com',
        phone: '+234 805 678 9012',
        address: '31 Yaba, Lagos, Nigeria',
      },
      items: [
        { productName: 'Designer Fabric', sku: 'RTL-FAB-001', quantity: 5, price: 15.60 },
      ],
      subtotal: 78.00,
      shipping: 7.00,
      total: 85.00,
      status: 'cancelled',
      paymentStatus: 'refunded',
      orderDate: '2024-01-13 04:10 PM',
      notes: 'Customer requested cancellation',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    trackingNumber: '',
    notes: '',
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdateOrder = () => {
    if (!selectedOrder) return;

    setOrders(orders.map(order =>
      order.id === selectedOrder.id
        ? {
            ...order,
            status: (updateData.status || order.status) as Order['status'],
            trackingNumber: updateData.trackingNumber || order.trackingNumber,
            notes: updateData.notes || order.notes,
            shippingDate: updateData.status === 'shipped' && !order.shippingDate 
              ? new Date().toLocaleString() 
              : order.shippingDate,
            deliveryDate: updateData.status === 'delivered' && !order.deliveryDate
              ? new Date().toLocaleString()
              : order.deliveryDate,
          }
        : order
    ));

    toast.success('Order updated successfully');
    setShowUpdateModal(false);
    setSelectedOrder(null);
    setUpdateData({ status: '', trackingNumber: '', notes: '' });
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || '',
    });
    setShowUpdateModal(true);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Orders</h1>
            <p className="text-gray-600 mt-1">Manage and track your retail orders</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Total Orders</div>
            <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Pending</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Processing</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{stats.processing}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Shipped</div>
            <div className="text-2xl font-bold mt-1 text-purple-600">{stats.shipped}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Delivered</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{stats.delivered}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Revenue</div>
            <div className="text-2xl font-bold mt-1 text-green-600">${stats.totalRevenue.toFixed(0)}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Order Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{order.orderNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Order Date: {order.orderDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: '#BE220E' }}>
                    ${order.total.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-gray-600">{order.customer.email}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-gray-600">{order.customer.phone}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-gray-600">{order.customer.address}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-gray-600 text-xs">{item.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-600">{item.quantity} × ${item.price}</div>
                          <div className="font-medium">${(item.quantity * item.price).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Notes: </span>
                    <span className="text-gray-600">{order.notes}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowViewModal(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <Button 
                    style={{ backgroundColor: '#BE220E' }} 
                    className="text-white"
                    onClick={() => openUpdateModal(order)}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          </Card>
        )}
      </div>

      {/* View Order Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-2xl font-bold">{selectedOrder.orderNumber}</div>
                  <div className="text-sm text-gray-600 mt-1">Placed on {selectedOrder.orderDate}</div>
                </div>
                <span className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 border ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <Label className="text-gray-600">Name</Label>
                      <p className="font-medium">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium">{selectedOrder.customer.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-medium">{selectedOrder.customer.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Delivery Address</Label>
                      <p className="font-medium">{selectedOrder.customer.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Order Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                      <div className="flex-1 text-sm">
                        <div className="font-medium">Order Placed</div>
                        <div className="text-gray-600">{selectedOrder.orderDate}</div>
                      </div>
                    </div>
                    {selectedOrder.shippingDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                        <div className="flex-1 text-sm">
                          <div className="font-medium">Shipped</div>
                          <div className="text-gray-600">{selectedOrder.shippingDate}</div>
                        </div>
                      </div>
                    )}
                    {selectedOrder.deliveryDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                        <div className="flex-1 text-sm">
                          <div className="font-medium">Delivered</div>
                          <div className="text-gray-600">{selectedOrder.deliveryDate}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-600">{item.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                        <div className="font-bold" style={{ color: '#BE220E' }}>
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold" style={{ color: '#BE220E' }}>
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Label className="text-gray-700">Tracking Number</Label>
                  <p className="font-mono font-medium text-lg">{selectedOrder.trackingNumber}</p>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <Label className="text-gray-700">Order Notes</Label>
                  <p className="text-sm mt-1">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            {selectedOrder && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
              <Button 
                style={{ backgroundColor: '#BE220E' }} 
                className="text-white"
                onClick={() => {
                  setShowViewModal(false);
                  openUpdateModal(selectedOrder);
                }}
              >
                Update Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Order Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the order status and tracking information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedOrder.orderNumber}</div>
                <div className="text-sm text-gray-600">{selectedOrder.customer.name}</div>
              </div>

              <div>
                <Label>Order Status *</Label>
                <Select value={updateData.status} onValueChange={(value) => setUpdateData({ ...updateData, status: value })}>
                  <SelectTrigger>
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

              {(updateData.status === 'shipped' || updateData.status === 'delivered') && (
                <div>
                  <Label>Tracking Number</Label>
                  <Input
                    placeholder="Enter tracking number"
                    value={updateData.trackingNumber}
                    onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any additional notes"
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: '#BE220E' }} 
              className="text-white"
              onClick={handleUpdateOrder}
            >
              Update Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

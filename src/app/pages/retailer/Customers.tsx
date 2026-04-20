import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Eye, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, TrendingUp, UserPlus } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils/clipboard';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  status: 'active' | 'inactive' | 'vip';
  orderHistory: {
    orderNumber: string;
    date: string;
    total: number;
    status: string;
  }[];
}

export default function Customers() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState<'all' | 'vip' | 'regular' | 'new'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'recent'>('recent');
  const [showViewModal, setShowViewModal] = useState(false);

  // Helper function to copy email
  const handleCopyEmail = async (email: string) => {
    const success = await copyToClipboard(email);
    if (success) {
      toast.success('Email copied to clipboard');
    } else {
      toast.error('Failed to copy email');
    }
  };

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+234 801 234 5678',
      address: '15 Victoria Island, Lagos, Nigeria',
      joinedDate: '2023-11-15',
      totalOrders: 12,
      totalSpent: 1456.88,
      averageOrderValue: 121.41,
      lastOrderDate: '2024-01-14',
      status: 'vip',
      orderHistory: [
        { orderNumber: 'ORD-R-001', date: '2024-01-14', total: 129.97, status: 'pending' },
        { orderNumber: 'ORD-R-008', date: '2024-01-10', total: 245.50, status: 'delivered' },
        { orderNumber: 'ORD-R-015', date: '2024-01-05', total: 89.99, status: 'delivered' },
      ],
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+234 802 345 6789',
      address: '42 Lekki Phase 1, Lagos, Nigeria',
      joinedDate: '2023-12-20',
      totalOrders: 8,
      totalSpent: 892.40,
      averageOrderValue: 111.55,
      lastOrderDate: '2024-01-14',
      status: 'active',
      orderHistory: [
        { orderNumber: 'ORD-R-002', date: '2024-01-14', total: 112.97, status: 'processing' },
        { orderNumber: 'ORD-R-012', date: '2024-01-08', total: 156.50, status: 'delivered' },
      ],
    },
    {
      id: '3',
      name: 'Aisha Okafor',
      email: 'aisha.okafor@email.com',
      phone: '+234 803 456 7890',
      address: '8 Ikeja GRA, Lagos, Nigeria',
      joinedDate: '2023-10-05',
      totalOrders: 15,
      totalSpent: 2134.75,
      averageOrderValue: 142.32,
      lastOrderDate: '2024-01-13',
      status: 'vip',
      orderHistory: [
        { orderNumber: 'ORD-R-003', date: '2024-01-13', total: 101.99, status: 'shipped' },
        { orderNumber: 'ORD-R-009', date: '2024-01-11', total: 325.00, status: 'delivered' },
        { orderNumber: 'ORD-R-018', date: '2024-01-02', total: 198.50, status: 'delivered' },
      ],
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james.w@email.com',
      phone: '+234 804 567 8901',
      address: '23 Surulere, Lagos, Nigeria',
      joinedDate: '2024-01-02',
      totalOrders: 3,
      totalSpent: 245.67,
      averageOrderValue: 81.89,
      lastOrderDate: '2024-01-12',
      status: 'active',
      orderHistory: [
        { orderNumber: 'ORD-R-004', date: '2024-01-12', total: 54.98, status: 'delivered' },
        { orderNumber: 'ORD-R-016', date: '2024-01-08', total: 98.50, status: 'delivered' },
      ],
    },
    {
      id: '5',
      name: 'Fatima Abdul',
      email: 'fatima.a@email.com',
      phone: '+234 805 678 9012',
      address: '31 Yaba, Lagos, Nigeria',
      joinedDate: '2023-09-18',
      totalOrders: 6,
      totalSpent: 567.30,
      averageOrderValue: 94.55,
      lastOrderDate: '2024-01-13',
      status: 'active',
      orderHistory: [
        { orderNumber: 'ORD-R-005', date: '2024-01-13', total: 85.00, status: 'cancelled' },
        { orderNumber: 'ORD-R-013', date: '2024-01-07', total: 145.20, status: 'delivered' },
      ],
    },
    {
      id: '6',
      name: 'David Adeyemi',
      email: 'david.adeyemi@email.com',
      phone: '+234 806 789 0123',
      address: '45 Ajah, Lagos, Nigeria',
      joinedDate: '2023-08-10',
      totalOrders: 2,
      totalSpent: 125.00,
      averageOrderValue: 62.50,
      lastOrderDate: '2023-12-15',
      status: 'inactive',
      orderHistory: [
        { orderNumber: 'ORD-R-022', date: '2023-12-15', total: 75.00, status: 'delivered' },
        { orderNumber: 'ORD-R-025', date: '2023-11-20', total: 50.00, status: 'delivered' },
      ],
    },
  ]);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = filterSegment === 'all' || customer.status === filterSegment;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'orders':
        return b.totalOrders - a.totalOrders;
      case 'spent':
        return b.totalSpent - a.totalSpent;
      case 'recent':
        return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: Customer['status']) => {
    switch (status) {
      case 'vip': return 'VIP Customer';
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active' || c.status === 'vip').length,
    vip: customers.filter(c => c.status === 'vip').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrderValue: customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length,
  };

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-gray-600 mt-1">Manage your customer relationships</p>
          </div>
          <Button style={{ backgroundColor: '#BE220E' }} className="text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Total Customers</div>
            <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Active</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{stats.active}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">VIP</div>
            <div className="text-2xl font-bold mt-1 text-purple-600">{stats.vip}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Inactive</div>
            <div className="text-2xl font-bold mt-1 text-gray-600">{stats.inactive}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Total Revenue</div>
            <div className="text-2xl font-bold mt-1 text-green-600">${stats.totalRevenue.toFixed(0)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Avg Order Value</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">${stats.averageOrderValue.toFixed(0)}</div>
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
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterSegment} onValueChange={setFilterSegment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="vip">VIP Customers</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="orders">Most Orders</SelectItem>
                  <SelectItem value="spent">Highest Spender</SelectItem>
                  <SelectItem value="recent">Recent Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{customer.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                    {getStatusLabel(customer.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{customer.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                    <ShoppingBag className="w-3 h-3" />
                    Total Orders
                  </div>
                  <div className="text-xl font-bold" style={{ color: '#BE220E' }}>
                    {customer.totalOrders}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                    <DollarSign className="w-3 h-3" />
                    Total Spent
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    ${customer.totalSpent.toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg Order Value</span>
                  <span className="font-medium">${customer.averageOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Order</span>
                  <span className="font-medium">{new Date(customer.lastOrderDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">{new Date(customer.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowViewModal(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyEmail(customer.email)}
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <EmptyState
            icon={ShoppingBag}
            title={searchTerm || filterSegment !== 'all' ? 'No customers match your filters' : 'No customers yet'}
            description={searchTerm || filterSegment !== 'all' ? 'Try adjusting your search or segment filter.' : 'Customers who purchase from you will appear here.'}
            action={searchTerm || filterSegment !== 'all' ? { label: 'Clear Filters', onClick: () => { setSearchTerm(''); setFilterSegment('all'); } } : undefined}
          />
        )}
      </div>

      {/* View Customer Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{selectedCustomer.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCustomer.status)}`}>
                    {getStatusLabel(selectedCustomer.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3">Contact Information</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-medium">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Address</Label>
                      <p className="font-medium">{selectedCustomer.address}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Member Since</Label>
                      <p className="font-medium">{new Date(selectedCustomer.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Purchase Analytics</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm">Total Orders</span>
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold" style={{ color: '#BE220E' }}>
                        {selectedCustomer.totalOrders}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm">Total Spent</span>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        ${selectedCustomer.totalSpent.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm">Average Order Value</span>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        ${selectedCustomer.averageOrderValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">Recent Order History</h4>
                <div className="space-y-2">
                  {selectedCustomer.orderHistory.map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <div className="flex-1">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: '#BE220E' }}>
                          ${order.total.toFixed(2)}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Last Order Date</div>
                  <div className="font-medium">
                    {new Date(selectedCustomer.lastOrderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            <Button style={{ backgroundColor: '#BE220E' }} className="text-white">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
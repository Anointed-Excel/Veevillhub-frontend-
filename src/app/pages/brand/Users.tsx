import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

export default function BrandUsers() {
  const [admins, setAdmins] = useState<Admin[]>([
    { id: '1', name: 'Super Admin', email: 'admin@veevillhub.com', role: 'Super Admin', status: 'active', createdAt: '2024-01-01', lastLogin: '2 min ago' },
    { id: '2', name: 'John Manager', email: 'john@veevillhub.com', role: 'Admin', status: 'active', createdAt: '2024-02-15', lastLogin: '1 hour ago' },
    { id: '3', name: 'Sarah Ops', email: 'sarah@veevillhub.com', role: 'Operations', status: 'active', createdAt: '2024-03-20', lastLogin: '5 hours ago' },
    { id: '4', name: 'Mike Support', email: 'mike@veevillhub.com', role: 'Support', status: 'suspended', createdAt: '2024-04-10', lastLogin: '3 days ago' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Admin' });

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
    const matchesRole = filterRole === 'all' || admin.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCreate = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }
    const newAdmin: Admin = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
    };
    setAdmins([...admins, newAdmin]);
    setShowCreateModal(false);
    setFormData({ name: '', email: '', role: 'Admin' });
    toast.success('Admin created successfully');
  };

  const handleEdit = () => {
    if (!selectedAdmin) return;
    setAdmins(admins.map((admin) =>
      admin.id === selectedAdmin.id
        ? { ...admin, name: formData.name, email: formData.email, role: formData.role }
        : admin
    ));
    setShowEditModal(false);
    setSelectedAdmin(null);
    setFormData({ name: '', email: '', role: 'Admin' });
    toast.success('Admin updated successfully');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      setAdmins(admins.filter((admin) => admin.id !== id));
      toast.success('Admin deleted successfully');
    }
  };

  const handleToggleStatus = (id: string) => {
    setAdmins(admins.map((admin) =>
      admin.id === id
        ? { ...admin, status: admin.status === 'active' ? 'suspended' : 'active' }
        : admin
    ));
    toast.success('Admin status updated');
  };

  const handleView = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({ name: admin.name, email: admin.email, role: admin.role });
    setShowEditModal(true);
  };

  const handleExport = () => {
    toast.success('Exporting data...');
    // Simulate export
    setTimeout(() => toast.success('Data exported successfully'), 1000);
  };

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Users (Admin Management)</h1>
            <p className="text-gray-600 mt-1">Manage platform administrators</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="text-white"
            style={{ backgroundColor: '#BE220E' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Admins</div>
            <div className="text-2xl font-bold mt-1">{admins.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {admins.filter((a) => a.status === 'active').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Suspended</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {admins.filter((a) => a.status === 'suspended').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Results</div>
            <div className="text-2xl font-bold mt-1">{filteredAdmins.length}</div>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-medium">
                          {admin.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{admin.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          admin.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleView(admin)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          onClick={() => handleEditClick(admin)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-yellow-50"
                        >
                          <Edit2 className="w-4 h-4 text-yellow-600" />
                        </Button>
                        <Button
                          onClick={() => handleToggleStatus(admin.id)}
                          variant="ghost"
                          size="sm"
                          className={admin.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                        >
                          {admin.status === 'active' ? (
                            <Ban className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        {admin.role !== 'Super Admin' && (
                          <Button
                            onClick={() => handleDelete(admin.id)}
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>Create a new administrator account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter admin name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@veevillhub.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Admin</DialogTitle>
              <DialogDescription>Update administrator details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Details</DialogTitle>
            </DialogHeader>
            {selectedAdmin && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-bold text-2xl">
                    {selectedAdmin.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{selectedAdmin.name}</div>
                    <div className="text-gray-600">{selectedAdmin.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Role</div>
                    <div className="font-medium mt-1">{selectedAdmin.role}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-medium mt-1 capitalize">{selectedAdmin.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Created At</div>
                    <div className="font-medium mt-1">{selectedAdmin.createdAt}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Login</div>
                    <div className="font-medium mt-1">{selectedAdmin.lastLogin}</div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

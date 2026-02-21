import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { Plus, Search, Download, Eye, Edit2, Trash2, Ban, CheckCircle, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLogin: string;
}

function normalize(raw: Record<string, unknown>): Admin {
  return {
    id: raw.id as string,
    name: (raw.full_name as string) || '',
    email: (raw.business_email as string) || '',
    role: ((raw.role as string) || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    status: (raw.is_active ? 'active' : 'suspended') as Admin['status'],
    createdAt: raw.created_at ? new Date(raw.created_at as string).toLocaleDateString() : '—',
    lastLogin: raw.last_login ? new Date(raw.last_login as string).toLocaleString() : 'Never',
  };
}

export default function BrandUsers() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'admin', password: '' });
  const [saving, setSaving] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ admins: Record<string, unknown>[] }>('/admin/all');
      setAdmins((res.data.admins || []).map(normalize));
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
    const matchesRole = filterRole === 'all' || admin.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/add', {
        full_name: formData.name,
        business_email: formData.email,
        role: formData.role,
        password: formData.password,
      });
      toast.success('Admin created successfully. Login credentials sent by email.');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', role: 'admin', password: '' });
      loadAdmins();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (admin: Admin) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/${admin.id}/status`, { status: newStatus });
      setAdmins((prev) => prev.map((a) => a.id === admin.id ? { ...a, status: newStatus } : a));
      toast.success(`Admin ${newStatus === 'active' ? 'activated' : 'suspended'}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update status');
    }
  };

  const handleExport = () => {
    const csv = ['Name,Email,Role,Status,Created'].concat(
      admins.map((a) => `${a.name},${a.email},${a.role},${a.status},${a.createdAt}`)
    ).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'admins.csv';
    link.click();
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
          <Button onClick={() => setShowCreateModal(true)} className="text-white" style={{ backgroundColor: '#BE220E' }}>
            <Plus className="w-4 h-4 mr-2" />Add Admin
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />Export
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
            <div className="text-2xl font-bold mt-1 text-green-600">{admins.filter((a) => a.status === 'active').length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Suspended</div>
            <div className="text-2xl font-bold mt-1 text-red-600">{admins.filter((a) => a.status === 'suspended').length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Results</div>
            <div className="text-2xl font-bold mt-1">{filteredAdmins.length}</div>
          </Card>
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No admins found</td></tr>
                  ) : filteredAdmins.map((admin) => (
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${admin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.lastLogin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button onClick={() => { setSelectedAdmin(admin); setShowViewModal(true); }} variant="ghost" size="sm" className="hover:bg-blue-50">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button onClick={() => handleToggleStatus(admin)} variant="ghost" size="sm" className={admin.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}>
                            {admin.status === 'active' ? <Ban className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>Create a new administrator account. A temporary password will be sent by email.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter admin name" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="admin@example.com" />
              </div>
              <div>
                <Label>Temporary Password *</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="text-white" style={{ backgroundColor: '#BE220E' }} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>Admin Details</DialogTitle></DialogHeader>
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
                  <div><div className="text-sm text-gray-600">Role</div><div className="font-medium mt-1">{selectedAdmin.role}</div></div>
                  <div><div className="text-sm text-gray-600">Status</div><div className="font-medium mt-1 capitalize">{selectedAdmin.status}</div></div>
                  <div><div className="text-sm text-gray-600">Created At</div><div className="font-medium mt-1">{selectedAdmin.createdAt}</div></div>
                  <div><div className="text-sm text-gray-600">Last Login</div><div className="font-medium mt-1">{selectedAdmin.lastLogin}</div></div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

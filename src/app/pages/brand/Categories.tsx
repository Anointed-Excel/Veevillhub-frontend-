import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Plus, Search, ChevronRight, ChevronDown, Edit2, Trash2, Tag,
  Layers, CheckCircle, XCircle, Loader2, FolderOpen, Folder,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  children: Category[];
}

interface FormState {
  name: string;
  description: string;
  parentId: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { name: '', description: '', parentId: '', isActive: true };

// ── Helpers ───────────────────────────────────────────────────────────────────

function countAll(cats: Category[]): number {
  return cats.reduce((sum, c) => sum + 1 + countAll(c.children), 0);
}

function countActive(cats: Category[]): number {
  return cats.reduce(
    (sum, c) => sum + (c.is_active ? 1 : 0) + countActive(c.children),
    0,
  );
}

function countSubs(cats: Category[]): number {
  return cats.reduce((sum, c) => sum + c.children.length + countSubs(c.children), 0);
}

// Flatten tree to a list for the "parent" select
function flattenForSelect(cats: Category[], depth = 0): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  cats.forEach((c) => {
    result.push({ id: c.id, label: `${'— '.repeat(depth)}${c.name}` });
    result.push(...flattenForSelect(c.children, depth + 1));
  });
  return result;
}

// ── Row component ─────────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  depth,
  onEdit,
  onDelete,
  onToggle,
  onAddSub,
  searchQuery,
}: {
  cat: Category;
  depth: number;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onToggle: (cat: Category) => void;
  onAddSub: (parent: Category) => void;
  searchQuery: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = cat.children.length > 0;

  // Keep expanded when searching
  useEffect(() => {
    if (searchQuery) setExpanded(true);
  }, [searchQuery]);

  return (
    <>
      <tr className="hover:bg-gray-50 group">
        {/* Name */}
        <td className="px-6 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-400 hover:text-gray-700 transition flex-shrink-0"
              >
                {expanded
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-4 flex-shrink-0" />
            )}
            {depth === 0
              ? hasChildren
                ? <FolderOpen className="w-4 h-4 text-[#BE220E] flex-shrink-0" />
                : <Folder className="w-4 h-4 text-[#BE220E] flex-shrink-0" />
              : <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            <span className={`font-medium ${depth > 0 ? 'text-sm text-gray-700' : ''}`}>
              {cat.name}
            </span>
            {cat.children.length > 0 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {cat.children.length}
              </span>
            )}
          </div>
        </td>

        {/* Slug */}
        <td className="px-6 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>

        {/* Description */}
        <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">
          {cat.description || <span className="text-gray-300">—</span>}
        </td>

        {/* Status */}
        <td className="px-6 py-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {cat.is_active
              ? <CheckCircle className="w-3 h-3" />
              : <XCircle className="w-3 h-3" />}
            {cat.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>

        {/* Level */}
        <td className="px-6 py-3 text-sm text-gray-500">
          {depth === 0 ? 'Parent' : 'Subcategory'}
        </td>

        {/* Actions */}
        <td className="px-6 py-3">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            {depth === 0 && (
              <Button
                onClick={() => onAddSub(cat)}
                variant="ghost"
                size="sm"
                title="Add subcategory"
              >
                <Plus className="w-4 h-4 text-green-600" />
              </Button>
            )}
            <Button onClick={() => onEdit(cat)} variant="ghost" size="sm" title="Edit">
              <Edit2 className="w-4 h-4 text-blue-600" />
            </Button>
            <Button
              onClick={() => onToggle(cat)}
              variant="ghost"
              size="sm"
              title={cat.is_active ? 'Deactivate' : 'Activate'}
            >
              {cat.is_active
                ? <XCircle className="w-4 h-4 text-yellow-600" />
                : <CheckCircle className="w-4 h-4 text-green-600" />}
            </Button>
            <Button onClick={() => onDelete(cat)} variant="ghost" size="sm" title="Delete">
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </td>
      </tr>

      {/* Children */}
      {expanded &&
        cat.children.map((child) => (
          <CategoryRow
            key={child.id}
            cat={child}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onAddSub={onAddSub}
            searchQuery={searchQuery}
          />
        ))}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BrandCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [presetParent, setPresetParent] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ categories: Category[] }>('/categories');
      setCategories((res.data as unknown as { categories: Category[] }).categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Filtered view ────────────────────────────────────────────────────────────

  const filterTree = (cats: Category[], q: string): Category[] => {
    if (!q) return cats;
    const lq = q.toLowerCase();
    return cats.reduce<Category[]>((acc, cat) => {
      const filteredChildren = filterTree(cat.children, q);
      const matches = cat.name.toLowerCase().includes(lq) ||
        (cat.description || '').toLowerCase().includes(lq) ||
        cat.slug.toLowerCase().includes(lq);
      if (matches || filteredChildren.length > 0) {
        acc.push({ ...cat, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const visible = filterTree(categories, searchQuery);

  // ── Open modals ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingCat(null);
    setPresetParent(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openAddSub = (parent: Category) => {
    setEditingCat(null);
    setPresetParent(parent);
    setForm({ ...EMPTY_FORM, parentId: parent.id });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setPresetParent(null);
    setForm({
      name: cat.name,
      description: cat.description || '',
      parentId: cat.parent_id || '',
      isActive: cat.is_active,
    });
    setShowModal(true);
  };

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        parentId: form.parentId || null,
      };

      if (editingCat) {
        body.isActive = form.isActive;
        await api.patch(`/categories/${editingCat.id}`, body);
        toast.success('Category updated');
      } else {
        await api.post('/categories', body);
        toast.success('Category created');
      }

      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ────────────────────────────────────────────────────────────

  const handleToggle = async (cat: Category) => {
    try {
      await api.patch(`/categories/${cat.id}`, { isActive: !cat.is_active });
      toast.success(`Category ${!cat.is_active ? 'activated' : 'deactivated'}`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update category');
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      toast.success('Category deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const total = countAll(categories);
  const active = countActive(categories);
  const subs = countSubs(categories);
  const parentCount = categories.length;

  const parentOptions = flattenForSelect(categories);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-gray-600 mt-1">Manage product categories and subcategories</p>
          </div>
          <Button onClick={openCreate} className="text-white" style={{ backgroundColor: '#BE220E' }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold mt-1">{loading ? '…' : total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Parent Categories</div>
            <div className="text-2xl font-bold mt-1 text-[#BE220E]">{loading ? '…' : parentCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Subcategories</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{loading ? '…' : subs}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{loading ? '…' : active}</div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-48 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    </tr>
                  ))
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-2">
                      <EmptyState
                        icon={Layers}
                        title={searchQuery ? 'No categories match your search' : 'No categories yet'}
                        description={
                          searchQuery
                            ? 'Try a different search term.'
                            : 'Create your first category to organise products.'
                        }
                        action={
                          searchQuery
                            ? { label: 'Clear Search', onClick: () => setSearchQuery('') }
                            : { label: 'Add Category', onClick: openCreate }
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  visible.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      cat={cat}
                      depth={0}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                      onToggle={handleToggle}
                      onAddSub={openAddSub}
                      searchQuery={searchQuery}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create / Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCat
                  ? 'Edit Category'
                  : presetParent
                  ? `Add Subcategory under "${presetParent.name}"`
                  : 'Add Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCat
                  ? 'Update the category details below.'
                  : 'Fill in the details to create a new category.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Electronics"
                />
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              {/* Parent Category */}
              <div>
                <Label>Parent Category</Label>
                <Select
                  value={form.parentId || 'none'}
                  onValueChange={(v) => setForm({ ...form, parentId: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level category)</SelectItem>
                    {parentOptions
                      .filter((o) => o.id !== editingCat?.id)
                      .map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active toggle — only on edit */}
              {editingCat && (
                <div className="flex items-center gap-3">
                  <Label>Status</Label>
                  <Select
                    value={form.isActive ? 'active' : 'inactive'}
                    onValueChange={(v) => setForm({ ...form, isActive: v === 'active' })}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="text-white"
                style={{ backgroundColor: '#BE220E' }}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingCat ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Modal */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Delete <span className="font-semibold">"{deleteTarget?.name}"</span>?
                {(deleteTarget?.children.length ?? 0) > 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    This category has subcategories — delete them first.
                  </span>
                )}
                {(deleteTarget?.children.length ?? 0) === 0 && (
                  <span className="block mt-2">
                    This cannot be undone. Products assigned to this category must be reassigned first.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting || (deleteTarget?.children.length ?? 0) > 0}
              >
                {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}

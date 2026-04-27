import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Trash2, Package, Image as ImageIcon, Loader2, Edit } from 'lucide-react';

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; sku: string; categoryId: string;
  price: number; moq: number; stock: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'archived';
  image: string; description: string; salesPrice?: number;
}

const emptyForm = { name: '', sku: '', categoryId: '', price: '', salesPrice: '', moq: '1', stock: '0', description: '', status: 'active' as Product['status'] };

export default function BrandMyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get<unknown>('/products'),
        api.get<unknown>('/shop/categories'),
      ]);
      const prodData = prodRes.data as Record<string, unknown>;
      const catData = catRes.data as Record<string, unknown>;

      const allProducts = (prodData.products || []) as Record<string, unknown>[];
      // Filter to only this admin's products by user_id
      const mine = allProducts.filter((p) => !p.user_id || p.user_id === user?.id);
      setProducts(mine.map((p) => ({
        id: p.id as string,
        name: (p.name as string) || '',
        sku: (p.sku as string) || '',
        categoryId: (p.category_id as string) || '',
        price: Number(p.regular_price) || 0,
        moq: Number(p.moq) || 1,
        stock: Number(p.stock_quantity) || 0,
        status: (p.status as Product['status']) || 'draft',
        image: (p.image_url as string) || '',
        description: (p.description as string) || '',
        salesPrice: p.sales_price ? Number(p.sales_price) : undefined,
      })));

      const rawCats = (catData.categories || []) as Record<string, unknown>[];
      const flat: Category[] = [];
      const flatten = (items: Record<string, unknown>[]) => {
        items.forEach((c) => { flat.push({ id: c.id as string, name: c.name as string }); if (c.children) flatten(c.children as Record<string, unknown>[]); });
      };
      flatten(rawCats);
      setCategories(flat);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setImageFile(null); setImagePreview(''); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, sku: p.sku, categoryId: p.categoryId, price: String(p.price), salesPrice: p.salesPrice ? String(p.salesPrice) : '', moq: String(p.moq), stock: String(p.stock), description: p.description, status: p.status });
    setEditingId(p.id); setImageFile(null); setImagePreview(p.image); setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) { toast.error('Name, price and category are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('sku', form.sku);
      fd.append('category_id', form.categoryId);
      fd.append('regular_price', form.price);
      if (form.salesPrice) fd.append('sales_price', form.salesPrice);
      fd.append('moq', form.moq);
      fd.append('stock_quantity', form.stock);
      fd.append('description', form.description);
      fd.append('status', form.status);
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        await api.patch(`/products/${editingId}`, fd);
        toast.success('Product updated');
      } else {
        await api.post('/products', fd);
        toast.success('Product created');
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const statusColors = { active: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-700', out_of_stock: 'bg-red-100 text-red-700', archived: 'bg-yellow-100 text-yellow-700' };

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Products</h1>
            <p className="text-gray-600 mt-1">Products you sell directly as the platform vendor</p>
          </div>
          <Button onClick={openCreate} className="bg-[#BE220E] hover:bg-[#9a1b0b]">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling." action={{ label: 'Add Product', onClick: openCreate }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Card key={p.id} className="overflow-hidden hover:shadow-lg transition">
                <div className="h-40 bg-gray-100 relative">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-300" /></div>}
                  <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">SKU: {p.sku || '—'}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-[#BE220E]">₦{p.price.toLocaleString()}</span>
                      {p.salesPrice && <span className="text-xs text-gray-400 line-through ml-2">₦{p.salesPrice.toLocaleString()}</span>}
                    </div>
                    <span className="text-sm text-gray-500">Stock: {p.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1"><Edit className="w-3 h-3 mr-1" />Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image */}
              <div>
                <Label>Product Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  {imagePreview ? <img src={imagePreview} alt="" className="w-20 h-20 object-cover rounded-lg border" /> : <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>}
                  <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>Upload Image</Button>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Product Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="mt-1" required />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" className="mt-1" />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Regular Price (₦) *</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" className="mt-1" required />
                </div>
                <div>
                  <Label>Sale Price (₦)</Label>
                  <Input type="number" value={form.salesPrice} onChange={(e) => setForm({ ...form, salesPrice: e.target.value })} placeholder="Optional" className="mt-1" />
                </div>
                <div>
                  <Label>MOQ</Label>
                  <Input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} placeholder="1" className="mt-1" />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" className="mt-1" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Product['status'] })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." rows={3} className="mt-1" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 bg-[#BE220E] hover:bg-[#9a1b0b]" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? 'Update Product' : 'Create Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

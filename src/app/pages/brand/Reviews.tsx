import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Search, Star, Eye, EyeOff, Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  is_hidden: boolean;
  created_at: string;
  product: { name: string };
  user: { full_name: string };
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'visible', label: 'Visible' },
  { key: 'hidden', label: 'Hidden' },
];

export default function BrandReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'visible' | 'hidden'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async (pg = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '20' });
      if (tab === 'visible') params.set('isHidden', 'false');
      if (tab === 'hidden') params.set('isHidden', 'true');
      const res = await api.get<unknown>(`/admin/reviews?${params}`);
      const data = res.data as Record<string, unknown>;
      const raw = (data.reviews || []) as Record<string, unknown>[];
      setReviews(raw.map((r) => ({
        id: r.id as string,
        rating: Number(r.rating) || 0,
        comment: (r.comment as string) || '',
        is_hidden: !!(r.is_hidden),
        created_at: (r.created_at as string) || '',
        product: { name: ((r.product as Record<string, unknown>)?.name as string) || 'Unknown Product' },
        user: { full_name: ((r.user as Record<string, unknown>)?.full_name as string) || 'Anonymous' },
      })));
      const pagination = res.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setPage(pagination.page || pg);
      }
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); load(1); }, [tab]);

  const handleToggleVisibility = async (review: Review) => {
    setProcessingId(review.id);
    try {
      await api.patch(`/admin/reviews/${review.id}/visibility`, { isHidden: !review.is_hidden });
      setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, is_hidden: !r.is_hidden } : r));
      toast.success(review.is_hidden ? 'Review made visible' : 'Review hidden');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this review?')) return;
    setProcessingId(id);
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete review');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.product.name.toLowerCase().includes(q) ||
      r.user.full_name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  });

  const starColor = (n: number) => n >= 4 ? 'text-green-600' : n >= 3 ? 'text-yellow-500' : 'text-red-500';

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Review Moderation</h1>
            <p className="text-gray-600 mt-1">Manage customer reviews across all products</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
                tab === t.key ? 'border-[#BE220E] text-[#BE220E]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search product, reviewer, comment..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No reviews found" description="Reviews will appear here once customers start leaving feedback." />
        ) : (
          <div className="space-y-3">
            {filtered.map((review) => (
              <Card key={review.id} className={`p-4 transition ${review.is_hidden ? 'opacity-60 bg-gray-50' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? `fill-current ${starColor(review.rating)}` : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${review.is_hidden ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {review.is_hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{review.comment || <span className="text-gray-400 italic">No comment</span>}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span><span className="font-medium text-gray-700">Product:</span> {review.product.name}</span>
                      <span><span className="font-medium text-gray-700">By:</span> {review.user.full_name}</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingId === review.id}
                      onClick={() => handleToggleVisibility(review)}
                      title={review.is_hidden ? 'Show review' : 'Hide review'}
                      className="h-8 w-8 p-0"
                    >
                      {review.is_hidden ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingId === review.id}
                      onClick={() => handleDelete(review.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); load(p); }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { const p = page + 1; setPage(p); load(p); }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

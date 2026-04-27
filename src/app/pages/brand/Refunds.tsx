import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Search, RotateCcw, CheckCircle, XCircle, Clock, Loader2, ChevronRight } from 'lucide-react';

interface ReturnRequest {
  id: string;
  order_id: string;
  order_number: string;
  buyer_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'received' | 'refunded';
  created_at: string;
  items: { product_name: string; quantity: number; price: number }[];
  total_refund_amount: number;
}

const statusConfig = {
  pending:  { label: 'Pending',  color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  approved: { label: 'Approved', color: 'text-blue-700',   bg: 'bg-blue-100',   icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-700',    bg: 'bg-red-100',    icon: XCircle },
  received: { label: 'Received', color: 'text-purple-700', bg: 'bg-purple-100', icon: RotateCcw },
  refunded: { label: 'Refunded', color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
};

export default function BrandRefunds() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [filtered, setFiltered] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<ReturnRequest | null>(null);

  const load = () => {
    setLoading(true);
    api.get<unknown>('/admin/returns')
      .then((res) => {
        const data = res.data as Record<string, unknown>;
        const raw = (Array.isArray(data) ? data : (data.returns as unknown[]) || []) as Record<string, unknown>[];
        const mapped: ReturnRequest[] = raw.map((r) => ({
          id: r.id as string,
          order_id: r.order_id as string,
          order_number: (r.order_number as string) || (r.order_id as string),
          buyer_name: (r.buyer_name as string) || (r.user_name as string) || 'Unknown',
          reason: (r.reason as string) || '',
          status: (r.status as ReturnRequest['status']) || 'pending',
          created_at: (r.created_at as string) || '',
          items: (r.items as ReturnRequest['items']) || [],
          total_refund_amount: Number(r.total_refund_amount) || 0,
        }));
        setReturns(mapped);
        setFiltered(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let f = returns;
    if (search) f = f.filter((r) =>
      r.order_number.toLowerCase().includes(search.toLowerCase()) ||
      r.buyer_name.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') f = f.filter((r) => r.status === statusFilter);
    setFiltered(f);
  }, [search, statusFilter, returns]);

  const doAction = async (returnId: string, action: 'approve' | 'reject' | 'receive' | 'refund') => {
    setActionLoading(returnId + action);
    try {
      const urlMap = {
        approve: `/admin/returns/${returnId}/approve`,
        reject: `/admin/returns/${returnId}/reject`,
        receive: `/admin/returns/${returnId}/receive`,
        refund: `/admin/returns/${returnId}/refund`,
      };
      const method = action === 'refund' ? 'post' : 'patch';
      await (api as any)[method](urlMap[action]);
      toast.success(`Return ${action}d successfully`);
      load();
      setSelected(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const statuses = ['all', 'pending', 'approved', 'rejected', 'received', 'refunded'];

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Returns & Refunds</h1>
          <p className="text-gray-600 mt-1">Manage buyer return requests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by order or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  statusFilter === s ? 'bg-[#BE220E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No return requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Order</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Buyer</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Reason</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Date</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r) => {
                    const cfg = statusConfig[r.status];
                    const Icon = cfg.icon;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">#{r.order_number}</td>
                        <td className="px-6 py-4 text-gray-700">{r.buyer_name}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{r.reason}</td>
                        <td className="px-6 py-4 font-semibold text-[#BE220E]">
                          ₦{r.total_refund_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelected(r)}
                            className="text-[#BE220E] hover:underline flex items-center gap-1 text-sm"
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Return #{selected.order_number}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Buyer</p>
                  <p className="font-medium">{selected.buyer_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-medium">{new Date(selected.created_at).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Reason</p>
                  <p className="font-medium">{selected.reason}</p>
                </div>
              </div>

              {selected.items.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Items</p>
                  <div className="space-y-2">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between font-bold border-t pt-3">
                <span>Refund Amount</span>
                <span className="text-[#BE220E]">₦{selected.total_refund_amount.toLocaleString()}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => doAction(selected.id, 'approve')}
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                      disabled={!!actionLoading}
                    >
                      {actionLoading === selected.id + 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => doAction(selected.id, 'reject')}
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 flex-1"
                      disabled={!!actionLoading}
                    >
                      {actionLoading === selected.id + 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
                    </Button>
                  </>
                )}
                {selected.status === 'approved' && (
                  <Button
                    onClick={() => doAction(selected.id, 'receive')}
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                    disabled={!!actionLoading}
                  >
                    {actionLoading === selected.id + 'receive' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark as Received'}
                  </Button>
                )}
                {selected.status === 'received' && (
                  <Button
                    onClick={() => doAction(selected.id, 'refund')}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    disabled={!!actionLoading}
                  >
                    {actionLoading === selected.id + 'refund' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Issue Refund'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

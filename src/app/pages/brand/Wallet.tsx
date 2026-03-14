import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Transaction {
  id: string;
  type: 'credit' | 'info';
  amount: number;
  description: string;
  status: string;
  paymentStatus: string;
  date: string;
}

interface WalletData {
  balance: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  growth: number;
  totalRevenue: number;
  totalWithdrawals: number;
  pending: number;
  transactions: Transaction[];
}

export default function BrandWallet() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<WalletData>('/admin/wallet')
      .then((res) => setData(res.data as unknown as WalletData))
      .catch(() => toast.error('Failed to load wallet data'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `₦${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Wallet</h1>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <Card className="p-8 bg-gradient-to-br from-[#BE220E] to-[#8B1A0B] text-white">
              <div className="text-sm opacity-90 mb-2">Platform Revenue (Delivered Orders)</div>
              <div className="text-5xl font-bold mb-6">
                {data ? fmt(data.balance) : '—'}
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-sm opacity-90">This Month</div>
                  <div className="text-xl font-bold">
                    {data ? `+${fmt(data.revenueThisMonth)}` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-90">vs Last Month</div>
                  <div className="text-xl font-bold flex items-center gap-1">
                    <TrendingUp className="w-5 h-5" />
                    {data ? `${data.growth >= 0 ? '+' : ''}${data.growth}%` : '—'}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <Button
                  className="bg-white text-[#BE220E] hover:bg-gray-100"
                  onClick={() => toast.info('Withdrawal system coming soon')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold mt-1 text-green-600">
                  {data ? fmt(data.totalRevenue) : '—'}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Total Withdrawals</div>
                <div className="text-2xl font-bold mt-1 text-blue-600">
                  {data ? fmt(data.totalWithdrawals) : '—'}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold mt-1 text-yellow-600">
                  {data ? fmt(data.pending) : '—'}
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Recent Order Activity</h2>
              {data && data.transactions.length > 0 ? (
                <div className="space-y-4">
                  {data.transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          txn.type === 'credit' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {txn.type === 'credit' ? (
                            <ArrowDownRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{txn.description}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(txn.date).toLocaleDateString()} · {txn.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-500'}`}>
                        {txn.type === 'credit' ? '+' : ''}{fmt(txn.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-4">No transactions yet.</p>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function BrandWallet() {
  const transactions = [
    { id: '1', type: 'credit', amount: '+$12,450', description: 'Commission from orders', date: '2 hours ago' },
    { id: '2', type: 'debit', amount: '-$5,000', description: 'Withdrawal processed', date: '1 day ago' },
    { id: '3', type: 'credit', amount: '+$8,900', description: 'Commission from orders', date: '2 days ago' },
    { id: '4', type: 'debit', amount: '-$3,500', description: 'Refund processed', date: '3 days ago' },
  ];

  return (
    <DashboardLayout role="brand">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Wallet</h1>

        {/* Balance Card */}
        <Card className="p-8 bg-gradient-to-br from-[#BE220E] to-[#8B1A0B] text-white">
          <div className="text-sm opacity-90 mb-2">Platform Balance</div>
          <div className="text-5xl font-bold mb-6">$485,678.50</div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm opacity-90">This Month</div>
              <div className="text-xl font-bold">+$45,230</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Growth</div>
              <div className="text-xl font-bold flex items-center gap-1">
                <TrendingUp className="w-5 h-5" />
                +24.5%
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/20">
            <Button className="bg-white text-[#BE220E] hover:bg-gray-100">
              <DollarSign className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold mt-1 text-green-600">$1,245,890</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Withdrawals</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">$760,211</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">$0</div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {txn.type === 'credit' ? (
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{txn.description}</div>
                    <div className="text-sm text-gray-500">{txn.date}</div>
                  </div>
                </div>
                <div className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.amount}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

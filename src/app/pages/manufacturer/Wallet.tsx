import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { DollarSign, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, Download } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

export default function ManufacturerWallet() {
  const [balance] = useState(8900.50);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const [transactions] = useState<Transaction[]>([
    { id: '1', type: 'credit', description: 'Payment from Lagos Mega Store', amount: 5198.00, date: '2024-01-10 14:30', status: 'completed' },
    { id: '2', type: 'credit', description: 'Payment from Sunny Mart', amount: 2775.00, date: '2024-01-12 10:15', status: 'completed' },
    { id: '3', type: 'debit', description: 'Withdrawal to bank account', amount: 2000.00, date: '2024-01-08 16:45', status: 'completed' },
    { id: '4', type: 'credit', description: 'Payment from Quick Shop', amount: 4500.00, date: '2024-01-14 11:20', status: 'completed' },
    { id: '5', type: 'debit', description: 'Platform fee', amount: 89.50, date: '2024-01-14 11:21', status: 'completed' },
    { id: '6', type: 'credit', description: 'Payment from Fresh Market', amount: 7797.00, date: '2024-01-15 09:00', status: 'pending' },
  ]);

  const totalEarnings = transactions
    .filter((t) => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (!bankAccount) {
      toast.error('Please enter bank account details');
      return;
    }

    toast.success(`Withdrawal of $${amount.toFixed(2)} initiated`);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setBankAccount('');
  };

  const handleExport = () => {
    toast.success('Exporting transaction history...');
  };

  return (
    <DashboardLayout role="manufacturer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Wallet</h1>
            <p className="text-gray-600 mt-1">Manage your earnings and withdrawals</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="p-8 bg-gradient-to-br from-[#BE220E] to-[#8B1A0A]">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm opacity-90">Available Balance</span>
            </div>
            <div className="text-5xl font-bold mb-6">${balance.toFixed(2)}</div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowWithdrawModal(true)} className="bg-white text-[#BE220E] hover:bg-gray-100">
                Withdraw Funds
              </Button>
              <div className="text-sm opacity-90">
                <div>This Month: +$4,270</div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +24.5% growth
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-600">Total Earnings</div>
            <div className="text-3xl font-bold mt-2 text-green-600">${totalEarnings.toFixed(2)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600">Total Withdrawals</div>
            <div className="text-3xl font-bold mt-2 text-blue-600">${totalWithdrawals.toFixed(2)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-3xl font-bold mt-2 text-yellow-600">${pendingAmount.toFixed(2)}</div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No transactions yet"
              description="Payments from retailers will appear here once orders are fulfilled."
            />
          ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">{transaction.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </Card>

        {/* Withdraw Modal */}
        <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Available Balance:</strong> ${balance.toFixed(2)}
                </p>
              </div>
              <div>
                <Label htmlFor="amount">Withdrawal Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bank">Bank Account</Label>
                <Input
                  id="bank"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Account number or details"
                  className="mt-1"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-900">
                  <strong>Note:</strong> Withdrawals are processed within 2-3 business days.
                  A platform fee of 2% will be deducted.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
              <Button onClick={handleWithdraw} className="text-white" style={{ backgroundColor: '#BE220E' }}>
                Confirm Withdrawal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

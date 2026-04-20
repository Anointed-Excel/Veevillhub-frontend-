import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Wallet, Download, Plus, Minus, TrendingUp, TrendingDown, Calendar, Search, Filter, DollarSign, CreditCard } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: 'order' | 'withdrawal' | 'refund' | 'purchase' | 'fee';
  amount: number;
  balance: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  processedDate?: string;
}

export default function RetailerWallet() {
  const [balance] = useState(15240.50);
  const [pendingBalance] = useState(2345.00);
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'credit',
      category: 'order',
      amount: 129.97,
      balance: 15240.50,
      description: 'Payment from order ORD-R-001',
      date: '2024-01-14 09:45 AM',
      status: 'completed',
      reference: 'TXN-001-2024',
    },
    {
      id: '2',
      type: 'credit',
      category: 'order',
      amount: 112.97,
      balance: 15110.53,
      description: 'Payment from order ORD-R-002',
      date: '2024-01-14 11:30 AM',
      status: 'completed',
      reference: 'TXN-002-2024',
    },
    {
      id: '3',
      type: 'debit',
      category: 'withdrawal',
      amount: 500.00,
      balance: 14997.56,
      description: 'Withdrawal to First Bank',
      date: '2024-01-13 02:15 PM',
      status: 'completed',
      reference: 'TXN-003-2024',
    },
    {
      id: '4',
      type: 'debit',
      category: 'purchase',
      amount: 2500.00,
      balance: 15497.56,
      description: 'Bulk purchase from Textile Masters Ltd',
      date: '2024-01-13 10:20 AM',
      status: 'completed',
      reference: 'TXN-004-2024',
    },
    {
      id: '5',
      type: 'credit',
      category: 'order',
      amount: 101.99,
      balance: 17997.56,
      description: 'Payment from order ORD-R-003',
      date: '2024-01-13 04:30 PM',
      status: 'completed',
      reference: 'TXN-005-2024',
    },
    {
      id: '6',
      type: 'credit',
      category: 'refund',
      amount: 85.00,
      balance: 17895.57,
      description: 'Refund for cancelled order ORD-R-005',
      date: '2024-01-13 05:00 PM',
      status: 'completed',
      reference: 'TXN-006-2024',
    },
    {
      id: '7',
      type: 'debit',
      category: 'fee',
      amount: 15.50,
      balance: 17810.57,
      description: 'Platform transaction fee',
      date: '2024-01-12 11:59 PM',
      status: 'completed',
      reference: 'TXN-007-2024',
    },
    {
      id: '8',
      type: 'credit',
      category: 'order',
      amount: 245.50,
      balance: 17826.07,
      description: 'Payment from order ORD-R-008',
      date: '2024-01-12 08:20 AM',
      status: 'completed',
      reference: 'TXN-008-2024',
    },
  ]);

  const [withdrawalHistory] = useState<WithdrawalRequest[]>([
    {
      id: '1',
      amount: 500.00,
      bankName: 'First Bank of Nigeria',
      accountNumber: '****5678',
      requestDate: '2024-01-13 02:00 PM',
      status: 'completed',
      processedDate: '2024-01-13 02:15 PM',
    },
    {
      id: '2',
      amount: 1000.00,
      bankName: 'Access Bank',
      accountNumber: '****9012',
      requestDate: '2024-01-10 10:30 AM',
      status: 'completed',
      processedDate: '2024-01-10 03:45 PM',
    },
    {
      id: '3',
      amount: 750.00,
      bankName: 'GTBank',
      accountNumber: '****3456',
      requestDate: '2024-01-08 09:15 AM',
      status: 'completed',
      processedDate: '2024-01-08 04:20 PM',
    },
  ]);

  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesCategory = filterCategory === 'all' || txn.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!bankName || !accountNumber) {
      toast.error('Please fill in all bank details');
      return;
    }

    toast.success(`Withdrawal request for $${amount.toFixed(2)} submitted successfully`);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setBankName('');
    setAccountNumber('');
  };

  const getTypeColor = (type: Transaction['type']) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getTypeIcon = (type: Transaction['type']) => {
    return type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getCategoryLabel = (category: Transaction['category']) => {
    switch (category) {
      case 'order': return 'Order Payment';
      case 'withdrawal': return 'Withdrawal';
      case 'refund': return 'Refund';
      case 'purchase': return 'Bulk Purchase';
      case 'fee': return 'Platform Fee';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    totalCredit: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
    totalDebit: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
    totalWithdrawals: withdrawalHistory.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0),
    transactionCount: transactions.length,
  };

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Wallet</h1>
            <p className="text-gray-600 mt-1">Manage your finances and transactions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              style={{ backgroundColor: '#BE220E' }} 
              className="text-white"
              onClick={() => setShowWithdrawModal(true)}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-[#BE220E] to-[#8B1A0A] text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm opacity-90 mb-2">Available Balance</div>
                <div className="text-4xl font-bold">${balance.toFixed(2)}</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full bg-white text-[#BE220E] hover:bg-gray-100 border-0"
              onClick={() => setShowWithdrawModal(true)}
            >
              Withdraw Funds
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm text-gray-600 mb-2">Pending Balance</div>
                <div className="text-3xl font-bold text-yellow-600">${pendingBalance.toFixed(2)}</div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Processing orders</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Withdrawn</div>
                <div className="text-3xl font-bold text-blue-600">${stats.totalWithdrawals.toFixed(2)}</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{withdrawalHistory.filter(w => w.status === 'completed').length} withdrawals</p>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Total Income</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              ${stats.totalCredit.toFixed(2)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Total Expenses</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              ${stats.totalDebit.toFixed(2)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Net Profit</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              ${(stats.totalCredit - stats.totalDebit).toFixed(2)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Transactions</div>
            <div className="text-2xl font-bold mt-1" style={{ color: '#BE220E' }}>
              {stats.transactionCount}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="order">Orders</SelectItem>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                      <SelectItem value="purchase">Purchases</SelectItem>
                      <SelectItem value="refund">Refunds</SelectItem>
                      <SelectItem value="fee">Fees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <div className={getTypeColor(txn.type)}>
                          {getTypeIcon(txn.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{getCategoryLabel(txn.category)}</div>
                        <div className="text-sm text-gray-600">{txn.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {txn.date} • {txn.reference}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTypeColor(txn.type)}`}>
                        {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Balance: ${txn.balance.toFixed(2)}
                      </div>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <EmptyState
                  icon={Wallet}
                  title={searchQuery || filterType !== 'all' || filterCategory !== 'all' ? 'No transactions match your filters' : 'No transactions yet'}
                  description={searchQuery || filterType !== 'all' || filterCategory !== 'all' ? 'Try adjusting your search or filters.' : 'Your earnings and withdrawals will appear here.'}
                  action={searchQuery || filterType !== 'all' || filterCategory !== 'all' ? { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setFilterType('all'); setFilterCategory('all'); } } : undefined}
                />
              )}
            </Card>
          </div>

          {/* Withdrawal History */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Withdrawal History</h2>
              <div className="space-y-3">
                {withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg" style={{ color: '#BE220E' }}>
                        ${withdrawal.amount.toFixed(2)}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3" />
                        {withdrawal.bankName}
                      </div>
                      <div>{withdrawal.accountNumber}</div>
                      <div className="text-xs">Requested: {withdrawal.requestDate}</div>
                      {withdrawal.processedDate && (
                        <div className="text-xs text-green-600">
                          Processed: {withdrawal.processedDate}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Enter withdrawal details to transfer funds to your bank account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Available Balance</div>
              <div className="text-3xl font-bold" style={{ color: '#BE220E' }}>
                ${balance.toFixed(2)}
              </div>
            </div>

            <div>
              <Label>Withdrawal Amount ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-sm text-gray-600 mt-1">
                Maximum: ${balance.toFixed(2)}
              </p>
            </div>

            <div>
              <Label>Bank Name *</Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_bank">First Bank of Nigeria</SelectItem>
                  <SelectItem value="access_bank">Access Bank</SelectItem>
                  <SelectItem value="gtbank">GTBank</SelectItem>
                  <SelectItem value="zenith_bank">Zenith Bank</SelectItem>
                  <SelectItem value="uba">United Bank for Africa (UBA)</SelectItem>
                  <SelectItem value="stanbic">Stanbic IBTC Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Account Number *</Label>
              <Input
                type="text"
                placeholder="1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                maxLength={10}
              />
            </div>

            {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-2">Withdrawal Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">${parseFloat(withdrawAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">You will receive</span>
                    <span className="font-bold text-green-600">
                      ${parseFloat(withdrawAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: '#BE220E' }} 
              className="text-white"
              onClick={handleWithdraw}
            >
              Request Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

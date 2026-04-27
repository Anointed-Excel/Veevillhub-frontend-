import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { CheckCircle, XCircle, Loader2, ShoppingBag, Package } from 'lucide-react';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!reference) { setStatus('failed'); return; }

    api.get<unknown>(`/payments/verify/${reference}`)
      .then((res) => {
        const data = res.data as Record<string, unknown>;
        const payment = (data.payment || data) as Record<string, unknown>;
        const paid = (payment.status as string) === 'paid' || (payment.status as string) === 'success';
        setOrderNumber((payment.order_number as string) || (payment.order_id as string) || '');
        setAmount(Number(payment.amount) || 0);
        setStatus(paid ? 'success' : 'failed');
      })
      .catch(() => setStatus('failed'));
  }, [reference]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#BE220E] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your payment has been confirmed and your order is being processed.</p>

          {(orderNumber || amount > 0) && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
              {orderNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-semibold">#{orderNumber}</span>
                </div>
              )}
              {amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-semibold text-green-600">₦{(amount / 100).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono text-xs">{reference}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/buyer/orders">
              <Button className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]">
                <Package className="w-4 h-4 mr-2" />
                View My Orders
              </Button>
            </Link>
            <Link to="/buyer">
              <Button variant="outline" className="w-full">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          We couldn't verify your payment. Your order has been saved — you can retry payment from your orders page.
        </p>
        <div className="space-y-3">
          <Link to="/buyer/orders">
            <Button className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]">
              <Package className="w-4 h-4 mr-2" />
              Go to My Orders
            </Button>
          </Link>
          <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

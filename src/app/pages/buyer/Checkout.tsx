import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Wallet,
  Smartphone,
  Check,
  Lock,
  Package,
  Truck,
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();

  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'transfer' | 'delivery'>('card');

  // Address form state
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '+234 801 234 5678',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Payment form state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Order confirmation
  const [orderId, setOrderId] = useState('');

  const shippingFee = cartTotal > 50000 ? 0 : 1500;
  const total = cartTotal + shippingFee;

  if (cartItems.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No items to checkout</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart first</p>
          <Link to="/buyer">
            <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.address || !address.city || !address.state) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    // Generate order ID
    const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setOrderId(newOrderId);

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('buyer_orders') || '[]');
    const newOrder = {
      id: newOrderId,
      userId: user?.id,
      items: cartItems,
      subtotal: cartTotal,
      shippingFee,
      total,
      shippingAddress: address,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    orders.push(newOrder);
    localStorage.setItem('buyer_orders', JSON.stringify(orders));

    // Clear cart
    clearCart();

    // Show confirmation
    setStep('confirmation');
    toast.success('Order placed successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            {step !== 'confirmation' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step === 'payment') setStep('address');
                  else navigate(-1);
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold">
              {step === 'confirmation' ? 'Order Confirmed' : 'Checkout'}
            </h1>
          </div>

          {/* Progress Steps */}
          {step !== 'confirmation' && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'address'
                      ? 'bg-[#BE220E] text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {step === 'payment' ? <Check className="w-5 h-5" /> : '1'}
                </div>
                <span className="text-sm font-medium">Address</span>
              </div>

              <div className="w-12 h-0.5 bg-gray-300" />

              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'payment'
                      ? 'bg-[#BE220E] text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  2
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Address Step */}
        {step === 'address' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#BE220E]" />
                  Shipping Address
                </h2>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      placeholder="Enter your street address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State *</Label>
                      <select
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE220E]"
                        required
                      >
                        <option value="">Select State</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Kano">Kano</option>
                        <option value="Oyo">Oyo</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]">
                    Continue to Payment
                  </Button>
                </form>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="font-bold mb-4">Order Summary</h3>

                <div className="space-y-3 mb-4">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-[#BE220E]">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-sm text-gray-600">
                      +{cartItems.length - 3} more items
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? 'Free' : `₦${shippingFee.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-[#BE220E]">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#BE220E]" />
                  Payment Method
                </h2>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'card'
                        ? 'border-[#BE220E] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'wallet'
                        ? 'border-[#BE220E] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'transfer'
                        ? 'border-[#BE220E] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="font-medium">Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('delivery')}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'delivery'
                        ? 'border-[#BE220E] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span className="font-medium">Cash on Delivery</span>
                  </button>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Card Payment Form */}
                  {paymentMethod === 'card' && (
                    <>
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                          }
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardName">Cardholder Name *</Label>
                        <Input
                          id="cardName"
                          value={cardDetails.cardName}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cardName: e.target.value })
                          }
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={(e) =>
                              setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                            }
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            value={cardDetails.cvv}
                            onChange={(e) =>
                              setCardDetails({ ...cardDetails, cvv: e.target.value })
                            }
                            placeholder="123"
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <Lock className="w-4 h-4" />
                        Your payment information is secure and encrypted
                      </div>
                    </>
                  )}

                  {/* Wallet Payment */}
                  {paymentMethod === 'wallet' && (
                    <div className="text-center py-6">
                      <Wallet className="w-16 h-16 text-[#BE220E] mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Pay with your VeeVill Hub Wallet</p>
                      <p className="text-sm text-gray-500">
                        You will be redirected to complete the payment
                      </p>
                    </div>
                  )}

                  {/* Bank Transfer */}
                  {paymentMethod === 'transfer' && (
                    <div className="text-center py-6">
                      <Smartphone className="w-16 h-16 text-[#BE220E] mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Pay via Bank Transfer</p>
                      <p className="text-sm text-gray-500">
                        You will receive bank details after placing the order
                      </p>
                    </div>
                  )}

                  {/* Cash on Delivery */}
                  {paymentMethod === 'delivery' && (
                    <div className="text-center py-6">
                      <Truck className="w-16 h-16 text-[#BE220E] mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Pay when you receive your order</p>
                      <p className="text-sm text-gray-500">
                        Cash or POS payment available on delivery
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]">
                    <Lock className="w-4 h-4 mr-2" />
                    Place Order - ₦{total.toLocaleString()}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="font-bold mb-4">Delivery Address</h3>
                <div className="text-sm space-y-1 mb-4">
                  <p className="font-medium">{address.fullName}</p>
                  <p className="text-gray-600">{address.phone}</p>
                  <p className="text-gray-600">{address.address}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.state}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('address')}
                  className="w-full"
                >
                  Edit Address
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your order has been confirmed.
              </p>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-[#BE220E] mb-4">{orderId}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Total Amount</p>
                    <p className="font-bold">₦{total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Payment Method</p>
                    <p className="font-bold capitalize">{paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/buyer/orders" className="flex-1">
                  <Button className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]">
                    View Order Details
                  </Button>
                </Link>
                <Link to="/buyer" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

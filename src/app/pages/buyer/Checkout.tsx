import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
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
  Loader2,
} from 'lucide-react';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();

  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'transfer' | 'delivery'>('card');
  const [placing, setPlacing] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Address data
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  // New address form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Order confirmation
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Load addresses and states on mount
  useEffect(() => {
    api.get<unknown>('/checkout/addresses').then((res) => {
      const data = res.data as Record<string, unknown>;
      const raw = (data.addresses || []) as Record<string, unknown>[];
      const mapped: SavedAddress[] = raw.map((a) => ({
        id: (a.id as string) || '',
        fullName: (a.full_name as string) || '',
        phone: (a.phone_number as string) || '',
        address: (a.street_address as string) || '',
        city: (a.city as string) || '',
        state: (a.state as string) || '',
        zipCode: (a.zipcode as string) || '',
        isDefault: !!(a.is_default),
      }));
      setSavedAddresses(mapped);
      const defaultAddr = mapped.find((a) => a.isDefault) || mapped[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        fetchShippingFee(defaultAddr.state);
      } else {
        setShowNewAddressForm(true);
      }
    }).catch(() => {
      setShowNewAddressForm(true);
    });

    api.get<unknown>('/checkout/states').then((res) => {
      const data = res.data as Record<string, unknown>;
      setStates((data.states as string[]) || []);
    }).catch(() => {});
  }, []);

  const fetchShippingFee = (state: string) => {
    if (!state) return;
    api.get<unknown>(`/checkout/shipping-fee?state=${encodeURIComponent(state)}`).then((res) => {
      const data = res.data as Record<string, unknown>;
      setShippingFee(Number(data.shippingFee) || 0);
    }).catch(() => setShippingFee(0));
  };

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

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showNewAddressForm) {
      if (!address.address || !address.city || !address.state || !address.zipCode) {
        toast.error('Please fill in all required fields');
        return;
      }
      setSavingAddress(true);
      try {
        const res = await api.post<unknown>('/checkout/address', {
          fullName: address.fullName,
          phoneNumber: address.phone,
          streetAddress: address.address,
          city: address.city,
          state: address.state,
          zipcode: address.zipCode,
          isDefault: savedAddresses.length === 0,
        });
        const saved = res.data as Record<string, unknown>;
        const newAddr: SavedAddress = {
          id: (saved.id as string) || '',
          fullName: (saved.full_name as string) || address.fullName,
          phone: (saved.phone_number as string) || address.phone,
          address: (saved.street_address as string) || address.address,
          city: (saved.city as string) || address.city,
          state: (saved.state as string) || address.state,
          zipCode: (saved.zipcode as string) || address.zipCode,
          isDefault: !!(saved.is_default),
        };
        setSavedAddresses((prev) => [...prev, newAddr]);
        setSelectedAddressId(newAddr.id);
        fetchShippingFee(newAddr.state);
        setShowNewAddressForm(false);
        setStep('payment');
      } catch {
        toast.error('Failed to save address. Please try again.');
      } finally {
        setSavingAddress(false);
      }
    } else {
      if (!selectedAddressId) {
        toast.error('Please select a delivery address');
        return;
      }
      setStep('payment');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    if (!selectedAddressId) {
      toast.error('No delivery address selected');
      setStep('address');
      return;
    }

    setPlacing(true);
    try {
      const body: Record<string, unknown> = { shippingAddressId: selectedAddressId };
      if (promoCode.trim()) body.promoCode = promoCode.trim();

      const res = await api.post<unknown>('/checkout/place-order', body);
      const order = res.data as Record<string, unknown>;

      setOrderNumber((order.order_number as string) || (order.id as string) || '');
      setOrderTotal(Number(order.total) || total);

      clearCart();
      setStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

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
                  Delivery Address
                </h2>

                {/* Saved addresses */}
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="space-y-3 mb-4">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedAddressId === addr.id
                            ? 'border-[#BE220E] bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            fetchShippingFee(addr.state);
                          }}
                          className="mt-1 accent-[#BE220E]"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-semibold">{addr.fullName}</p>
                          <p className="text-gray-600">{addr.phone}</p>
                          <p className="text-gray-600">{addr.address}</p>
                          <p className="text-gray-600">
                            {addr.city}, {addr.state} {addr.zipCode}
                          </p>
                          {addr.isDefault && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-[#BE220E] text-white text-xs rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </label>
                    ))}

                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#BE220E] hover:text-[#BE220E] transition"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* New address form */}
                {showNewAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-sm text-[#BE220E] hover:underline mb-2"
                      >
                        ← Use saved address
                      </button>
                    )}

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
                          placeholder="+234 801 234 5678"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="streetAddress">Street Address *</Label>
                      <Input
                        id="streetAddress"
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
                          onChange={(e) => {
                            setAddress({ ...address, state: e.target.value });
                            fetchShippingFee(e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE220E]"
                          required
                        >
                          <option value="">Select State</option>
                          {states.length > 0
                            ? states.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))
                            : (
                              <>
                                <option value="Lagos">Lagos</option>
                                <option value="Abuja">Abuja</option>
                                <option value="Rivers">Rivers</option>
                                <option value="Kano">Kano</option>
                                <option value="Oyo">Oyo</option>
                              </>
                            )}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="zipCode">Zip Code *</Label>
                        <Input
                          id="zipCode"
                          value={address.zipCode}
                          onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]"
                      disabled={savingAddress}
                    >
                      {savingAddress ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Address...</>
                      ) : (
                        'Continue to Payment'
                      )}
                    </Button>
                  </form>
                )}

                {/* Submit for saved address selection */}
                {!showNewAddressForm && savedAddresses.length > 0 && (
                  <Button
                    onClick={handleAddressSubmit as unknown as React.MouseEventHandler}
                    className="w-full bg-[#BE220E] hover:bg-[#9a1b0b] mt-2"
                  >
                    Continue to Payment
                  </Button>
                )}
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
                    <p className="text-sm text-gray-600">+{cartItems.length - 3} more items</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? 'Calculated at next step' : `₦${shippingFee.toLocaleString()}`}</span>
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
                  {paymentMethod === 'card' && (
                    <>
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
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
                          onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
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
                            onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
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
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
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

                  {paymentMethod === 'wallet' && (
                    <div className="text-center py-6">
                      <Wallet className="w-16 h-16 text-[#BE220E] mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Pay with your Anointed Wallet</p>
                      <p className="text-sm text-gray-500">You will be redirected to complete the payment</p>
                    </div>
                  )}

                  {paymentMethod === 'transfer' && (
                    <div className="text-center py-6">
                      <Smartphone className="w-16 h-16 text-[#BE220E] mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Pay via Bank Transfer</p>
                      <p className="text-sm text-gray-500">You will receive bank details after placing the order</p>
                    </div>
                  )}

                  {paymentMethod === 'delivery' && (
                    <div className="text-center py-6">
                      <Truck className="w-16 h-16 text-[#BE220E] mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Pay when you receive your order</p>
                      <p className="text-sm text-gray-500">Cash or POS payment available on delivery</p>
                    </div>
                  )}

                  {/* Promo code */}
                  <div>
                    <Label htmlFor="promoCode">Promo Code (optional)</Label>
                    <Input
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#BE220E] hover:bg-[#9a1b0b]"
                    disabled={placing}
                  >
                    {placing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...</>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Place Order — ₦{total.toLocaleString()}
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Delivery address summary */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-6">
                <h3 className="font-bold mb-2">Delivery Address</h3>
                {selectedAddress && (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{selectedAddress.fullName}</p>
                    <p className="text-gray-600">{selectedAddress.phone}</p>
                    <p className="text-gray-600">{selectedAddress.address}</p>
                    <p className="text-gray-600">{selectedAddress.city}, {selectedAddress.state}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('address')}
                  className="w-full mt-3"
                >
                  Edit Address
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-3">Order Total</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
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
                <p className="text-2xl font-bold text-[#BE220E] mb-4">{orderNumber}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Total Amount</p>
                    <p className="font-bold">₦{orderTotal.toLocaleString()}</p>
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

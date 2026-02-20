import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Heart,
  Home,
  Package,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    cartTotal,
    cartCount,
    wishlistCount,
    addToWishlist,
  } = useCart();

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success('Item removed from cart');
  };

  const handleMoveToWishlist = (item: any) => {
    addToWishlist({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      retailerId: item.retailerId,
      retailerName: item.retailerName,
    });
    removeFromCart(item.id);
    toast.success('Moved to wishlist');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const shippingFee = cartTotal > 50000 ? 0 : 1500;
  const total = cartTotal + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Shopping Cart</h1>
            </div>
            <Link to="/buyer/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#BE220E] text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add some products to get started
            </p>
            <Link to="/buyer">
              <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Shopping Cart ({cartCount})</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/buyer/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#BE220E] text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/buyer/product/${item.productId}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/buyer/product/${item.productId}`}
                      className="font-semibold hover:text-[#BE220E] line-clamp-2 mb-1"
                    >
                      {item.name}
                    </Link>

                    <p className="text-sm text-gray-600 mb-2">{item.retailerName}</p>

                    {item.variant && (
                      <p className="text-sm text-gray-600 mb-2">
                        Variant: {item.variant}
                      </p>
                    )}

                    <p className="text-lg font-bold text-[#BE220E] mb-3">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveToWishlist(item)}
                          className="text-gray-600 hover:text-[#BE220E]"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₦{cartTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `₦${shippingFee.toLocaleString()}`
                    )}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Add ₦{(50000 - cartTotal).toLocaleString()} more for free shipping
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[#BE220E]">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/buyer/checkout')}
                className="w-full bg-[#BE220E] hover:bg-[#9a1b0b] mb-3"
              >
                Proceed to Checkout
              </Button>

              <Link to="/buyer">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Package className="w-5 h-5 text-[#BE220E] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-gray-600">On orders above ₦50,000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Tag className="w-5 h-5 text-[#BE220E] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Best Prices</p>
                    <p className="text-gray-600">Guaranteed lowest prices</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold text-[#BE220E]">
              ₦{total.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={() => navigate('/buyer/checkout')}
            className="bg-[#BE220E] hover:bg-[#9a1b0b]"
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}

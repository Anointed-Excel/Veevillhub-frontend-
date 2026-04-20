import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import EmptyState from '@/app/components/EmptyState';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Home,
  Package,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, moveToCart, cartCount, wishlistCount } = useCart();

  const handleMoveToCart = (itemId: string) => {
    moveToCart(itemId);
    toast.success('Moved to cart');
  };

  const handleRemove = (itemId: string) => {
    removeFromWishlist(itemId);
    toast.success('Removed from wishlist');
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      wishlistItems.forEach((item) => removeFromWishlist(item.id));
      toast.success('Wishlist cleared');
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Wishlist</h1>
            </div>
            <Link to="/buyer/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#BE220E] text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love and find them here later."
            action={{ label: 'Browse Products', onClick: () => navigate('/buyer/shop') }}
          />
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
            <h1 className="text-xl font-bold">Wishlist ({wishlistCount})</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/buyer/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#BE220E] text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition group">
              <Link to={`/buyer/product/${item.productId}`} className="block">
                <div className="relative overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/buyer/product/${item.productId}`}>
                  <h3 className="font-semibold mb-1 hover:text-[#BE220E] line-clamp-2">
                    {item.name}
                  </h3>
                </Link>

                <p className="text-xl font-bold text-[#BE220E] mb-3">
                  ₦{item.price.toLocaleString()}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleMoveToCart(item.id)}
                    className="flex-1 bg-[#BE220E] hover:bg-[#9a1b0b]"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => handleRemove(item.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              wishlistItems.forEach((item) => moveToCart(item.id));
              toast.success('All items moved to cart');
            }}
            className="bg-[#BE220E] hover:bg-[#9a1b0b]"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add All to Cart
          </Button>
          <Link to="/buyer">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around">
          <Link to="/buyer" className="flex flex-col items-center gap-1 text-gray-600">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/buyer/orders"
            className="flex flex-col items-center gap-1 text-gray-600"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link
            to="/buyer/wishlist"
            className="flex flex-col items-center gap-1 text-[#BE220E]"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Wishlist</span>
          </Link>
          <Link
            to="/buyer/profile"
            className="flex flex-col items-center gap-1 text-gray-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

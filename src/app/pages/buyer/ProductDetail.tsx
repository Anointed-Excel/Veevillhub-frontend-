import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils/clipboard';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
  Store,
  Plus,
  Minus,
  Share2,
  ChevronRight,
  User,
  ThumbsUp,
  Home,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  retailerId?: string;
  retailerName?: string;
  manufacturerId?: string;
  manufacturerName?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  discount?: number;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  verified: boolean;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, cartCount, wishlistCount } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('default');
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Load product
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const found = products.find((p: any) => p.id === id);

    if (found) {
      const enhancedProduct = {
        ...found,
        retailerId: found.retailerId || '3',
        retailerName: found.retailerName || 'Test Retailer',
        rating: found.rating || (Math.random() * 2 + 3).toFixed(1),
        reviews: found.reviews || Math.floor(Math.random() * 500) + 50,
        inStock: found.stock > 0,
        discount: found.discount || (Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0),
      };
      setProduct(enhancedProduct);

      // Generate mock reviews
      const mockReviews: Review[] = Array.from({ length: 5 }, (_, i) => ({
        id: String(i + 1),
        userName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'][i],
        rating: Math.floor(Math.random() * 2) + 4,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        comment: [
          'Great product! Exactly as described. Would definitely recommend.',
          'Good quality and fast shipping. Very satisfied with my purchase.',
          'Nice product but slightly overpriced. Still worth it though.',
          'Excellent! Better than I expected. Will buy again.',
          'Very happy with this purchase. Quality is top-notch.',
        ][i],
        helpful: Math.floor(Math.random() * 20) + 5,
        verified: Math.random() > 0.3,
      }));
      setReviews(mockReviews);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/buyer">
            <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      quantity,
      image: product.images[selectedImage],
      retailerId: product.retailerId || '3',
      retailerName: product.retailerName || 'Test Retailer',
      variant: selectedVariant !== 'default' ? selectedVariant : undefined,
    });
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/buyer/cart');
  };

  const handleAddToWishlist = () => {
    addToWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[selectedImage],
      retailerId: product.retailerId || '3',
      retailerName: product.retailerName || 'Test Retailer',
    });
    toast.success('Added to wishlist!');
  };

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      toast.success('Product link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/buyer" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#BE220E] rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden md:inline">VeeVill Hub</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <Card className="overflow-hidden mb-4">
              <div className="relative bg-gray-100 aspect-square">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount > 0 && (
                  <div className="absolute top-4 right-4 bg-[#BE220E] text-white px-3 py-2 rounded-lg font-bold">
                    -{product.discount}% OFF
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    selectedImage === index
                      ? 'border-[#BE220E]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm mb-2">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-600">({reviews.length} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mb-6 text-gray-600">
                <Store className="w-4 h-4" />
                <Link
                  to={`/buyer/retailer/${product.retailerId}`}
                  className="hover:text-[#BE220E] hover:underline"
                >
                  {product.retailerName}
                </Link>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-[#BE220E]">
                  ₦{finalPrice.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <span className="text-xl text-gray-500 line-through">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <p className="text-green-600 font-medium">In Stock</p>
                ) : (
                  <p className="text-red-600 font-medium">Out of Stock</p>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.inStock}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  disabled={!product.inStock}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.inStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-[#BE220E] hover:bg-[#9a1b0b] disabled:bg-gray-300"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleAddToWishlist}
                variant="outline"
                className="px-6"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <Button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              variant="outline"
              className="w-full mb-6"
            >
              Buy Now
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-[#BE220E]" />
                <p className="text-xs text-gray-600">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-[#BE220E]" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-[#BE220E]" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'description'
                    ? 'border-b-2 border-[#BE220E] text-[#BE220E]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-[#BE220E] text-[#BE220E]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-40 text-gray-600">Category:</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Manufacturer:</span>
                      <span className="font-medium">{product.manufacturerName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Retailer:</span>
                      <span className="font-medium">{product.retailerName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Availability:</span>
                      <span className="font-medium">
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="flex items-start gap-8 pb-6 border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{reviews.length} reviews</p>
                  </div>

                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter((r) => r.rating === stars).length;
                      const percentage = (count / reviews.length) * 100;
                      return (
                        <div key={stars} className="flex items-center gap-2 mb-2">
                          <span className="text-sm w-8">{stars} ★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#BE220E] text-white rounded-full flex items-center justify-center font-medium">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{review.userName}</span>
                              {review.verified && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#BE220E]">
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-[#BE220E] hover:bg-[#9a1b0b] disabled:bg-gray-300"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            variant="outline"
            className="flex-1"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
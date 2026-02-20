import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import {
  Home,
  ShoppingCart,
  Package,
  User,
  Heart,
  Search,
  Star,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Monitor,
  Shirt,
  Sofa,
  Dumbbell,
  Smartphone,
  Watch,
  Headphones,
  Camera,
  Laptop,
  Tv,
  GameController,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
  productCount: number;
  image: string;
  subcategories: string[];
}

const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets and tech devices',
    icon: Monitor,
    productCount: 1234,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Cameras'],
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Trending styles and accessories',
    icon: Sparkles,
    productCount: 2456,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    subcategories: ["Men's Wear", "Women's Wear", 'Shoes', 'Bags', 'Jewelry', 'Accessories'],
  },
  {
    id: 'home',
    name: 'Home & Living',
    description: 'Furniture and home decor',
    icon: Sofa,
    productCount: 987,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Storage', 'Lighting'],
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    description: 'Cosmetics and skincare',
    icon: Star,
    productCount: 1543,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Bath & Body', 'Tools'],
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    description: 'Gear for active lifestyle',
    icon: Dumbbell,
    productCount: 765,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    subcategories: ['Equipment', 'Apparel', 'Shoes', 'Supplements', 'Accessories', 'Outdoor'],
  },
  {
    id: 'phones',
    name: 'Phones & Tablets',
    description: 'Mobile devices and accessories',
    icon: Smartphone,
    productCount: 892,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    subcategories: ['Smartphones', 'Feature Phones', 'Tablets', 'Cases', 'Chargers', 'Screen Protectors'],
  },
  {
    id: 'watches',
    name: 'Watches',
    description: 'Timepieces and smartwatches',
    icon: Watch,
    productCount: 543,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    subcategories: ['Smartwatches', 'Luxury Watches', 'Fashion Watches', 'Sports Watches', 'Straps', 'Accessories'],
  },
  {
    id: 'audio',
    name: 'Audio & Headphones',
    description: 'Sound systems and accessories',
    icon: Headphones,
    productCount: 678,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    subcategories: ['Headphones', 'Earbuds', 'Speakers', 'Sound Bars', 'Amplifiers', 'Accessories'],
  },
];

export default function BuyerCategories() {
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.subcategories.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery]);

  const handleCategoryClick = (categoryId: string) => {
    // Navigate to home with category filter
    navigate(`/buyer?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/buyer" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#BE220E] rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">All Categories</h1>
            </Link>
            <div className="flex-1"></div>
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Header Banner */}
        <div className="mb-8 bg-gradient-to-r from-[#BE220E] to-[#9a1b0b] rounded-2xl p-6 md:p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Shop by Category</h2>
          <p className="text-white/90">
            Explore thousands of products across multiple categories
          </p>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">Try a different search term</p>
            <Button
              onClick={() => setSearchQuery('')}
              className="bg-[#BE220E] hover:bg-[#9a1b0b]"
            >
              Clear Search
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {/* Category Image */}
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg">
                      <Icon className="w-6 h-6 text-[#BE220E]" />
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="text-xl font-bold">{category.name}</h3>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        {category.productCount.toLocaleString()} products
                      </span>
                      <span className="text-xs font-semibold text-[#BE220E]">
                        Shop Now →
                      </span>
                    </div>

                    {/* Subcategories */}
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Popular:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.slice(0, 3).map((sub, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {sub}
                          </span>
                        ))}
                        {category.subcategories.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{category.subcategories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Links Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/buyer/deals">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer text-center">
                <TrendingUp className="w-8 h-8 text-[#BE220E] mx-auto mb-2" />
                <h3 className="font-semibold">Flash Deals</h3>
                <p className="text-xs text-gray-600">Today's best offers</p>
              </Card>
            </Link>
            <Link to="/buyer">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer text-center">
                <Star className="w-8 h-8 text-[#BE220E] mx-auto mb-2" />
                <h3 className="font-semibold">Top Rated</h3>
                <p className="text-xs text-gray-600">Highly rated products</p>
              </Card>
            </Link>
            <Link to="/buyer">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer text-center">
                <Sparkles className="w-8 h-8 text-[#BE220E] mx-auto mb-2" />
                <h3 className="font-semibold">New Arrivals</h3>
                <p className="text-xs text-gray-600">Latest products</p>
              </Card>
            </Link>
            <Link to="/buyer/orders">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer text-center">
                <Package className="w-8 h-8 text-[#BE220E] mx-auto mb-2" />
                <h3 className="font-semibold">My Orders</h3>
                <p className="text-xs text-gray-600">Track your purchases</p>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around">
          <Link to="/buyer" className="flex flex-col items-center gap-1 text-gray-600">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/buyer/orders" className="flex flex-col items-center gap-1 text-gray-600">
            <Package className="w-5 h-5" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link
            to="/buyer/wishlist"
            className="flex flex-col items-center gap-1 text-gray-600 relative"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 right-0 w-4 h-4 bg-[#BE220E] text-white text-xs rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/buyer/profile" className="flex flex-col items-center gap-1 text-gray-600">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

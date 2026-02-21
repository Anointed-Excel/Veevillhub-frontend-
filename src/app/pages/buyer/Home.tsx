import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Menu,
  Search,
  Filter,
  Star,
  MapPin,
  ChevronRight,
  Grid,
  List,
  TrendingUp,
  Sparkles,
  Tag,
  X,
  Zap,
  Gift,
  Clock,
  Bell,
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  discount?: number;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
}

const categories = [
  { id: 'all', name: 'All Products', icon: Grid },
  { id: 'fashion', name: 'Fashion', icon: Sparkles },
  { id: 'electronics', name: 'Electronics', icon: Package },
  { id: 'home', name: 'Home & Living', icon: Home },
  { id: 'beauty', name: 'Beauty', icon: Star },
  { id: 'sports', name: 'Sports', icon: TrendingUp },
];

export default function BuyerHome() {
  const { user } = useAuth();
  const { cartCount, wishlistCount, addToCart, addToWishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Load products from localStorage
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Enhance products with additional buyer-specific data
    const enhancedProducts = storedProducts.map((p: any, index: number) => ({
      ...p,
      retailerId: p.retailerId || '3',
      retailerName: p.retailerName || 'Test Retailer',
      rating: p.rating || (Math.random() * 2 + 3).toFixed(1),
      reviews: p.reviews || Math.floor(Math.random() * 500) + 50,
      inStock: p.stock > 0,
      discount: p.discount || (Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0),
      isFeatured: index < 4,
      isFlashDeal: index % 5 === 0,
    }));

    setProducts(enhancedProducts);
    setFilteredProducts(enhancedProducts);
    setFeaturedProducts(enhancedProducts.filter((p: Product) => p.isFeatured).slice(0, 4));
    setFlashDeals(enhancedProducts.filter((p: Product) => p.isFlashDeal).slice(0, 6));
  }, []);

  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) =>
        p.category.toLowerCase().includes(selectedCategory)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      default:
        // Featured - no additional sorting
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, priceRange, sortBy, products]);

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  const handleAddToWishlist = (product: Product) => {
    addToWishlist(product.id);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="overflow-hidden hover:shadow-lg transition group">
      <Link to={`/buyer/product/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover group-hover:scale-105 transition w-full h-48"
          />
          {product.discount > 0 && (
            <div className="absolute top-2 right-2 bg-[#BE220E] text-white px-2 py-1 rounded-lg text-xs font-bold">
              -{product.discount}%
            </div>
          )}
          {product.isFlashDeal && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Flash Deal
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/buyer/product/${product.id}`}>
          <h3 className="font-semibold mb-1 hover:text-[#BE220E] line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            ({product.reviews} reviews)
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
          <MapPin className="w-3 h-3" />
          <span>{product.retailerName}</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          {product.discount > 0 ? (
            <>
              <span className="text-xl font-bold text-[#BE220E]">
                ₦{(product.price * (1 - product.discount / 100)).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₦{product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-[#BE220E]">
              ₦{product.price.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleAddToCart(product)}
            disabled={!product.inStock}
            className="flex-1 bg-[#BE220E] hover:bg-[#9a1b0b] disabled:bg-gray-300"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
          <Button
            onClick={() => handleAddToWishlist(product)}
            variant="outline"
            size="sm"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link to="/buyer" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#BE220E] rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">Anointed</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/buyer/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#BE220E] rounded-full"></span>
                </Button>
              </Link>
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
              <Link to="/buyer/profile">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4"
            />
          </div>
        </div>

        {/* Categories - Desktop */}
        <div className="hidden md:block border-t border-gray-200">
          <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto">
            <Link to="/buyer/categories">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition bg-gray-100 text-gray-700 hover:bg-gray-200">
                <Grid className="w-4 h-4" />
                All Categories
              </button>
            </Link>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-[#BE220E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <nav className="space-y-2">
            <Link
              to="/buyer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/buyer/orders"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <Package className="w-5 h-5" />
              <span>My Orders</span>
            </Link>
            <Link
              to="/buyer/wishlist"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </Link>
            <Link
              to="/buyer/profile"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Categories - Mobile */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-[#BE220E] text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-7xl mx-auto">
        {/* Promotional Banner */}
        <div className="mb-6 bg-gradient-to-r from-[#BE220E] to-[#9a1b0b] rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Flash Sale Today!</h2>
              <p className="text-white/90 mb-4">Get up to 50% off on selected items</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Ends in 23:45:12</span>
              </div>
            </div>
            <Link to="/buyer/deals">
              <Button className="bg-white text-[#BE220E] hover:bg-gray-100">
                Shop Now
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Flash Deals Section */}
        {flashDeals.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Flash Deals</h2>
              </div>
              <Link to="/buyer/deals">
                <Button variant="outline" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-[#BE220E]" />
                <h2 className="text-2xl font-bold">Featured Products</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Filters and Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <p className="text-sm text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#BE220E]"
            >
              <option value="featured">Featured</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div className="hidden md:flex items-center gap-1 ml-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-[#BE220E]' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-[#BE220E]' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Price Range</h3>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="Min"
                    className="w-24"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    placeholder="Max"
                    className="w-24"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange([0, 10000])}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* All Products Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-4">All Products</h2>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange([0, 10000]);
              }}
              className="bg-[#BE220E] hover:bg-[#9a1b0b]"
            >
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around">
          <Link to="/buyer" className="flex flex-col items-center gap-1 text-[#BE220E]">
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
          <Link
            to="/buyer/profile"
            className="flex flex-col items-center gap-1 text-gray-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
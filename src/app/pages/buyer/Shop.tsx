import DashboardLayout from '@/app/components/DashboardLayout';
import { useCart } from '@/contexts/CartContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Search,
  Filter,
  Star,
  MapPin,
  ShoppingCart,
  Heart,
  Grid,
  List,
  TrendingUp,
  Sparkles,
  Tag,
  Home,
  Package,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
}

const categories = [
  { id: 'all', name: 'All Products', icon: Grid },
  { id: 'fashion', name: 'Fashion', icon: Sparkles },
  { id: 'electronics', name: 'Electronics', icon: Package },
  { id: 'home', name: 'Home & Living', icon: Home },
  { id: 'beauty', name: 'Beauty', icon: Star },
  { id: 'sports', name: 'Sports', icon: TrendingUp },
];

export default function BuyerShop() {
  const { addToCart, addToWishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load products from localStorage
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Enhance products with additional buyer-specific data
    const enhancedProducts = storedProducts.map((p: any) => ({
      ...p,
      retailerId: p.retailerId || '3',
      retailerName: p.retailerName || 'Test Retailer',
      rating: p.rating || (Math.random() * 2 + 3).toFixed(1),
      reviews: p.reviews || Math.floor(Math.random() * 500) + 50,
      inStock: p.stock > 0,
      discount: p.discount || (Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0),
    }));

    setProducts(enhancedProducts);
    setFilteredProducts(enhancedProducts);
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
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      quantity: 1,
      image: product.images[0],
      retailerId: product.retailerId || '3',
      retailerName: product.retailerName || 'Test Retailer',
    });
  };

  const handleAddToWishlist = (product: Product) => {
    addToWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      retailerId: product.retailerId || '3',
      retailerName: product.retailerName || 'Test Retailer',
    });
  };

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#BE220E] to-[#9a1b0b] rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Shop Products</h1>
          <p className="text-white/90 mb-4">Discover amazing products from trusted retailers</p>
          
          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 bg-white"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
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

        {/* Filters and Sort Bar */}
        <div className="flex items-center justify-between">
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
          <Card className="p-4">
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
              <Card
                key={product.id}
                className={`overflow-hidden hover:shadow-lg transition group ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <Link
                  to={`/buyer/product/${product.id}`}
                  className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'block'}
                >
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className={`object-cover group-hover:scale-105 transition ${
                        viewMode === 'list' ? 'h-full w-full' : 'w-full h-48'
                      }`}
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-[#BE220E] text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4 flex-1">
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
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

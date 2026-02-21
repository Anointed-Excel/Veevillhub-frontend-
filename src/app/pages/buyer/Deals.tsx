import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Zap,
  Tag,
  Star,
  ShoppingCart,
  Heart,
  TrendingUp,
  Clock,
  MapPin,
  Percent,
  Gift,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
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
  rating?: number;
  reviews?: number;
  discount?: number;
  dealEndTime?: string;
  dealType?: 'flash' | 'daily' | 'weekly' | 'clearance';
}

export default function BuyerDeals() {
  const { addToCart, addToWishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealType, setSelectedDealType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('discount-high');

  useEffect(() => {
    // Load products from localStorage
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Enhanced products with deals data
    const enhancedProducts = storedProducts
      .map((p: any) => {
        const discount = Math.floor(Math.random() * 60) + 15; // 15-75% discount
        const dealTypes: ('flash' | 'daily' | 'weekly' | 'clearance')[] = ['flash', 'daily', 'weekly', 'clearance'];
        const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];
        
        // Calculate deal end time based on type
        const now = new Date();
        let endTime;
        switch (dealType) {
          case 'flash':
            endTime = new Date(now.getTime() + Math.random() * 6 * 60 * 60 * 1000); // 0-6 hours
            break;
          case 'daily':
            endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
            break;
          case 'weekly':
            endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
            break;
          case 'clearance':
            endTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
            break;
        }

        return {
          ...p,
          retailerId: p.retailerId || '3',
          retailerName: p.retailerName || 'Test Retailer',
          rating: p.rating || (Math.random() * 2 + 3).toFixed(1),
          reviews: p.reviews || Math.floor(Math.random() * 500) + 50,
          discount,
          dealType,
          dealEndTime: endTime.toISOString(),
        };
      })
      .filter((p: Product) => p.discount > 0); // Only show products with discounts

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

    // Apply deal type filter
    if (selectedDealType !== 'all') {
      filtered = filtered.filter((p) => p.dealType === selectedDealType);
    }

    // Apply sorting
    switch (sortBy) {
      case 'discount-high':
        filtered = [...filtered].sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'discount-low':
        filtered = [...filtered].sort((a, b) => (a.discount || 0) - (b.discount || 0));
        break;
      case 'price-low':
        filtered = [...filtered].sort((a, b) => {
          const priceA = a.price * (1 - (a.discount || 0) / 100);
          const priceB = b.price * (1 - (b.discount || 0) / 100);
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => {
          const priceA = a.price * (1 - (a.discount || 0) / 100);
          const priceB = b.price * (1 - (b.discount || 0) / 100);
          return priceB - priceA;
        });
        break;
      case 'ending-soon':
        filtered = [...filtered].sort((a, b) => {
          const timeA = new Date(a.dealEndTime || 0).getTime();
          const timeB = new Date(b.dealEndTime || 0).getTime();
          return timeA - timeB;
        });
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedDealType, sortBy, products]);

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  const handleAddToWishlist = (product: Product) => {
    addToWishlist(product.id);
  };

  const getDealTypeColor = (dealType?: string) => {
    switch (dealType) {
      case 'flash': return 'bg-red-100 text-red-700 border-red-200';
      case 'daily': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'weekly': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'clearance': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDealTypeIcon = (dealType?: string) => {
    switch (dealType) {
      case 'flash': return Zap;
      case 'daily': return Clock;
      case 'weekly': return TrendingUp;
      case 'clearance': return Tag;
      default: return Tag;
    }
  };

  const getTimeRemaining = (endTime?: string) => {
    if (!endTime) return '';
    
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const dealTypes = [
    { id: 'all', name: 'All Deals', icon: Tag, count: products.length },
    { id: 'flash', name: 'Flash Sales', icon: Zap, count: products.filter(p => p.dealType === 'flash').length },
    { id: 'daily', name: 'Daily Deals', icon: Clock, count: products.filter(p => p.dealType === 'daily').length },
    { id: 'weekly', name: 'Weekly Offers', icon: TrendingUp, count: products.filter(p => p.dealType === 'weekly').length },
    { id: 'clearance', name: 'Clearance', icon: Percent, count: products.filter(p => p.dealType === 'clearance').length },
  ];

  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#BE220E] to-[#9a1b0b] rounded-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Deals & Offers</h1>
              <p className="text-white/90">Limited time deals you don't want to miss!</p>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 bg-white"
            />
          </div>
        </div>

        {/* Deal Type Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {dealTypes.map((dealType) => {
            const Icon = dealType.icon;
            return (
              <button
                key={dealType.id}
                onClick={() => setSelectedDealType(dealType.id)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedDealType === dealType.id
                    ? 'border-[#BE220E] bg-[#BE220E]/5'
                    : 'border-gray-200 hover:border-[#BE220E]/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${selectedDealType === dealType.id ? 'text-[#BE220E]' : 'text-gray-600'}`} />
                  <span className={`text-lg font-bold ${selectedDealType === dealType.id ? 'text-[#BE220E]' : 'text-gray-900'}`}>
                    {dealType.count}
                  </span>
                </div>
                <div className={`text-sm font-medium ${selectedDealType === dealType.id ? 'text-[#BE220E]' : 'text-gray-700'}`}>
                  {dealType.name}
                </div>
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
              {filteredProducts.length} deal{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#BE220E]"
          >
            <option value="discount-high">Highest Discount</option>
            <option value="discount-low">Lowest Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="ending-soon">Ending Soon</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Active Filters</h3>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDealType('all');
                }}
                className="text-sm text-[#BE220E] hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedDealType !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {dealTypes.find(d => d.id === selectedDealType)?.name}
                  <button onClick={() => setSelectedDealType('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No deals found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later for new deals
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedDealType('all');
              }}
              className="bg-[#BE220E] hover:bg-[#9a1b0b]"
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const DealIcon = getDealTypeIcon(product.dealType);
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition group">
                  <Link to={`/buyer/product/${product.id}`}>
                    <div className="relative overflow-hidden bg-gray-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-2 right-2 bg-[#BE220E] text-white px-3 py-1.5 rounded-lg font-bold text-lg shadow-lg">
                        -{product.discount}%
                      </div>
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium border capitalize ${getDealTypeColor(product.dealType)}`}>
                        <div className="flex items-center gap-1">
                          <DealIcon className="w-3 h-3" />
                          {product.dealType}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/buyer/product/${product.id}`}>
                      <h3 className="font-semibold mb-2 hover:text-[#BE220E] line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{product.retailerName}</span>
                    </div>

                    {/* Deal Timer */}
                    <div className="flex items-center gap-2 mb-3 text-xs">
                      <Clock className="w-3 h-3 text-[#BE220E]" />
                      <span className="text-[#BE220E] font-medium">
                        Ends in {getTimeRemaining(product.dealEndTime)}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-[#BE220E]">
                        ₦{(product.price * (1 - (product.discount || 0) / 100)).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₦{product.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-green-600 font-medium mb-3">
                      You save ₦{(product.price * (product.discount || 0) / 100).toLocaleString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-[#BE220E] hover:bg-[#9a1b0b]"
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
            })}
          </div>
        )}

        {/* Deal Information */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="font-bold text-lg mb-4">Deal Types Explained</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Flash Sales</h4>
                <p className="text-sm text-gray-600">Limited time offers with highest discounts. Grab them before they're gone!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Daily Deals</h4>
                <p className="text-sm text-gray-600">Fresh deals every day. Check back regularly for new offers!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Weekly Offers</h4>
                <p className="text-sm text-gray-600">Curated deals that last the whole week. More time to decide!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Percent className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Clearance Sales</h4>
                <p className="text-sm text-gray-600">Massive discounts on selected items. Stock up while it lasts!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

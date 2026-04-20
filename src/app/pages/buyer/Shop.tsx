import DashboardLayout from '@/app/components/DashboardLayout';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
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
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/app/components/ui/skeleton';
import EmptyState from '@/app/components/EmptyState';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  categoryId?: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  discount?: number;
}

interface Category {
  id: string;
  name: string;
}

export default function BuyerShop() {
  const { addToCart, addToWishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProducts = (overrides?: Record<string, unknown>) => {
    setLoading(true);

    const sortMap: Record<string, { sortBy: string; sortOrder: string }> = {
      'price-low': { sortBy: 'regular_price', sortOrder: 'asc' },
      'price-high': { sortBy: 'regular_price', sortOrder: 'desc' },
      'rating': { sortBy: 'created_at', sortOrder: 'desc' },
      'popular': { sortBy: 'created_at', sortOrder: 'desc' },
      'featured': { sortBy: 'created_at', sortOrder: 'desc' },
    };
    const sort = sortMap[sortBy] || sortMap['featured'];

    const params = new URLSearchParams();
    params.set('limit', '40');
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] > 0) params.set('maxPrice', String(priceRange[1]));
    params.set('sortBy', sort.sortBy);
    params.set('sortOrder', sort.sortOrder);

    // Apply any overrides
    if (overrides) {
      Object.entries(overrides).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v));
        else params.delete(k);
      });
    }

    api.get<unknown>(`/shop/products?${params.toString()}`).then((res) => {
      const data = res.data as Record<string, unknown>;
      const raw = (data.products || []) as Record<string, unknown>[];
      const pagination = (data.pagination || {}) as Record<string, unknown>;
      setTotalResults(Number(pagination.totalResults) || raw.length);

      const mapped: Product[] = raw.map((p) => {
        const regularPrice = Number(p.regular_price) || 0;
        const salesPrice = Number(p.sales_price) || 0;
        const discount = salesPrice > 0 && salesPrice < regularPrice
          ? Math.round((1 - salesPrice / regularPrice) * 100)
          : 0;
        return {
          id: (p.id as string) || '',
          name: (p.name as string) || '',
          price: regularPrice,
          images: [(p.image_url as string) || ''],
          categoryId: (p.category_id as string) || '',
          brand: (p.brand as string) || '',
          rating: Number(p.rating) || parseFloat((Math.random() * 2 + 3).toFixed(1)),
          reviews: Number(p.reviews) || Math.floor(Math.random() * 200) + 10,
          inStock: (p.status as string) === 'active',
          discount,
        };
      });
      setProducts(mapped);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get<unknown>('/shop/categories').then((res) => {
      const data = res.data as Record<string, unknown>;
      const raw = (data.categories || []) as Record<string, unknown>[];
      const flat: Category[] = [];
      const flatten = (items: Record<string, unknown>[]) => {
        items.forEach((c) => {
          flat.push({ id: c.id as string, name: c.name as string });
          if (c.children) flatten(c.children as Record<string, unknown>[]);
        });
      };
      flatten(raw);
      setCategories(flat);
    }).catch(() => {});

    loadProducts();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadProducts();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  const handleAddToWishlist = (product: Product) => {
    addToWishlist(product.id);
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
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-[#BE220E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-[#BE220E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
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
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                `${totalResults} product${totalResults !== 1 ? 's' : ''}`
              )}
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
                    onClick={() => setPriceRange([0, 0])}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Products Grid/List */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <Skeleton className="h-8 w-full rounded mt-2" />
                </div>
              </Card>
            ))}
          </div>
        ) : !loading && products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={{ label: 'Clear Filters', onClick: () => { setSearchQuery(''); setSelectedCategory('all'); setPriceRange([0, 0]); } }}
          />
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {products.map((product) => (
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

                  {product.brand && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{product.brand}</span>
                    </div>
                  )}

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

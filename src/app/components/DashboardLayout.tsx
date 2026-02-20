import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  Store,
  MessageSquare,
  UserCircle,
  LogOut,
  Menu,
  X,
  Building2,
  Tag,
  ShoppingBag,
  Heart,
  Bell,
  Home,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'brand' | 'manufacturer' | 'retailer' | 'buyer';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get cart and wishlist counts for buyer role
  const cartContext = role === 'buyer' ? useCart() : null;
  const cartCount = cartContext?.cartCount || 0;
  const wishlistCount = cartContext?.wishlistCount || 0;

  const getNavItems = () => {
    switch (role) {
      case 'brand':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/brand' },
          { icon: Users, label: 'Users', path: '/brand/users' },
          { icon: Building2, label: 'Manufacturers', path: '/brand/manufacturers' },
          { icon: Store, label: 'Retailers', path: '/brand/retailers' },
          { icon: ShoppingBag, label: 'Buyers', path: '/brand/buyers' },
          { icon: Package, label: 'Products', path: '/brand/products' },
          { icon: ShoppingCart, label: 'Orders', path: '/brand/orders' },
          { icon: Tag, label: 'Promotions', path: '/brand/promotions' },
          { icon: DollarSign, label: 'Wallet', path: '/brand/wallet' },
          { icon: BarChart3, label: 'Analytics', path: '/brand/analytics' },
          { icon: Settings, label: 'Settings', path: '/brand/settings' },
        ];
      case 'manufacturer':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/manufacturer' },
          { icon: Package, label: 'Products', path: '/manufacturer/products' },
          { icon: ShoppingCart, label: 'Orders', path: '/manufacturer/orders' },
          { icon: MessageSquare, label: 'Messages', path: '/manufacturer/messages' },
          { icon: DollarSign, label: 'Wallet', path: '/manufacturer/wallet' },
          { icon: UserCircle, label: 'Profile', path: '/manufacturer/profile' },
        ];
      case 'retailer':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/retailer' },
          { icon: ShoppingCart, label: 'Buy Bulk', path: '/retailer/buy-bulk' },
          { icon: Package, label: 'My Products', path: '/retailer/products' },
          { icon: ShoppingCart, label: 'Orders', path: '/retailer/orders' },
          { icon: Users, label: 'Customers', path: '/retailer/customers' },
          { icon: DollarSign, label: 'Wallet', path: '/retailer/wallet' },
          { icon: BarChart3, label: 'Analytics', path: '/retailer/analytics' },
          { icon: Settings, label: 'Settings', path: '/retailer/settings' },
        ];
      case 'buyer':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/buyer' },
          { icon: Home, label: 'Shop', path: '/buyer/shop' },
          { icon: Zap, label: 'Deals & Offers', path: '/buyer/deals', badge: 'NEW' },
          { icon: ShoppingCart, label: 'Cart', path: '/buyer/cart', badge: cartCount > 0 ? cartCount : null },
          { icon: Heart, label: 'Wishlist', path: '/buyer/wishlist', badge: wishlistCount > 0 ? wishlistCount : null },
          { icon: Package, label: 'My Orders', path: '/buyer/orders' },
          { icon: Bell, label: 'Notifications', path: '/buyer/notifications' },
          { icon: UserCircle, label: 'Profile', path: '/buyer/profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ item }: { item: { icon: any; label: string; path: string; badge?: any } }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition relative ${
          isActive
            ? 'bg-[#BE220E] text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium flex-1">{item.label}</span>
        {item.badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            typeof item.badge === 'string'
              ? 'bg-green-500 text-white'
              : isActive
              ? 'bg-white text-[#BE220E]'
              : 'bg-[#BE220E] text-white'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#BE220E] rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">VeeVill Hub</div>
              <div className="text-xs text-gray-500 capitalize">{role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-medium">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#BE220E] rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">VeeVill Hub</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#BE220E] rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">VeeVill Hub</div>
                    <div className="text-xs text-gray-500 capitalize">{role}</div>
                  </div>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-[#BE220E] text-white flex items-center justify-center font-medium">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
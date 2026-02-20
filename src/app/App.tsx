import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/app/components/ui/sonner';
import { initializeMockData } from '@/data/mockData';
import { useEffect } from 'react';

// Auth pages
import LandingPage from '@/app/pages/LandingPage';
import LoginPage from '@/app/pages/auth/LoginPage';
import SignupPage from '@/app/pages/auth/SignupPage';
import BuyerSignup from '@/app/pages/auth/BuyerSignup';
import ManufacturerSignup from '@/app/pages/auth/ManufacturerSignup';
import RetailerSignup from '@/app/pages/auth/RetailerSignup';
import VerificationPending from '@/app/pages/auth/VerificationPending';
// Brand admin pages
import {
  BrandDashboard,
  BrandUsers,
  BrandManufacturers,
  BrandRetailers,
  BrandBuyers,
  BrandProducts,
  BrandOrders,
  BrandPromotions,
  BrandWallet,
  BrandAnalytics,
  BrandSettings,
} from '@/app/pages/brand';
import {
  VerificationStatus,
  ManufacturerDashboard,
  ManufacturerProducts,
  ManufacturerOrders,
  ManufacturerMessages,
  ManufacturerWallet,
  ManufacturerProfile,
  RetailerDashboard,
  RetailerBuyBulk,
  RetailerProducts,
  RetailerOrders,
  RetailerCustomers,
  RetailerWallet,
  RetailerAnalytics,
  RetailerSettings,
} from '@/app/pages/PlaceholderPages';
import {
  BuyerHome,
  BuyerDashboard,
  BuyerShop,
  BuyerDeals,
  BuyerNotifications,
  BuyerCart,
  BuyerOrders,
  BuyerProfile,
  BuyerWishlist,
  BuyerCheckout,
  BuyerCategories,
  ProductDetail,
  OrderTracking,
} from '@/app/pages/buyer';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Check verification status for manufacturers and retailers
  if (user && ['manufacturer', 'retailer'].includes(user.role) && user.verificationStatus !== 'approved') {
    return <Navigate to="/verification-status" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/manufacturer" element={<ManufacturerSignup />} />
      <Route path="/signup/retailer" element={<RetailerSignup />} />
      <Route path="/signup/buyer" element={<BuyerSignup />} />
      <Route path="/verification-pending" element={<VerificationPending />} />
      <Route path="/verification-status" element={<ProtectedRoute><VerificationStatus /></ProtectedRoute>} />

      {/* Brand (Admin) routes */}
      <Route path="/brand" element={<ProtectedRoute allowedRoles={['brand']}><BrandDashboard /></ProtectedRoute>} />
      <Route path="/brand/users" element={<ProtectedRoute allowedRoles={['brand']}><BrandUsers /></ProtectedRoute>} />
      <Route path="/brand/manufacturers" element={<ProtectedRoute allowedRoles={['brand']}><BrandManufacturers /></ProtectedRoute>} />
      <Route path="/brand/retailers" element={<ProtectedRoute allowedRoles={['brand']}><BrandRetailers /></ProtectedRoute>} />
      <Route path="/brand/buyers" element={<ProtectedRoute allowedRoles={['brand']}><BrandBuyers /></ProtectedRoute>} />
      <Route path="/brand/products" element={<ProtectedRoute allowedRoles={['brand']}><BrandProducts /></ProtectedRoute>} />
      <Route path="/brand/orders" element={<ProtectedRoute allowedRoles={['brand']}><BrandOrders /></ProtectedRoute>} />
      <Route path="/brand/promotions" element={<ProtectedRoute allowedRoles={['brand']}><BrandPromotions /></ProtectedRoute>} />
      <Route path="/brand/wallet" element={<ProtectedRoute allowedRoles={['brand']}><BrandWallet /></ProtectedRoute>} />
      <Route path="/brand/analytics" element={<ProtectedRoute allowedRoles={['brand']}><BrandAnalytics /></ProtectedRoute>} />
      <Route path="/brand/settings" element={<ProtectedRoute allowedRoles={['brand']}><BrandSettings /></ProtectedRoute>} />

      {/* Manufacturer routes */}
      <Route path="/manufacturer" element={<ProtectedRoute allowedRoles={['manufacturer']}><ManufacturerDashboard /></ProtectedRoute>} />
      <Route path="/manufacturer/products" element={<ProtectedRoute allowedRoles={['manufacturer']}><ManufacturerProducts /></ProtectedRoute>} />
      <Route path="/manufacturer/orders" element={<ProtectedRoute allowedRoles={['manufacturer']}><ManufacturerOrders /></ProtectedRoute>} />
      <Route path="/manufacturer/messages" element={<ProtectedRoute allowedRoles={['manufacturer']}><ManufacturerMessages /></ProtectedRoute>} />
      <Route path="/manufacturer/wallet" element={<ProtectedRoute allowedRoles={['manufacturer']}><ManufacturerWallet /></ProtectedRoute>} />
      <Route path="/manufacturer/profile" element={<ProtectedRoute allowedRoles={['manufacturer']}><ManufacturerProfile /></ProtectedRoute>} />

      {/* Retailer routes */}
      <Route path="/retailer" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerDashboard /></ProtectedRoute>} />
      <Route path="/retailer/buy-bulk" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerBuyBulk /></ProtectedRoute>} />
      <Route path="/retailer/products" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerProducts /></ProtectedRoute>} />
      <Route path="/retailer/orders" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerOrders /></ProtectedRoute>} />
      <Route path="/retailer/customers" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerCustomers /></ProtectedRoute>} />
      <Route path="/retailer/wallet" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerWallet /></ProtectedRoute>} />
      <Route path="/retailer/analytics" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerAnalytics /></ProtectedRoute>} />
      <Route path="/retailer/settings" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerSettings /></ProtectedRoute>} />

      {/* Buyer routes */}
      <Route path="/buyer" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerHome /></ProtectedRoute>} />
      <Route path="/buyer/dashboard" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
      <Route path="/buyer/shop" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerShop /></ProtectedRoute>} />
      <Route path="/buyer/deals" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDeals /></ProtectedRoute>} />
      <Route path="/buyer/notifications" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerNotifications /></ProtectedRoute>} />
      <Route path="/buyer/cart" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerCart /></ProtectedRoute>} />
      <Route path="/buyer/orders" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerOrders /></ProtectedRoute>} />
      <Route path="/buyer/profile" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerProfile /></ProtectedRoute>} />
      <Route path="/buyer/wishlist" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerWishlist /></ProtectedRoute>} />
      <Route path="/buyer/checkout" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerCheckout /></ProtectedRoute>} />
      <Route path="/buyer/categories" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerCategories /></ProtectedRoute>} />
      <Route path="/buyer/product/:id" element={<ProtectedRoute allowedRoles={['buyer']}><ProductDetail /></ProtectedRoute>} />
      <Route path="/buyer/track-order/:id" element={<ProtectedRoute allowedRoles={['buyer']}><OrderTracking /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
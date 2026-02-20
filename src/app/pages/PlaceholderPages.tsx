// This file contains placeholder pages for all routes to prevent errors
// Each page includes the proper layout and basic UI elements

import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

// Export manufacturer pages from their new location
export { ManufacturerDashboard, ManufacturerProducts, ManufacturerOrders, ManufacturerMessages, ManufacturerWallet, ManufacturerProfile } from './manufacturer';

// Export retailer pages from their new location
export { RetailerDashboard, RetailerBuyBulk, RetailerProducts, RetailerOrders, RetailerCustomers, RetailerWallet, RetailerAnalytics, RetailerSettings } from './retailer';

// Export buyer pages from their new location
export { BuyerHome, BuyerCart, BuyerCheckout, BuyerOrders, BuyerProfile, BuyerWishlist, ProductDetail, OrderTracking } from './buyer';

// Verification Status
export function VerificationStatus() {
  return (
    <DashboardLayout role="manufacturer">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Verification Status</h1>
        <Card className="p-6">
          <p className="text-gray-600">Your verification is pending...</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Categories page (kept as placeholder)
export function BuyerCategories() {
  return (
    <DashboardLayout role="buyer">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Card className="p-6">
          <p className="text-gray-600">Product categories</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
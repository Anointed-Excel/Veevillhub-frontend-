// This file contains placeholder pages for all routes to prevent errors
// Each page includes the proper layout and basic UI elements

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, AlertCircle, Mail, Package } from 'lucide-react';

// Export manufacturer pages from their new location
export { ManufacturerDashboard, ManufacturerProducts, ManufacturerOrders, ManufacturerMessages, ManufacturerWallet, ManufacturerProfile } from './manufacturer';

// Export retailer pages from their new location
export { RetailerDashboard, RetailerBuyBulk, RetailerProducts, RetailerOrders, RetailerCustomers, RetailerWallet, RetailerAnalytics, RetailerSettings } from './retailer';

// Export buyer pages from their new location
export { BuyerHome, BuyerCart, BuyerCheckout, BuyerOrders, BuyerProfile, BuyerWishlist, ProductDetail, OrderTracking } from './buyer';

// Verification Status
export function VerificationStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<unknown>('/users/me').then((res) => {
      const data = res.data as Record<string, unknown>;
      setStatus((data.account_status as string) || (data.verification_status as string) || (data.status as string) || 'pending');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const configs: Record<string, { icon: typeof CheckCircle; color: string; bg: string; title: string; desc: string }> = {
    approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', title: 'Account Approved!', desc: 'Your account has been verified. You can now access all features.' },
    active:   { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', title: 'Account Active', desc: 'Your account is active and fully verified.' },
    pending:  { icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-100', title: 'Verification Pending', desc: 'Your documents are under review. This usually takes 1–2 business days.' },
    rejected: { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-100',    title: 'Verification Failed', desc: 'Your application was not approved. Please contact support.' },
    suspended:{ icon: AlertCircle,  color: 'text-orange-600', bg: 'bg-orange-100', title: 'Account Suspended', desc: 'Your account has been suspended. Please contact support.' },
  };

  const cfg = configs[status] || configs.pending;
  const Icon = cfg.icon;

  return (
    <DashboardLayout role="manufacturer">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Verification Status</h1>

        {loading ? (
          <Card className="p-8"><div className="h-32 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#BE220E] border-t-transparent rounded-full animate-spin" /></div></Card>
        ) : (
          <>
            <Card className="p-8 text-center">
              <div className={`w-20 h-20 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-10 h-10 ${cfg.color}`} />
              </div>
              <h2 className="text-2xl font-bold mb-2">{cfg.title}</h2>
              <p className="text-gray-600 mb-6">{cfg.desc}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium capitalize">
                Status: <span className={cfg.color}>{status}</span>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium capitalize">{user?.role}</span>
                </div>
              </div>
            </Card>

            {(status === 'approved' || status === 'active') && (
              <div className="text-center">
                <Link to="/manufacturer">
                  <Button className="bg-[#BE220E] hover:bg-[#9a1b0b]">Go to Dashboard</Button>
                </Link>
              </div>
            )}

            {status === 'rejected' && (
              <Card className="p-6 border-red-200 bg-red-50">
                <p className="text-sm text-red-700">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@veevillhub.com" className="underline font-medium">support@veevillhub.com</a>
                </p>
              </Card>
            )}
          </>
        )}
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
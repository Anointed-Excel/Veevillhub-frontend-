import { Link } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Store, Factory, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Join VeeVill Hub</h1>
          <p className="text-gray-600 text-center mb-12">Choose your account type to get started</p>

          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/signup/manufacturer" className="group">
              <div className="p-8 border-2 border-gray-200 rounded-xl hover:border-[#BE220E] transition cursor-pointer h-full">
                <Factory className="w-12 h-12 mb-4 text-gray-400 group-hover:text-[#BE220E] transition" />
                <h3 className="text-xl font-bold mb-2">Manufacturer</h3>
                <p className="text-gray-600 text-sm mb-4">Sell products in bulk to retailers</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Upload bulk products</li>
                  <li>• Set MOQ requirements</li>
                  <li>• Manage orders</li>
                </ul>
              </div>
            </Link>

            <Link to="/signup/retailer" className="group">
              <div className="p-8 border-2 border-gray-200 rounded-xl hover:border-[#BE220E] transition cursor-pointer h-full">
                <Store className="w-12 h-12 mb-4 text-gray-400 group-hover:text-[#BE220E] transition" />
                <h3 className="text-xl font-bold mb-2">Retailer</h3>
                <p className="text-gray-600 text-sm mb-4">Buy bulk and sell to consumers</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Purchase from manufacturers</li>
                  <li>• Customize products</li>
                  <li>• Sell to buyers</li>
                </ul>
              </div>
            </Link>

            <Link to="/signup/buyer" className="group">
              <div className="p-8 border-2 border-gray-200 rounded-xl hover:border-[#BE220E] transition cursor-pointer h-full">
                <ShoppingBag className="w-12 h-12 mb-4 text-gray-400 group-hover:text-[#BE220E] transition" />
                <h3 className="text-xl font-bold mb-2">Buyer</h3>
                <p className="text-gray-600 text-sm mb-4">Shop from verified retailers</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Browse products</li>
                  <li>• Secure checkout</li>
                  <li>• Track orders</li>
                </ul>
              </div>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium hover:underline" style={{ color: '#BE220E' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

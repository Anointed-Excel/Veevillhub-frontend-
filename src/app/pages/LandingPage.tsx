import { Link } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { ShoppingBag, Store, Factory, Shield, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#BE220E] rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">VeeVill Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button style={{ backgroundColor: '#BE220E' }} className="text-white hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Africa's Premier <span style={{ color: '#BE220E' }}>Multi-Vendor</span> E-Commerce Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect manufacturers, retailers, and buyers in one powerful ecosystem. Built for scale, designed for growth.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/signup/manufacturer">
                <Button size="lg" style={{ backgroundColor: '#BE220E' }} className="text-white hover:opacity-90">
                  <Factory className="w-5 h-5 mr-2" />
                  I'm a Manufacturer
                </Button>
              </Link>
              <Link to="/signup/retailer">
                <Button size="lg" variant="outline" className="border-2" style={{ borderColor: '#BE220E', color: '#BE220E' }}>
                  <Store className="w-5 h-5 mr-2" />
                  I'm a Retailer
                </Button>
              </Link>
              <Link to="/signup/buyer">
                <Button size="lg" variant="outline">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  I'm a Buyer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose VeeVill Hub?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition cursor-pointer">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#BE220E' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Vendors</h3>
              <p className="text-gray-600">All manufacturers and retailers go through strict verification process ensuring quality and trust.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition cursor-pointer">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#BE220E' }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Seamless ordering, instant notifications, and real-time tracking for all your transactions.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition cursor-pointer">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#BE220E' }}>
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Reach</h3>
              <p className="text-gray-600">Connect with vendors and buyers across Africa and beyond with our expanding network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Built For Everyone</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer">
              <Factory className="w-12 h-12 mb-4" style={{ color: '#BE220E' }} />
              <h3 className="text-2xl font-bold mb-4">Manufacturers</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Upload and manage bulk products</li>
                <li>• Set minimum order quantities</li>
                <li>• Direct communication with retailers</li>
                <li>• Track orders and shipments</li>
                <li>• Manage earnings and withdrawals</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer">
              <Store className="w-12 h-12 mb-4" style={{ color: '#BE220E' }} />
              <h3 className="text-2xl font-bold mb-4">Retailers</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Buy bulk from manufacturers</li>
                <li>• Customize products for your store</li>
                <li>• Set your own pricing</li>
                <li>• Sell to end consumers</li>
                <li>• Advanced analytics dashboard</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer">
              <ShoppingBag className="w-12 h-12 mb-4" style={{ color: '#BE220E' }} />
              <h3 className="text-2xl font-bold mb-4">Buyers</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Browse thousands of products</li>
                <li>• Secure payment options</li>
                <li>• Real-time order tracking</li>
                <li>• Save wishlists and favorites</li>
                <li>• Multiple shipping options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#BE220E' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of vendors and buyers on VeeVill Hub today</p>
          <Link to="/signup">
            <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: '#BE220E' }}>
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#BE220E] rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VeeVill Hub</span>
              </div>
              <p className="text-gray-400">Africa's premier multi-vendor e-commerce platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition">About Us</button></li>
                <li><button className="hover:text-white transition">Careers</button></li>
                <li><button className="hover:text-white transition">Press</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition">Help Center</button></li>
                <li><button className="hover:text-white transition">Contact Us</button></li>
                <li><button className="hover:text-white transition">FAQs</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition">Terms of Service</button></li>
                <li><button className="hover:text-white transition">Privacy Policy</button></li>
                <li><button className="hover:text-white transition">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2026 VeeVill Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

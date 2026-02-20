import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Store, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { initializeMockData } from '@/data/mockData';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ adminFound: false, adminEmail: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = () => {
    if (confirm('This will reset all demo data. Continue?')) {
      // Clear all localStorage
      localStorage.clear();
      // Reinitialize with fresh data
      initializeMockData();
      toast.success('Demo data reset! You can now login.');
      // Refresh the page
      window.location.reload();
    }
  };

  // Debug: Check localStorage on mount
  useState(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('👥 Available users in localStorage:', users);
    const adminUser = users.find((u: any) => u.role === 'brand');
    if (adminUser) {
      console.log('✅ Admin found:', adminUser.email);
      setDebugInfo({ adminFound: true, adminEmail: adminUser.email });
    } else {
      console.log('❌ No admin user found in localStorage!');
      setDebugInfo({ adminFound: false, adminEmail: '' });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">Sign in to your VeeVill Hub account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-sm hover:underline" style={{ color: '#BE220E' }}>
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: '#BE220E' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium hover:underline" style={{ color: '#BE220E' }}>
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@veevillhub.com / admin123</p>
              <p><strong>Manufacturer:</strong> manufacturer@test.com / test123</p>
              <p><strong>Retailer:</strong> retailer@test.com / test123</p>
              <p><strong>Buyer:</strong> buyer@test.com / test123</p>
            </div>
          </div>

          {/* Reset data button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm hover:underline"
              style={{ color: '#BE220E' }}
              onClick={handleResetData}
            >
              <RefreshCw className="w-4 h-4 inline-block mr-1" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
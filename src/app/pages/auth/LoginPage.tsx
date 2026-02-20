import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Store, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">Sign in to your Anointed account</p>

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
        </div>
      </div>
    </div>
  );
}

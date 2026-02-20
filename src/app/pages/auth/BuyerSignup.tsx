import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { token } from '@/lib/token';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Store, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';

interface BackendTokens {
  access: { token: string };
  refresh: { token: string };
}
interface BackendUser {
  id: string;
  full_name: string;
  email: string;
}

export default function BuyerSignup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit registration — calls POST /users/register
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup({ ...formData, role: 'buyer' });
      setStep(2);
      toast.success('Verification code sent to your email!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify email OTP — calls POST /users/verify-email
  const handleVerifyEmail = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      const res = await api.post<{ user: BackendUser; tokens: BackendTokens }>(
        '/users/verify-email',
        { email: formData.email, otp },
      );

      // Store tokens and persist user session
      const { user, tokens: authTokens } = res.data;
      token.set(authTokens.access.token, authTokens.refresh.token, 'user');

      const normalizedUser = {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: 'buyer' as const,
        verificationStatus: 'approved' as const,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=BE220E&color=fff`,
      };
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      toast.success('Email verified! Welcome aboard.');
      navigate('/buyer');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP — calls POST /users/resend-otp
  const handleResendOtp = async () => {
    try {
      await api.post('/users/resend-otp', { email: formData.email });
      toast.success('New code sent to your email');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/signup" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to signup options
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Buyer Signup</h1>
          <p className="text-gray-600 text-center mb-8">Create your buyer account</p>

          {/* Progress steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-[#BE220E] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 2 && (
                  <div className={`w-24 h-1 mx-2 transition ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="John Doe" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="you@example.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="+234 800 000 0000" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required placeholder="••••••••" className="mt-1" />
              </div>
              <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#BE220E' }} disabled={loading}>
                {loading ? 'Creating account...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* Step 2: Email Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Enter the 6-digit code sent to<br />
                  <strong>{formData.email}</strong>
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={handleVerifyEmail}
                className="w-full text-white"
                style={{ backgroundColor: '#BE220E' }}
                disabled={otp.length !== 6 || loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
              <button type="button" onClick={handleResendOtp} className="w-full text-center text-sm text-gray-600 hover:underline">
                Resend code
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
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

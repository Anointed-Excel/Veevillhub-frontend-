import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';
import { ArrowLeft, Store, Upload, CheckCircle2, CreditCard, MapPin, Camera, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { token } from '@/lib/token';

interface BackendTokens {
  access: { token: string };
  refresh: { token: string };
}
interface BackendUser {
  id: string;
  full_name: string;
  email: string;
  user_type?: string;
}

export default function RetailerSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    ninNumber: '',
    ninDocument: null as File | null,
    proofOfAddress: null as File | null,
    selfiePhoto: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.ownerName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ninNumber || !formData.address) {
      toast.error('Please fill in all verification details');
      return;
    }
    if (formData.ninNumber.length !== 11) {
      toast.error('NIN must be 11 digits');
      return;
    }
    setStep(3);
  };

  // Step 3: upload docs validation then register account
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ninDocument || !formData.proofOfAddress || !formData.selfiePhoto) {
      toast.error('Please upload all required documents');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/register', {
        fullName: formData.ownerName,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: 'retailer',
      });
      setStep(4);
      toast.success('Account created! Check your email for the 6-digit verification code.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: verify OTP → save tokens → save business profile → navigate
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      const res = await api.post<{ user: BackendUser; tokens: BackendTokens }>(
        '/users/verify-email',
        { email: formData.email, otp },
      );

      const { user, tokens: authTokens } = res.data;
      token.set(authTokens.access.token, authTokens.refresh.token, 'user');

      const normalizedUser = {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: 'retailer' as const,
        verificationStatus: 'pending' as const,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=BE220E&color=fff`,
      };
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      // Submit business profile with documents
      const profileData = new FormData();
      profileData.append('companyName', formData.businessName);
      profileData.append('ownerName', formData.ownerName);
      profileData.append('ninNumber', formData.ninNumber);
      profileData.append('businessAddress', formData.address);
      if (formData.proofOfAddress) profileData.append('proofOfAddress', formData.proofOfAddress);
      if (formData.ninDocument) profileData.append('ninDocument', formData.ninDocument);
      if (formData.selfiePhoto) profileData.append('selfiePhoto', formData.selfiePhoto);

      await api.post('/users/business-profile', profileData);

      toast.success('Application submitted! Our team will review within 24-48 hours.');
      navigate('/verification-pending');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post('/users/resend-otp', { email: formData.email });
      toast.success('New verification code sent to your email');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend code');
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <Link to="/signup" className="inline-flex items-center text-gray-600 hover:text-[#BE220E] mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to role selection
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= num ? 'bg-[#BE220E] text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
              </div>
              {num < totalSteps && (
                <div className={`flex-1 h-1 mx-2 ${step > num ? 'bg-[#BE220E]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Retailer Registration</h1>
              <p className="text-gray-600 mt-2">Step 1: Basic Information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business/Shop Name *</Label>
                <Input id="businessName" name="businessName" type="text" value={formData.businessName} onChange={handleInputChange} placeholder="Enter your business name" required />
              </div>
              <div>
                <Label htmlFor="ownerName">Owner Full Name *</Label>
                <Input id="ownerName" name="ownerName" type="text" value={formData.ownerName} onChange={handleInputChange} placeholder="Enter your full name" required />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+234 800 000 0000" required />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Minimum 8 characters" required />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Re-enter password" required />
              </div>
            </div>

            <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#BE220E' }}>
              Continue to Verification
            </Button>
          </form>
        )}

        {/* Step 2: Verification Details */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Verification Details</h1>
              <p className="text-gray-600 mt-2">Step 2: Identity Information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="ninNumber">NIN (National Identification Number) *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="ninNumber" name="ninNumber" type="text" value={formData.ninNumber} onChange={handleInputChange} placeholder="12345678901" className="pl-10" maxLength={11} required />
                </div>
                <p className="text-xs text-gray-500 mt-1">11-digit National Identification Number</p>
              </div>
              <div>
                <Label htmlFor="address">Business Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="address" name="address" type="text" value={formData.address} onChange={handleInputChange} placeholder="Shop address or delivery location" className="pl-10" required />
                </div>
                <p className="text-xs text-gray-500 mt-1">Where customers can find your business</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Make sure your NIN matches the name you provided. This will be verified against NIMC records.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
              <Button type="submit" className="flex-1 text-white" style={{ backgroundColor: '#BE220E' }}>Continue to Documents</Button>
            </div>
          </form>
        )}

        {/* Step 3: Document Upload */}
        {step === 3 && (
          <form onSubmit={handleStep3Submit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Upload Documents</h1>
              <p className="text-gray-600 mt-2">Step 3: Identity Verification</p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'ninDocument', label: 'NIN Slip/Card *', prompt: 'Upload NIN slip or card', icon: CreditCard },
                { key: 'proofOfAddress', label: 'Proof of Business Address *', prompt: 'Upload utility bill or lease agreement', icon: MapPin },
                { key: 'selfiePhoto', label: 'Selfie Photo *', prompt: 'Upload a clear selfie photo', icon: Camera },
              ].map(({ key, label, prompt, icon: Icon }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#BE220E] transition">
                    <div className="space-y-1 text-center">
                      <Icon className="mx-auto h-10 w-10 text-gray-400" />
                      <label htmlFor={key} className="relative cursor-pointer rounded-md font-medium text-[#BE220E] hover:underline text-sm">
                        <span>{prompt}</span>
                        <input id={key} name={key} type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, key)} required />
                      </label>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                      {formData[key as keyof typeof formData] && (
                        <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {(formData[key as keyof typeof formData] as File).name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ⓘ After submitting, you'll receive a verification code by email. Your documents will then be reviewed within 24-48 hours.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
              <Button type="submit" className="flex-1 text-white" disabled={loading} style={{ backgroundColor: '#BE220E' }}>
                {loading ? 'Creating account...' : 'Submit & Get OTP'}
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: OTP Verification */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Verify Your Email</h1>
              <p className="text-gray-600 mt-2">Step 4: Email Verification</p>
              <p className="text-gray-500 text-sm mt-4">
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
              onClick={handleVerifyOtp}
              className="w-full text-white"
              style={{ backgroundColor: '#BE220E' }}
              disabled={otp.length !== 6 || loading}
            >
              {loading ? 'Verifying...' : 'Verify & Submit Application'}
            </Button>

            <button type="button" onClick={handleResendOtp} className="w-full text-center text-sm text-gray-600 hover:underline">
              Resend code
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#BE220E] hover:underline font-medium">Login here</Link>
        </div>
      </Card>
    </div>
  );
}

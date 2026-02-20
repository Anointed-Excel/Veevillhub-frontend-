import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ArrowLeft, Building2, Upload, CheckCircle2, FileText, MapPin, Hash } from 'lucide-react';
import { toast } from 'sonner';

export default function ManufacturerSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    cacNumber: '',
    tinNumber: '',
    cacDocument: null as File | null,
    tinDocument: null as File | null,
    proofOfAddress: null as File | null,
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
    if (!formData.companyName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cacNumber || !formData.tinNumber || !formData.address) {
      toast.error('Please fill in all company details');
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cacDocument || !formData.tinDocument || !formData.proofOfAddress) {
      toast.error('Please upload all required documents');
      return;
    }

    // Save to localStorage for demo
    const manufacturerData = {
      id: Date.now().toString(),
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      cacNumber: formData.cacNumber,
      tinNumber: formData.tinNumber,
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('pendingManufacturer', JSON.stringify(manufacturerData));
    
    toast.success('Application submitted successfully!');
    navigate('/verification-pending');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <Link to="/signup" className="inline-flex items-center text-gray-600 hover:text-[#BE220E] mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to role selection
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= num ? 'bg-[#BE220E] text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
              </div>
              {num < 3 && (
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
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Manufacturer Registration</h1>
              <p className="text-gray-600 mt-2">Step 1: Basic Information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="company@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+234 800 000 0000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: '#BE220E' }}
            >
              Continue to Company Details
            </Button>
          </form>
        )}

        {/* Step 2: Company Details */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#BE220E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Company Details</h1>
              <p className="text-gray-600 mt-2">Step 2: Registration Information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cacNumber">CAC Registration Number *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="cacNumber"
                    name="cacNumber"
                    type="text"
                    value={formData.cacNumber}
                    onChange={handleInputChange}
                    placeholder="RC123456"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Corporate Affairs Commission number</p>
              </div>

              <div>
                <Label htmlFor="tinNumber">TIN (Tax Identification Number) *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="tinNumber"
                    name="tinNumber"
                    type="text"
                    value={formData.tinNumber}
                    onChange={handleInputChange}
                    placeholder="12345678-0001"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Business Street, Lagos, Nigeria"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 text-white"
                style={{ backgroundColor: '#BE220E' }}
              >
                Continue to Documents
              </Button>
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
              <p className="text-gray-600 mt-2">Step 3: Verification Documents</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cacDocument">CAC Certificate *</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#BE220E] transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="cacDocument"
                        className="relative cursor-pointer rounded-md font-medium text-[#BE220E] hover:underline"
                      >
                        <span>Upload CAC certificate</span>
                        <input
                          id="cacDocument"
                          name="cacDocument"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'cacDocument')}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                    {formData.cacDocument && (
                      <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {formData.cacDocument.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="tinDocument">TIN Certificate *</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#BE220E] transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="tinDocument"
                        className="relative cursor-pointer rounded-md font-medium text-[#BE220E] hover:underline"
                      >
                        <span>Upload TIN certificate</span>
                        <input
                          id="tinDocument"
                          name="tinDocument"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'tinDocument')}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                    {formData.tinDocument && (
                      <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {formData.tinDocument.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="proofOfAddress">Proof of Business Address *</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#BE220E] transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="proofOfAddress"
                        className="relative cursor-pointer rounded-md font-medium text-[#BE220E] hover:underline"
                      >
                        <span>Upload utility bill or lease agreement</span>
                        <input
                          id="proofOfAddress"
                          name="proofOfAddress"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'proofOfAddress')}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                    {formData.proofOfAddress && (
                      <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {formData.proofOfAddress.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ⓘ Your documents will be reviewed within 24-48 hours. You'll receive an email once your account is approved.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 text-white"
                style={{ backgroundColor: '#BE220E' }}
              >
                Submit Application
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#BE220E] hover:underline font-medium">
            Login here
          </Link>
        </div>
      </Card>
    </div>
  );
}

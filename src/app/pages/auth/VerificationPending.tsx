import { useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Clock, Mail, FileCheck, ArrowLeft } from 'lucide-react';

export default function VerificationPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3">Application Submitted!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for submitting your application. Our team is reviewing your documents.
          </p>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <FileCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-blue-900">Documents Received</div>
                <div className="text-sm text-blue-700">All required documents have been uploaded successfully</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Under Review</div>
                <div className="text-sm text-gray-600">Our team typically reviews applications within 24-48 hours</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Email Notification</div>
                <div className="text-sm text-gray-600">You'll receive an email once your account is approved</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/login')}
              className="w-full text-white"
              style={{ backgroundColor: '#BE220E' }}
            >
              Go to Login
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:support@anointed.com" className="text-[#BE220E] hover:underline">
                support@anointed.com
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

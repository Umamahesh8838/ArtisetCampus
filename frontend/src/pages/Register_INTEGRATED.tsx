import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type RegistrationStep = 'details' | 'otp' | 'password';

export default function Register() {
  // Step 1: Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Step 2: OTP
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  
  // Step 3: Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State management
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('details');
  const [localError, setLocalError] = useState('');
  
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, signup, isLoading, error: authError } = useAuth();

  const handleStepOne = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!firstName || !lastName || !email || !phone) {
      setLocalError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Invalid email format');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setLocalError('Phone must be 10 digits');
      return;
    }

    try {
      await sendOTP(email, phone);
      setCurrentStep('otp');
    } catch (err) {
      setLocalError(authError || 'Failed to send OTP');
    }
  };

  const handleStepTwo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!emailOTP || !phoneOTP) {
      setLocalError('Both OTPs are required');
      return;
    }

    try {
      await verifyOTP(email, phone, emailOTP, phoneOTP);
      setCurrentStep('password');
    } catch (err) {
      setLocalError(authError || 'OTP verification failed');
    }
  };

  const handleStepThree = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!password || !confirmPassword) {
      setLocalError('Password fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await signup(firstName, lastName, email, phone, password);
      navigate('/login', { replace: true });
    } catch (err) {
      setLocalError(authError || 'Registration failed');
    }
  };

  const handleBackStep = () => {
    if (currentStep === 'otp') setCurrentStep('details');
    if (currentStep === 'password') setCurrentStep('otp');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-600 mb-6">
          Step {currentStep === 'details' ? '1' : currentStep === 'otp' ? '2' : '3'} of 3
        </p>

        {(localError || authError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {localError || authError}
          </div>
        )}

        {/* Step 1: Email and Phone */}
        {currentStep === 'details' && (
          <form onSubmit={handleStepOne} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                disabled={isLoading}
                required
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">10 digits without country code</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <form onSubmit={handleStepTwo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email OTP</label>
              <Input
                type="text"
                value={emailOTP}
                onChange={(e) => setEmailOTP(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Sent to {email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone OTP</label>
              <Input
                type="text"
                value={phoneOTP}
                onChange={(e) => setPhoneOTP(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Sent to {phone}</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackStep}
              disabled={isLoading}
            >
              Back
            </Button>
          </form>
        )}

        {/* Step 3: Password */}
        {currentStep === 'password' && (
          <form onSubmit={handleStepThree} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackStep}
              disabled={isLoading}
            >
              Back
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Login here
          </a>
        </p>
      </Card>
    </div>
  );
}

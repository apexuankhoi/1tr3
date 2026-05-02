import React from 'react';
import { Page, Box, Text, Button, Icon, useNavigate } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { FormInput } from '@/components/FormInput';
import { userService } from '@/services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const t = useGameStore((state) => state.t);
  const login = useGameStore((state) => state.login);
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) newErrors.fullName = t('auth.required_field');
    if (!formData.email) newErrors.email = t('auth.required_field');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.invalid_email');
    }
    if (!formData.phone) newErrors.phone = t('auth.required_field');
    if (!/^0[0-9]{9,}$/.test(formData.phone)) {
      newErrors.phone = t('auth.invalid_phone');
    }
    if (!formData.password) newErrors.password = t('auth.required_field');
    if (formData.password.length < 6) {
      newErrors.password = t('auth.password_min_length');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.password_mismatch');
    }
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = t('auth.must_agree_terms');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleStep2Submit = async () => {
    setLoading(true);
    try {
      const registerData = {
        username: formData.phone,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
      };

      await userService.register(registerData);
      // Auto-login after registration
      await login(formData.phone);
      navigate('/');
    } catch (error: any) {
      alert(error.message || t('auth.register_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-gradient-to-b from-green-50 to-white min-h-screen pb-20">
      <Box className="p-4">
        {/* Header */}
        <Box className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition"
          >
            ←
          </button>
          <Text size="xl" className="font-bold text-green-800">
            {t('auth.register')}
          </Text>
        </Box>

        {/* Progress */}
        <Box className="flex gap-2 mb-8">
          <Box className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`} />
          <Box className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
        </Box>

        {/* Step 1: Basic Info */}
        {step === 1 ? (
          <Box className="space-y-4">
            <Text className="text-gray-600 mb-6">
              {t('auth.register_step1_desc')}
            </Text>

            <FormInput
              label={t('auth.full_name')}
              type="text"
              placeholder={t('auth.full_name_placeholder')}
              value={formData.fullName}
              onChange={(value) => handleInputChange('fullName', value)}
              error={errors.fullName}
              required
              icon="👤"
            />

            <FormInput
              label={t('auth.email')}
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              error={errors.email}
              required
              icon="✉️"
            />

            <FormInput
              label={t('auth.phone')}
              type="tel"
              placeholder="0xxxxxxxxx"
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value)}
              error={errors.phone}
              required
              icon="☎️"
            />

            <FormInput
              label={t('auth.password')}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              error={errors.password}
              required
              icon="🔒"
            />

            <FormInput
              label={t('auth.confirm_password')}
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              required
              icon="🔒"
            />

            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                className="mt-1 w-5 h-5 accent-green-600"
              />
              <Text size="sm" className="text-gray-700">
                {t('auth.agree_terms')}
              </Text>
            </label>
            {errors.agreedToTerms && (
              <Text size="xs" className="text-red-600">✗ {errors.agreedToTerms}</Text>
            )}

            <Button
              onClick={handleStep1Submit}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
            >
              {t('auth.next')} →
            </Button>

            <Box className="text-center mt-4">
              <Text size="sm" className="text-gray-600">
                {t('auth.already_have_account')}{' '}
                <span
                  onClick={() => navigate('/login')}
                  className="text-green-600 font-bold cursor-pointer hover:underline"
                >
                  {t('auth.login')}
                </span>
              </Text>
            </Box>
          </Box>
        ) : (
          /* Step 2: Additional Info */
          <Box className="space-y-4">
            <Text className="text-gray-600 mb-6">
              {t('auth.register_step2_desc')}
            </Text>

            <Box className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
              <Text size="sm" className="text-green-800">
                ℹ️ {t('auth.location_help_text')}
              </Text>
            </Box>

            <Button
              onClick={handleStep2Submit}
              loading={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
            >
              {t('auth.register')}
            </Button>

            <Button
              onClick={() => setStep(1)}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
            >
              ← {t('auth.back')}
            </Button>
          </Box>
        )}
      </Box>
    </Page>
  );
}

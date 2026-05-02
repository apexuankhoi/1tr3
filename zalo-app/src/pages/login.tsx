import React, { useState, useEffect } from "react";
import { Page, Box, Text, Input, Button, Icon, useNavigate } from "zmp-ui";
import { useGameStore } from "@/store/useGameStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, t } = useGameStore();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setUserCaptcha("");
  };

  const handleLogin = async () => {
    if (!phone) {
      alert(t('auth.enter_phone_required'));
      return;
    }

    if (userCaptcha !== captchaCode) {
      alert(t('auth.captcha_invalid'));
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await login(phone);
      if (res) {
        navigate("/");
      }
    } catch (error: any) {
      alert(error.message || t('auth.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-green-50">
      <Box 
        p={4} 
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
            backgroundImage: 'linear-gradient(rgba(21,66,18,0.05), rgba(21,66,18,0.1))'
        }}
      >
        <Box className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-xl space-y-6">
          <Box textAlign="center" className="space-y-2">
            <Box className="flex justify-center mb-2">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200">
                    <img src={new URL('../static/logo.png', import.meta.url).href} className="w-14 h-14" alt="logo" />
                </div>
            </Box>
            <Text.Title size="xLarge" className="text-green-800 font-bold">
              {t('auth.app_name')}
            </Text.Title>
            <Text className="text-gray-500 text-sm">{t('auth.app_desc')}</Text>
          </Box>

          <Box className="space-y-4">
            <Input
              label={t('auth.phone')}
              type="number"
              placeholder="0xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              prefix={<Icon icon="zi-call" />}
            />

            <Box className="flex space-x-2 items-end">
                <Box className="flex-1">
                    <Input
                        label={t('auth.captcha_verify')}
                        type="number"
                        placeholder="Mã xác nhận"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                    />
                </Box>
                <Box 
                    className="bg-green-800 text-white px-4 py-2 rounded-lg font-bold text-lg tracking-widest flex items-center justify-center"
                    style={{ height: '48px', minWidth: '80px' }}
                >
                    {captchaCode}
                </Box>
                <Button 
                    icon={<Icon icon="zi-notif-ring" />} 
                    variant="secondary" 
                    onClick={generateCaptcha}
                    style={{ height: '48px' }}
                />
            </Box>
            
            <Button
              fullWidth
              variant="primary"
              loading={loading}
              onClick={handleLogin}
              className="bg-green-800 h-14 rounded-xl text-lg font-bold"
            >
              {t('auth.login_btn')}
            </Button>
          </Box>
        </Box>
        
        <Box className="mt-8">
            <Text className="text-gray-400 text-xs">Phiên bản 1.0.0 (Zalo Mini App)</Text>
        </Box>
      </Box>
    </Page>
  );
};

export default LoginPage;

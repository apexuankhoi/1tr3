import React, { useState, useEffect } from "react";
import { Page, Box, Text, Button, Icon, useNavigate, Progress } from "zmp-ui";
import { useGameStore, translatePotStage, POT_SKINS, PLANT_ASSETS } from "@/store/useGameStore";

// Import local assets
import bgImg from "@/static/sky_bg.png";
import cloudImg from "@/static/may/may.png";
import logoImg from "@/static/logo.png";
import defaultAvatar from "@/static/avatar_premium.png";

const HomePage = () => {
  const navigate = useNavigate();
  const userId = useGameStore(s => s.userId);
  const fullName = useGameStore(s => s.fullName);
  const coins = useGameStore(s => s.coins);
  const level = useGameStore(s => s.level);
  const exp = useGameStore(s => s.exp);
  const pots = useGameStore(s => s.pots);
  const seeds = useGameStore(s => s.seeds);
  const avatarUrl = useGameStore(s => s.avatarUrl);
  const t = useGameStore(s => s.t);
  
  const [selectedPotId, setSelectedPotId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId]);

  const selectedPot = pots.find(p => p.id === selectedPotId);

  // Helper to get local asset URL
  const getAssetUrl = (path: string) => {
      // In Vite, if the path starts with @, it's already handled, 
      // but for dynamic paths from store, we might need a mapping
      return new URL(`../static/${path}`, import.meta.url).href;
  };

  const getTreeImage = (pot: any) => {
    if (!pot || !pot.hasPlant) return null;
    const type = pot.plantType || 'cafe';
    const stage = pot.growthStage || 'Nảy mầm';
    
    // Mapping back to local paths based on the structure we saw
    const stageMap: Record<string, string> = {
        'Nảy mầm': 'mamcay.png',
        'Cây non': 'naymam.png',
        'Cây trưởng thành': 'caytruongthanh.png',
        'Trưởng thành': 'caytruongthanh.png',
        'Ra hoa': 'rahoa.png',
        'Kết trái': 'raqua.png'
    };
    
    const fileName = stageMap[stage] || 'mamcay.png';
    return getAssetUrl(`cay/${type}/${fileName}`);
  };

  const getPotImage = (pot: any) => {
    if (!pot.hasPot) return null;
    const skinId = pot.skinId || '11';
    // Handle 'default' being '11' or similar
    const finalSkinId = skinId === 'default' ? '11' : skinId;
    return getAssetUrl(`chau/${finalSkinId}.png`);
  };

  if (!userId) return null;

  return (
    <Page className="relative min-h-screen bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${bgImg})` }}>
      {/* Header */}
      <Box className="flex justify-between items-center px-4 pt-12 pb-4 bg-transparent z-10 relative">
        <Box className="flex items-center space-x-3">
          <Box className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg bg-orange-100">
            <img src={avatarUrl || defaultAvatar} className="w-full h-full object-cover" alt="avatar" />
          </Box>
          <Box>
            <Text className="text-gray-800 text-[10px] font-bold uppercase tracking-wider opacity-70">{t('home.garden_of')}</Text>
            <Text className="text-green-900 text-lg font-black leading-none -mt-1">{fullName}</Text>
          </Box>
        </Box>
        <Box className="flex space-x-2">
          <Box className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center space-x-1 shadow-sm border border-white/50">
            <Text className="text-lg">🍃</Text>
            <Text className="font-black text-green-900 text-sm">{seeds}</Text>
          </Box>
          <Box className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center space-x-1 shadow-sm border border-white/50">
            <Text className="text-lg">⭐</Text>
            <Text className="font-black text-orange-600 text-sm">{coins}</Text>
          </Box>
        </Box>
      </Box>

      {/* Level Bar */}
      <Box className="px-4 mt-2 z-10 relative">
        <Box className="flex items-center space-x-2 bg-black/10 p-1 rounded-full backdrop-blur-md border border-white/20 shadow-inner">
          <Box className="bg-gradient-to-r from-green-700 to-green-900 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md">
            LV.{level}
          </Box>
          <Box className="flex-1 px-1">
            <Box className="w-full h-2 bg-white/20 rounded-full overflow-hidden shadow-inner">
                <Box 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, (exp / (level * 100)) * 100)}%` }}
                />
            </Box>
          </Box>
          <Text className="text-[10px] font-black text-green-900 pr-2">
            {exp}/{level * 100} EXP
          </Text>
        </Box>
      </Box>

      {/* Garden Title */}
      <Box className="text-center mt-4 z-10 relative">
        <Text.Title className="text-green-900 font-black text-3xl drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">
          {t('home.garden_title')} <span className="animate-bounce inline-block">☁️</span>
        </Text.Title>
      </Box>

      {/* Floating Map Button */}
      <Box 
        className="fixed top-24 right-4 z-50 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 active:scale-95 transition-transform"
        onClick={() => navigate("/map")}
      >
        <Icon icon="zi-location-solid" className="text-green-800" size={24} />
      </Box>

      {/* Garden Area - Scrollable floors */}
      <Box className="mt-4 pb-64 overflow-y-auto h-[calc(100vh-280px)] scrollbar-hide px-4">
        {[1, 2, 3].map((floorId) => (
          <Box key={floorId} className="relative mb-20 flex flex-col items-center">
            {/* Cloud Platform */}
            <Box className="relative w-full flex justify-center">
                <img 
                    src={cloudImg} 
                    className="w-full max-w-[360px] opacity-95 drop-shadow-xl" 
                    alt="cloud" 
                />
                
                {/* Pots on Cloud */}
                <Box className="absolute -top-10 left-0 w-full h-full flex justify-around items-end pb-8 px-2">
                    {pots.filter(p => p.floorId === floorId).map((pot) => {
                        const isSelected = selectedPotId === pot.id;
                        const treeImg = getTreeImage(pot);
                        const potImg = getPotImage(pot);

                        return (
                            <Box 
                                key={pot.id} 
                                className={`relative flex flex-col items-center group transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'scale-100'}`}
                                onClick={() => setSelectedPotId(pot.id)}
                            >
                                {/* Plant */}
                                {pot.hasPlant && treeImg && (
                                    <Box className="absolute -top-20 w-24 h-24 flex items-center justify-center">
                                        <img 
                                            src={treeImg} 
                                            className={`w-full h-full object-contain drop-shadow-md ${pot.isWilted ? 'grayscale sepia' : ''}`}
                                            alt="plant" 
                                        />
                                    </Box>
                                )}

                                {/* Pot */}
                                {pot.hasPot ? (
                                    <img 
                                        src={potImg} 
                                        className="w-20 h-20 z-10 drop-shadow-lg" 
                                        alt="pot" 
                                    />
                                ) : (
                                    <Box className="w-12 h-12 mb-4 rounded-2xl bg-white/40 border-2 border-dashed border-green-600/30 flex items-center justify-center text-green-800 text-2xl font-black backdrop-blur-sm shadow-inner">
                                        +
                                    </Box>
                                )}
                                
                                {/* Selection Glow */}
                                {isSelected && (
                                    <Box className="absolute -bottom-2 w-16 h-4 bg-green-500/30 blur-md rounded-full animate-pulse" />
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Action Panel - Floating at bottom */}
      <Box className="fixed bottom-20 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_20px_50px_rgba(21,66,18,0.3)] border border-white/50 z-[100] transform transition-all duration-500">
        {!selectedPot ? (
          <Box className="text-center py-2 flex flex-center flex-col items-center">
            <Box className="w-10 h-1 h-1 bg-gray-200 rounded-full mb-4" />
            <Text className="text-gray-400 font-bold text-sm tracking-wide">{t('home.locked_plot')}</Text>
          </Box>
        ) : !selectedPot.hasPot ? (
            <Box className="text-center py-2">
                <Text className="text-green-900 font-black text-lg mb-3">Ô đất này còn trống</Text>
                <Button fullWidth className="bg-green-800 h-12 rounded-2xl shadow-lg border-b-4 border-green-950 active:border-b-0 active:translate-y-1">
                    Đặt chậu mới
                </Button>
            </Box>
        ) : !selectedPot.hasPlant ? (
          <Box className="flex flex-col items-center space-y-4">
            <Box className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center shadow-inner">
                <Icon icon="zi-plus-circle" className="text-green-700 text-4xl" />
            </Box>
            <Box className="text-center">
                <Text className="font-black text-green-900 text-xl leading-tight">{t('garden.empty_plot')}</Text>
                <Text className="text-gray-500 font-bold text-sm mt-1">Hạt giống: {seeds}</Text>
            </Box>
            <Button fullWidth className="bg-green-800 h-14 rounded-[20px] text-lg font-black shadow-lg border-b-4 border-green-950">
                {t('garden.plant')}
            </Button>
          </Box>
        ) : (
          <Box className="space-y-4">
            <Box className="flex justify-between items-end">
                <Box>
                    <Text className="font-bold text-gray-500 text-xs uppercase tracking-widest">{t('garden.growing')}</Text>
                    <Text className="text-green-900 text-xl font-black leading-none">
                        {translatePotStage(selectedPot.growthStage, t as any)}
                    </Text>
                </Box>
                <Box className="bg-green-800 text-white px-3 py-1.5 rounded-xl shadow-md">
                    <Text className="font-black text-sm">{selectedPot.growthProgress}%</Text>
                </Box>
            </Box>
            
            <Box className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
                <Box 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    style={{ width: `${selectedPot.growthProgress}%` }}
                />
            </Box>
            
            <Box className="flex space-x-3 pt-2">
                <Button className="flex-1 bg-blue-500 h-12 rounded-2xl font-bold shadow-lg border-b-4 border-blue-700">Tưới nước</Button>
                <Button className="flex-1 bg-orange-500 h-12 rounded-2xl font-bold shadow-lg border-b-4 border-orange-700">Bón phân</Button>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Bottom Nav */}
      <Box className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-4 pb-2 z-[90]">
         <Box className="flex flex-col items-center text-green-800">
            <Box className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-1">
                <Icon icon="zi-home" className="text-2xl" />
            </Box>
            <Text className="text-[10px] font-black uppercase">Vườn</Text>
         </Box>
         <Box className="flex flex-col items-center text-gray-300" onClick={() => navigate("/login")}>
            <Icon icon="zi-user" className="text-2xl mb-1" />
            <Text className="text-[10px] font-bold uppercase">Tôi</Text>
         </Box>
      </Box>
    </Page>
  );
};

export default HomePage;

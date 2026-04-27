import { create } from "zustand";
import { translations, Language } from "../translations";
import { userService, shopService, gardenService, pushService, taskService } from "../services/api";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// Detect Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// ── Push Notification Config ──────────────────────────────────────────────────
/*
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldFlashScreen: false,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.log('[Push] Notification handler setup failed');
}
*/

export interface PotData {
  id: string; 
  floorId: number;
  hasPlant: boolean;
  waterLevel: number;
  fertilizerLevel: number;
  growthStage: string;
  growingUntil: number;
}

interface GameState {
  userId: number;
  userName: string;
  fullName: string;
  dob: string;
  userRole: 'farmer' | 'buyer' | 'moderator' | 'admin';
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  location: string;
  createdAt: string;
  coins: number;
  level: number;
  exp: number;
  userStats: { tasksCompleted: number; redemptions: number };
  submissions: any[];
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, any>) => any;

  // Multi-pot System
  pots: PotData[];
  seeds: number;

  // Actions
  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => boolean;
  
  // New Pot Actions
  plantSeed: (potId: string) => void;
  waterPot: (potId: string) => void;
  fertilizePot: (potId: string) => void;
  harvestPot: (potId: string) => void;
  advancePotStage: (potId: string) => void;
  
  syncStats: () => Promise<void>;
  syncGarden: () => Promise<void>;
  fetchUserData: (userId: number) => Promise<void>;
  buyItem: (itemId: number, price: number) => Promise<any>;
  buySeed: (price: number) => boolean;
  setRole: (role: 'farmer' | 'buyer' | 'moderator' | 'admin') => void;
  toast: { message: string; type: 'error' | 'success' } | null;
  shakeTrigger: number;
  setToast: (toast: { message: string; type: 'error' | 'success' } | null) => void;
  showToast: (message: string, type?: 'error' | 'success') => void;
  login: (phone: string) => Promise<any>;
  redemptions: any[];
  fetchRedemptions: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  registerPushToken: () => Promise<void>;
  scheduleWaterReminder: () => Promise<void>;
  updateProfile: (data: { fullName?: string; dob?: string; email?: string; avatarUrl?: string; coverUrl?: string; bio?: string; location?: string }) => Promise<any>;
  logout: () => void;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (val: boolean) => void;
}

const GROWTH_DURATION_MS = 3600000; 

const generateInitialPots = (): PotData[] => {
  const defaultPots: PotData[] = [];
  for (let floor = 1; floor <= 2; floor++) {
    for (let p = 1; p <= 3; p++) {
      defaultPots.push({
        id: `floor${floor}_pot${p}`,
        floorId: floor,
        hasPlant: floor === 1 && p === 1,
        waterLevel: 0,
        fertilizerLevel: 0,
        growthStage: "Hạt cà phê",
        growingUntil: 0,
      });
    }
  }
  return defaultPots;
};

let gardenSyncTimer: any = null;
const debouncedGardenSync = (syncFn: () => Promise<void>) => {
  if (gardenSyncTimer) clearTimeout(gardenSyncTimer);
  gardenSyncTimer = setTimeout(() => {
    syncFn();
  }, 2000);
};

const useGameStore = create<GameState>((set, get) => ({
  userId: 0,
  userName: "",
  fullName: "",
  userRole: 'farmer',
  avatarUrl: "",
  coverUrl: "",
  bio: "",
  location: "",
  createdAt: "",
  coins: 100,
  level: 1,
  exp: 0,
  userStats: { tasksCompleted: 0, redemptions: 0 },
  redemptions: [],
  submissions: [],

  pots: generateInitialPots(),
  seeds: 2,

  language: 'vi',
  setLanguage: (lang) => set({ language: lang }),
  t: (path, params) => {
    const lang = 'vi';
    const keys = path.split('.');
    let result: any = (translations as any)[lang];
    
    for (const key of keys) {
      if (result && result[key]) result = result[key];
      else return path;
    }
    
    if (typeof result === 'string' && params) {
      Object.keys(params).forEach(pKey => {
        result = result.replace(`{${pKey}}`, params[pKey]);
      });
    }
    return (typeof result === 'string' || Array.isArray(result)) ? result : path;
  },

  hasSeenTutorial: false,
  setHasSeenTutorial: (val) => set({ hasSeenTutorial: val }),

  toast: null,
  shakeTrigger: 0,
  setToast: (toast) => set({ toast }),
  showToast: (message, type = 'error') => {
    set({ 
      toast: { message, type: type as any },
      shakeTrigger: type === 'error' ? get().shakeTrigger + 1 : get().shakeTrigger
    });
    setTimeout(() => set({ toast: null }), 3000);
  },

  addCoins: async (amount) => {
    set((state) => ({ coins: state.coins + amount }));
    await get().syncStats();
  },

  spendCoins: (amount) => {
    if (get().coins >= amount) {
      set((state) => ({ coins: state.coins - amount }));
      get().syncStats();
      return true;
    }
    return false;
  },

  buySeed: (price) => {
    if (get().coins >= price) {
      set((state) => ({ 
        coins: state.coins - price,
        seeds: state.seeds + 1 
      }));
      get().showToast("Mua hạt giống thành công! 🌟", 'success');
      get().syncStats();
      get().syncGarden();
      return true;
    }
    get().showToast("Không đủ xu để mua hạt giống!", 'error');
    return false;
  },

  plantSeed: (potId) => {
    const state = get();
    if (state.seeds <= 0) {
      state.showToast("Bạn đã hết hạt giống! Hãy vào Cửa hàng để mua thêm.", 'error');
      return;
    }
    
    set((state) => ({
      seeds: state.seeds - 1,
      pots: state.pots.map(pot => pot.id === potId ? {
        ...pot,
        hasPlant: true,
        waterLevel: 0,
        fertilizerLevel: 0,
        growthStage: "Nảy mầm",
        growingUntil: 0,
      } : pot)
    }));
    get().showToast("Đã gieo hạt giống thành công! 🌱", 'success');
    debouncedGardenSync(() => get().syncGarden());
  },

  waterPot: (potId) => {
    set((state) => ({
      pots: state.pots.map(pot => {
        if (pot.id !== potId || !pot.hasPlant) return pot;
        const newWater = Math.round(Math.min(1, pot.waterLevel + 0.5) * 10) / 10;
        
        let newStage = pot.growthStage;
        let newWaterFinal = newWater;
        let newFertilizerFinal = pot.fertilizerLevel;

        if (newWater >= 0.99 && pot.fertilizerLevel >= 0.99) {
          const stages = ["Hạt cà phê", "Cây non", "Cây trưởng thành", "Ra hoa", "Kết trái"];
          const idx = stages.indexOf(pot.growthStage);
          if (idx < stages.length - 1) {
            newStage = stages[idx + 1];
            newWaterFinal = 0;
            newFertilizerFinal = 0;
            get().showToast(`🌿 Cây cà phê đã lớn lên: ${newStage}!`, 'success');
          }
        }
        return { ...pot, waterLevel: newWaterFinal, fertilizerLevel: newFertilizerFinal, growthStage: newStage };
      })
    }));
    debouncedGardenSync(() => get().syncGarden());
  },

  fertilizePot: (potId) => {
    set((state) => ({
      pots: state.pots.map(pot => {
        if (pot.id !== potId || !pot.hasPlant) return pot;
        const newFertilizer = Math.round(Math.min(1, pot.fertilizerLevel + 0.5) * 10) / 10;
        
        let newStage = pot.growthStage;
        let newWaterFinal = pot.waterLevel;
        let newFertilizerFinal = newFertilizer;

        if (pot.waterLevel >= 0.99 && newFertilizer >= 0.99) {
          const stages = ["Hạt cà phê", "Cây non", "Cây trưởng thành", "Ra hoa", "Kết trái"];
          const idx = stages.indexOf(pot.growthStage);
          if (idx < stages.length - 1) {
            newStage = stages[idx + 1];
            newWaterFinal = 0;
            newFertilizerFinal = 0;
            get().showToast(`🌿 Cây cà phê đã lớn lên: ${newStage}!`, 'success');
          }
        }
        return { ...pot, waterLevel: newWaterFinal, fertilizerLevel: newFertilizerFinal, growthStage: newStage };
      })
    }));
    debouncedGardenSync(() => get().syncGarden());
  },

  advancePotStage: (potId) => {
    set((state) => ({
      pots: state.pots.map(pot => {
        if (pot.id !== potId || pot.growingUntil === 0 || Date.now() < pot.growingUntil) return pot;
        
        const stages = ["Nảy mầm", "Cây non", "Cây trưởng thành", "Ra hoa", "Kết trái"];
        const currentIndex = stages.indexOf(pot.growthStage);
        if (currentIndex < stages.length - 1) {
          get().showToast(`🎉 Một cây đã phát triển thành: ${stages[currentIndex + 1]}!`, 'success');
          return {
            ...pot,
            growthStage: stages[currentIndex + 1],
            waterLevel: 0,
            fertilizerLevel: 0,
            growingUntil: 0
          };
        }
        return pot;
      })
    }));
    get().syncGarden();
  },

  harvestPot: (potId) => {
    const pot = get().pots.find(p => p.id === potId);
    if (!pot || pot.growthStage !== "Kết trái") {
      get().showToast("Cây chưa ra quả!", 'error');
      return;
    }
    
    set((state) => ({
      coins: state.coins + 50,
      pots: state.pots.map(p => p.id === potId ? { ...p, hasPlant: false } : p)
    }));
    get().showToast("🎉 Thu hoạch thành công! +50 xu", 'success');
    get().syncStats();
    get().syncGarden();
  },

  syncStats: async () => {
    const { userId, coins, seeds } = get();
    if (userId) {
      try {
        await userService.updateStats(userId, { coins, seeds } as any);
      } catch (error) {
        console.error("Lỗi khi đồng bộ dữ liệu:", error);
      }
    }
  },

  syncGarden: async () => {
    const { userId, pots, seeds } = get();
    if (userId) {
      try {
        await gardenService.savePots(userId, pots, seeds);
      } catch (error) {
        console.error("Lỗi khi đồng bộ khu vườn:", error);
      }
    }
  },

  fetchUserData: async (userId) => {
    try {
      const data: any = await userService.getUserInfo(userId);
      set({ 
        userId: data.id, 
        userName: data.username,
        fullName: data.full_name || data.fullName || "",
        dob: data.dob || "",
        userRole: data.role as any,
        coins: data.coins,
        level: data.level || 1,
        exp: data.exp || 0,
        seeds: data.seeds ?? 2,
        avatarUrl: data.avatar_url,
        coverUrl: data.cover_url,
        bio: data.bio || "",
        location: data.location || "Chưa cập nhật",
        createdAt: data.created_at || "",
        userStats: data.stats || { tasksCompleted: 0, redemptions: 0 }
      });

      try {
        const res: any = await gardenService.loadPots(userId);
        const savedPots = res?.data || res;
        if (Array.isArray(savedPots)) {
          const uniquePots: PotData[] = [];
          const seenIds = new Set();
          
          for (const p of savedPots) {
            if (p && p.pot_id && !seenIds.has(p.pot_id)) {
              seenIds.add(p.pot_id);
              uniquePots.push({
                id: p.pot_id,
                floorId: p.floor_id,
                hasPlant: !!p.has_plant,
                waterLevel: p.water_level || 0,
                fertilizerLevel: p.fertilizer_level || 0,
                growthStage: p.growth_stage || "Nảy mầm",
                growingUntil: Number(p.growing_until) || 0,
              });
            }
          }
          if (uniquePots.length > 0) {
            const defaultPots = generateInitialPots();
            const mergedPots = defaultPots.map(dp => {
              const sp = uniquePots.find(up => up.id === dp.id);
              return sp || dp;
            });
            set({ pots: mergedPots });
          }
        }
      } catch (e) { console.log("Garden load error:", e); }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu người dùng:", error);
    }
  },

  fetchRedemptions: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const data: any = await shopService.getRedemptions(userId);
      set({ redemptions: data || [] });
    } catch (error) {
      console.error("Fetch redemptions error:", error);
    }
  },

  fetchSubmissions: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const data: any = await taskService.getUserSubmissions(userId);
      set({ submissions: data || [] });
    } catch (error) {
      console.error("Fetch submissions error:", error);
    }
  },

  setRole: (role) => set({ userRole: role }),

  login: async (phone: string) => {
    try {
      const data: any = await userService.login({ username: phone });
      set({
        userId: data.id,
        userName: data.username,
        fullName: data.full_name || data.fullName || "",
        dob: data.dob || "",
        userRole: data.role,
        coins: data.coins,
        level: data.level || 1,
        exp: data.exp || 0,
        seeds: data.seeds ?? 2,
        avatarUrl: data.avatar_url,
        coverUrl: data.cover_url,
        bio: data.bio || "",
        location: data.location || "Chưa cập nhật",
        createdAt: data.created_at || "",
        userStats: data.stats || { tasksCompleted: 0, redemptions: 0 }
      });
      
      // Load garden
      try {
        const res: any = await gardenService.loadPots(data.id);
        const savedPots = res?.data || res; // Handle both direct array and wrapped response
        if (Array.isArray(savedPots)) {
          const uniquePots: PotData[] = [];
          const seenIds = new Set();
          for (const p of savedPots) {
            if (p && p.pot_id && !seenIds.has(p.pot_id)) {
              seenIds.add(p.pot_id);
              uniquePots.push({
                id: p.pot_id,
                floorId: p.floor_id,
                hasPlant: !!p.has_plant,
                waterLevel: p.water_level || 0,
                fertilizerLevel: p.fertilizer_level || 0,
                growthStage: p.growth_stage || "Nảy mầm",
                growingUntil: Number(p.growing_until) || 0,
              });
            }
          }
          if (uniquePots.length > 0) {
            const defaultPots = generateInitialPots();
            const mergedPots = defaultPots.map(dp => {
              const sp = uniquePots.find(up => up.id === dp.id);
              return sp || dp;
            });
            set({ pots: mergedPots });
          }
        }
      } catch (e) { console.log("Garden load error:", e); }

      get().fetchRedemptions();
      get().fetchSubmissions();
      get().registerPushToken();
      return data;
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);
      get().showToast(error.message || "Lỗi đăng nhập", 'error');
      return false;
    }
  },

  buyItem: async (itemId, price) => {
    const { userId, coins } = get();
    if (!userId || coins < price) return false;
    try {
      const data: any = await shopService.buyItem(userId, itemId, price);
      get().showToast(data.message || "Đổi quà thành công! 🎁", 'success');
      set({ coins: data.remainingCoins });
      get().fetchRedemptions();
      return data;
    } catch (error: any) {
      console.error("Buy item error:", error);
      get().showToast(error.message || "Lỗi mua đồ", 'error');
      return false;
    }
  },

  registerPushToken: async () => {
    if (isExpoGo) return;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const projectId = (Constants.expoConfig as any)?.extra?.eas?.projectId || (Constants.expoConfig as any)?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: projectId || undefined });
      const token = tokenData.data;

      const { userId } = get();
      if (userId && token) {
        await pushService.registerToken(userId, token, Platform.OS);
      }
    } catch (error) {
      console.log('[Push] Registration skipped');
    }
  },

  scheduleWaterReminder: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌱 Cây đã lớn xong!",
          body: "Cây trong vườn đã phát triển! Vào tưới nước và bón phân để cây tiếp tục lớn nhé!",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.ceil(GROWTH_DURATION_MS / 1000),
        },
      });
    } catch (error) {
      console.log('[Push] Local notification schedule skipped');
    }
  },

  updateProfile: async (data) => {
    const { userId } = get();
    if (!userId) return false;
    try {
      const res: any = await userService.updateProfile(userId, data);
      const updatedData = res?.data || res;
      
      if (updatedData) {
        set({
          fullName: updatedData.full_name || updatedData.fullName || "",
          dob: updatedData.dob || "",
          avatarUrl: updatedData.avatar_url,
          coverUrl: updatedData.cover_url,
          bio: updatedData.bio,
          location: updatedData.location
        });
        get().showToast("Cập nhật trang cá nhân thành công!", 'success');
        return updatedData;
      }
      return false;
    } catch (error: any) {
      console.error("Update profile error:", error);
      get().showToast(error.message || "Lỗi cập nhật", 'error');
      return false;
    }
  },

  logout: () => {
    set({
      userId: 0,
      userName: "",
      fullName: "",
      userRole: 'farmer',
      avatarUrl: "",
      coverUrl: "",
      bio: "",
      location: "",
      coins: 100,
      level: 1,
      exp: 0,
      seeds: 2,
      pots: generateInitialPots(),
      redemptions: [],
    });
  },
}));

export { useGameStore };

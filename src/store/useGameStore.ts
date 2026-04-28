import { create } from "zustand";
import { translations, Language } from "../translations";
import { userService, shopService, gardenService, pushService, taskService } from "../services/api";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// Detect Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export interface PotData {
  id: string; 
  floorId: number;
  hasPlant: boolean;
  plantType?: 'cafe' | 'saurieng' | null;
  growthProgress: number; // 0-100
  growthStage: string;
  isWilted: boolean;
  growingUntil: number;
  skinId: string;
  hasPot: boolean;
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
  inventory: any[];
  fetchInventory: () => Promise<void>;
  
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
  plantSeed: (potId: string, type?: 'cafe' | 'saurieng') => void;
  waterPot: (potId: string) => void;
  fertilizePot: (potId: string) => void;
  addGrowth: (amount: number) => void;
  checkDailyStatus: () => Promise<void>;
  harvestPot: (potId: string) => void;
  advancePotStage: (potId: string) => void;
  placePot: (potId: string, skinId: string) => void;
  changePotSkin: (potId: string, skinId: string) => void;
  
  syncStats: () => Promise<void>;
  syncGarden: () => Promise<void>;
  fetchUserData: (userId: number) => Promise<void>;
  buyItem: (itemId: number, price: number, shippingData?: any) => Promise<any>;
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
  changePotSkin: (potId: string, skinId: string) => void;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (val: boolean) => void;
}

const GROWTH_DURATION_MS = 3600000;

/** Canonical Vietnamese labels persisted for pots / API — map to i18n via translatePotStage */
const POT_STAGE_TO_I18N: Record<string, string> = {
  "Hạt cà phê": "garden.stage_bean",
  "Nảy mầm": "garden.stage_sprout",
  "Cây non": "garden.stage_seedling",
  "Cây trưởng thành": "garden.stage_mature_tree",
  "Trưởng thành": "garden.stage_mature_alt",
  "Ra hoa": "garden.stage_flowering",
  "Kết trái": "garden.stage_fruit",
};

export const POT_SKINS: Record<string, any> = {
  'default': { id: 'default', name: 'Chậu Gỗ', image: require('../../assets/chau/11.png'), price: 0 },
  '1': { name: 'Chậu Gốm Đỏ', image: require('../../assets/chau/1.png') },
  '2': { name: 'Chậu Đất Nung', image: require('../../assets/chau/2.png') },
  '3': { name: 'Chậu Sứ Xanh', image: require('../../assets/chau/3.png') },
  '4': { name: 'Chậu Sứ Trắng', image: require('../../assets/chau/4.png') },
  '5': { name: 'Chậu Cổ Điển', image: require('../../assets/chau/5.png') },
  '6': { name: 'Chậu Vàng Hoàng Gia', image: require('../../assets/chau/6.png') },
  '7': { name: 'Chậu Ngọc Bích', image: require('../../assets/chau/7.png') },
  '8': { name: 'Chậu Họa Tiết', image: require('../../assets/chau/8.png') },
  '9': { name: 'Chậu Cao Cấp', image: require('../../assets/chau/9.png') },
  '10': { name: 'Chậu Đặc Biệt', image: require('../../assets/chau/10.png') },
};

export const PLANT_ASSETS: Record<string, Record<string, any>> = {
  'cafe': {
    'Nảy mầm': require('../../assets/cay/cafe/mamcay.png'),
    'Cây non': require('../../assets/cay/cafe/naymam.png'),
    'Cây trưởng thành': require('../../assets/cay/cafe/caytruongthanh.png'),
    'Ra hoa': require('../../assets/cay/cafe/rahoa.png'),
    'Kết trái': require('../../assets/cay/cafe/raqua.png'),
  },
  'saurieng': {
    'Nảy mầm': require('../../assets/cay/saurieng/mamcay.png'),
    'Cây non': require('../../assets/cay/saurieng/naymam.png'),
    'Cây trưởng thành': require('../../assets/cay/saurieng/caytruongthanh.png'),
    'Ra hoa': require('../../assets/cay/saurieng/rahoa.png'),
    'Kết trái': require('../../assets/cay/saurieng/raqua.png'),
  }
};

export function translatePotStage(
  stage: string,
  t: (path: string, params?: Record<string, unknown>) => unknown
): string {
  const pathKey = POT_STAGE_TO_I18N[stage];
  return pathKey ? String(t(pathKey)) : stage;
}

const GROWTH_STAGE_ORDER = [
  "Nảy mầm",
  "Cây non",
  "Cây trưởng thành",
  "Ra hoa",
  "Kết trái",
] as const;

const generateInitialPots = (): PotData[] => {
  const defaultPots: PotData[] = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let p = 1; p <= 3; p++) {
      const globalIdx = (floor - 1) * 3 + (p - 1);
      defaultPots.push({
        id: `floor${floor}_pot${p}`,
        floorId: floor,
        hasPlant: false,
        plantType: 'cafe',
        growthProgress: 0,
        growthStage: "Nảy mầm",
        isWilted: false,
        growingUntil: 0,
        skinId: 'default',
        hasPot: globalIdx < 3 ? true : false,
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
  dob: "",
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
  inventory: [],
  fetchInventory: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const res: any = await shopService.getInventory(userId);
      set({ inventory: res || [] });
    } catch (err) {
      console.error("Fetch inventory error:", err);
    }
  },

  pots: generateInitialPots(),
  seeds: 2,

  language: 'vi',
  setLanguage: (lang) => set({ language: lang }),
  t: (path, params) => {
    const lang = get().language;
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

  setRedemptions: (reds) => set({ redemptions: reds }),

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
      get().showToast(get().t('garden.toast_buy_seed_success'), 'success');
      get().syncStats();
      get().syncGarden();
      return true;
    }
    get().showToast(get().t('garden.toast_buy_seed_no_coins'), 'error');
    return false;
  },

  plantSeed: (potId, type: 'cafe' | 'saurieng' = 'cafe') => {
    const state = get();
    if (state.seeds <= 0) {
      state.showToast(state.t('garden.toast_no_seeds_shop'), 'error');
      return;
    }
    
    set((state) => ({
      seeds: state.seeds - 1,
      pots: state.pots.map(pot => pot.id === potId ? {
        ...pot,
        hasPlant: true,
        plantType: type,
        growthProgress: 0,
        growthStage: "Nảy mầm",
        isWilted: false,
        growingUntil: 0,
      } : pot)
    }));
    get().showToast(get().t('garden.toast_plant_success'), 'success');
    debouncedGardenSync(() => get().syncGarden());
  },

  addGrowth: (amount: number) => {
    set((state) => ({
      pots: state.pots.map(pot => {
        if (!pot.hasPlant || pot.growthStage === "Kết trái") return pot;
        
        let newProgress = pot.growthProgress + amount;
        let newStage = pot.growthStage;
        
        if (newProgress >= 100) {
          const idx = GROWTH_STAGE_ORDER.indexOf(pot.growthStage as any);
          if (idx >= 0 && idx < GROWTH_STAGE_ORDER.length - 1) {
            newStage = GROWTH_STAGE_ORDER[idx + 1];
            newProgress = 0;
            const tt = get().t;
            get().showToast(
              tt('garden.toast_stage_advanced', { stage: translatePotStage(newStage, tt as any) }),
              'success'
            );
          } else {
            newProgress = 100;
          }
        }
        
        return { ...pot, growthProgress: newProgress, growthStage: newStage, isWilted: false };
      })
    }));
    get().syncGarden();
  },

  checkDailyStatus: async () => {
    // This would ideally check with the backend for last activity
    // For now, it's a placeholder for the wilting logic
  },

  advancePotStage: (potId) => {
    set((state) => ({
      pots: state.pots.map(pot => {
        if (pot.id !== potId) return pot;
        
        const idx = GROWTH_STAGE_ORDER.indexOf(pot.growthStage as any);
        if (idx >= 0 && idx < GROWTH_STAGE_ORDER.length - 1) {
          const nextStage = GROWTH_STAGE_ORDER[idx + 1];
          const tt = get().t;
          get().showToast(
            tt('garden.toast_stage_developed', { stage: translatePotStage(nextStage, tt as any) }),
            'success'
          );
          return {
            ...pot,
            growthStage: nextStage,
            growthProgress: 0,
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
      get().showToast(get().t('garden.toast_not_fruit_yet'), 'error');
      return;
    }
    
    set((state) => ({
      coins: state.coins + 50,
      pots: state.pots.map(p => p.id === potId ? { ...p, hasPlant: false, growthProgress: 0, growthStage: "Nảy mầm", plantType: null } : p)
    }));
    get().showToast("🎉 Thu hoạch thành công! +50 xu", 'success');
    get().syncStats();
    get().syncGarden();
  },

  waterPot: (potId) => {
    set((state) => ({
      pots: state.pots.map(p => {
        if (p.id !== potId || !p.hasPlant) return p;
        // Speeds up growth or just updates status
        return { ...p, isWilted: false, growthProgress: Math.min(100, p.growthProgress + 5) };
      })
    }));
    get().showToast("💧 Đã tưới nước cho cây", 'success');
    get().syncGarden();
  },

  fertilizePot: (potId) => {
    set((state) => ({
      pots: state.pots.map(p => {
        if (p.id !== potId || !p.hasPlant) return p;
        return { ...p, growthProgress: Math.min(100, p.growthProgress + 15) };
      })
    }));
    get().showToast("✨ Đã bón phân cho cây", 'success');
    get().syncGarden();
  },

  advancePotStage: (potId) => {
    const stages = ["Nảy mầm", "Cây non", "Cây trưởng thành", "Ra hoa", "Kết trái"];
    set((state) => ({
      pots: state.pots.map(p => {
        if (p.id !== potId || !p.hasPlant) return p;
        const currentIdx = stages.indexOf(p.growthStage);
        if (currentIdx >= 0 && currentIdx < stages.length - 1) {
          return { ...p, growthStage: stages[currentIdx + 1], growthProgress: 0 };
        }
        return p;
      })
    }));
    get().syncGarden();
  },

  changePotSkin: (potId, skinId) => {
    set((state) => ({
      pots: state.pots.map(p => p.id === potId ? { ...p, skinId } : p)
    }));
    get().syncGarden();
  },

  placePot: (potId, skinId) => {
    set((state) => ({
      pots: state.pots.map((p) =>
        p.id === potId ? { 
          ...p, 
          hasPot: true, 
          skinId: skinId,
          hasPlant: false,
          plantType: null,
          growthStage: "Nảy mầm",
          growthProgress: 0,
          isWilted: false,
          growingUntil: 0
        } : p
      ),
    }));
    get().syncGarden();
  },

  syncStats: async () => {
    const { userId, coins, seeds } = get();
    if (userId) {
      try {
        await userService.updateStats(userId, { coins, seeds } as any);
      } catch (error) {
        console.error("syncStats failed:", error);
      }
    }
  },

  syncGarden: async () => {
    const { userId, pots, seeds } = get();
    if (userId) {
      try {
        await gardenService.savePots(userId, pots, seeds);
      } catch (error) {
        console.error("syncGarden failed:", error);
      }
    }
  },

  fetchUserData: async (userId) => {
    try {
      const data: any = await userService.getUserInfo(userId);
      set({ 
        userId: data.id || 0, 
        userName: data.username || "",
        fullName: data.full_name || data.fullName || "",
        dob: data.dob || "",
        userRole: (data.role as any) || "farmer",
        coins: Number(data.coins) || 0,
        level: Number(data.level) || 1,
        exp: Number(data.exp) || 0,
        seeds: Number(data.seeds ?? 2),
        avatarUrl: data.avatar_url || "",
        coverUrl: data.cover_url || "",
        bio: data.bio || "",
        location: data.location || get().t('common.not_updated'),
        createdAt: data.created_at || "",
        userStats: data.stats || { tasksCompleted: 0, redemptions: 0 }
      });

      try {
        const res: any = await gardenService.loadPots(userId);
        
        let potsFromDb = res || [];
        const defaultPots = generateInitialPots();
        
        if (potsFromDb.length === 0) {
          set({ pots: defaultPots });
          get().syncGarden();
        } else {
          const mergedPots = defaultPots.map(dp => {
            const sp = potsFromDb.find((up: any) => up.id === dp.id);
            if (sp) {
              return {
                ...dp,
                ...sp,
                hasPlant: Boolean(sp.hasPlant),
                isWilted: Boolean(sp.isWilted),
                hasPot: Boolean(sp.hasPot),
                growthProgress: Number(sp.growthProgress) || 0,
                growingUntil: Number(sp.growingUntil) || 0,
                floorId: Number(sp.floorId) || dp.floorId
              };
            }
            return dp;
          });
          set({ pots: mergedPots });
        }
      } catch (err) {
        console.error("⚠️ Failed to load pots from DB:", err);
        set({ pots: generateInitialPots() });
      }
    } catch (err) {
      console.error("❌ fetchUserData failed:", err);
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
        userId: data.id || 0,
        userName: data.username || "",
        fullName: data.full_name || data.fullName || "",
        dob: data.dob || "",
        userRole: data.role || "farmer",
        coins: Number(data.coins) || 0,
        level: Number(data.level) || 1,
        exp: Number(data.exp) || 0,
        seeds: Number(data.seeds ?? 2),
        avatarUrl: data.avatar_url || "",
        coverUrl: data.cover_url || "",
        bio: data.bio || "",
        location: data.location || get().t('common.not_updated'),
        createdAt: data.created_at || "",
        userStats: data.stats || { tasksCompleted: 0, redemptions: 0 }
      });
      
      // Load detailed garden and stats
      await get().fetchUserData(data.id);

      get().fetchRedemptions();
      get().fetchSubmissions();
      get().registerPushToken();
      return data;
    } catch (error: any) {
      console.error("login failed:", error);
      get().showToast(error.message || get().t('auth.login_failed'), 'error');
      return false;
    }
  },

  buyItem: async (itemId, price, shippingData?: any) => {
    const { userId, coins } = get();
    if (!userId || coins < price) return false;
    try {
      const data: any = await shopService.buyItem(userId, itemId, price, shippingData);
      get().showToast(data.message || get().t('shop.redeem_success'), 'success');
      
      // Update coins from response if available, else deduct locally
      const newCoins = data.remainingCoins !== undefined ? data.remainingCoins : (get().coins - price);
      set({ coins: newCoins });
      
      get().fetchRedemptions();
      return data;
    } catch (error: any) {
      console.error("Buy item error:", error);
      get().showToast(error.message || get().t('shop.redeem_error'), 'error');
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
          title: String(get().t('notifications.plant_ready_title')),
          body: String(get().t('notifications.plant_ready_body')),
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
        get().showToast(get().t('profile.toast_saved'), 'success');
        return updatedData;
      }
      return false;
    } catch (error: any) {
      console.error("Update profile error:", error);
      get().showToast(error.message || get().t('profile.toast_save_failed'), 'error');
      return false;
    }
  },

  logout: () => {
    set({
      userId: 0,
      userName: "",
      fullName: "",
      dob: "",
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

  changePotSkin: (potId, skinId) => {
    set((state) => ({
      pots: state.pots.map(p => p.id === potId ? { ...p, skinId } : p)
    }));
    get().syncGarden();
  },
}));

export { useGameStore };

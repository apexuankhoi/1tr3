import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { translations, Language } from "../translations";
import { userService, shopService, gardenService, pushService, taskService } from "../services/api";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Detect Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// ── Push Notification Config ──────────────────────────────────────────────────
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldFlashScreen: false,
    }),
  });
} catch (e) {
  console.log('[Push] Notification handler setup failed');
}

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
  t: (path: string, params?: Record<string, any>) => string;

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
  buyItem: (itemId: number, price: number) => Promise<boolean>;
  buySeed: (price: number) => boolean;
  setRole: (role: 'farmer' | 'buyer' | 'moderator' | 'admin') => void;
  toast: { message: string; type: 'error' | 'success' } | null;
  shakeTrigger: number;
  setToast: (toast: { message: string; type: 'error' | 'success' } | null) => void;
  showToast: (message: string, type?: 'error' | 'success') => void;
  login: (credentials: any) => Promise<boolean>;
  redemptions: any[];
  fetchRedemptions: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  registerPushToken: () => Promise<void>;
  scheduleWaterReminder: () => Promise<void>;
  updateProfile: (data: { fullName?: string; email?: string; avatarUrl?: string; coverUrl?: string; bio?: string; location?: string }) => Promise<void>;
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

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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
        const { language } = get();
        const keys = path.split('.');
        let result: any = (translations as any)[language];
        for (const key of keys) {
          if (result && result[key]) {
            result = result[key];
          } else {
            return path;
          }
        }
        if (typeof result === 'string' && params) {
          Object.keys(params).forEach(pKey => {
            result = result.replace(`{${pKey}}`, params[pKey]);
          });
        }
        return typeof result === 'string' ? result : path;
      },

      hasSeenTutorial: false,
      setHasSeenTutorial: (val) => set({ hasSeenTutorial: val }),

      toast: null,
      shakeTrigger: 0,
      setToast: (toast) => set({ toast }),
      showToast: (message, type = 'error') => {
        set({ 
          toast: { message, type },
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
          const data = await userService.getUserInfo(userId);
          set({
            userId: data.id,
            userName: data.username,
            fullName: data.full_name || data.fullName || data.username,
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

          try {
            const savedPots = await gardenService.loadPots(userId);
            if (savedPots && savedPots.length > 0) {
              const pots: PotData[] = savedPots.map((p: any) => ({
                id: p.pot_id,
                floorId: p.floor_id,
                hasPlant: !!p.has_plant,
                waterLevel: p.water_level,
                fertilizerLevel: p.fertilizer_level,
                growthStage: p.growth_stage,
                growingUntil: Number(p.growing_until) || 0,
              }));
              set({ pots });
            }
          } catch (error) {
            console.error("Lỗi load khu vườn:", error);
          }

        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
      },

      fetchRedemptions: async () => {
        const { userId } = get();
        if (!userId) return;
        try {
          const data = await shopService.getRedemptions(userId);
          set({ redemptions: data || [] });
        } catch (error) {
          console.error("Lỗi lấy danh sách đổi thưởng:", error);
        }
      },

      fetchSubmissions: async () => {
        const { userId } = get();
        if (!userId) return;
        try {
          const data = await taskService.getUserSubmissions(userId);
          set({ submissions: data || [] });
        } catch (error) {
          console.error("Lỗi lấy danh sách nhiệm vụ đã nộp:", error);
        }
      },

      setRole: (role) => set({ userRole: role }),

      login: async (credentials) => {
        try {
          const data = await userService.login(credentials);
          set({
            userId: data.id,
            userName: data.username,
            fullName: data.full_name || data.fullName || data.username,
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

          try {
            const savedPots = await gardenService.loadPots(data.id);
            if (savedPots && savedPots.length > 0) {
              const pots: PotData[] = savedPots.map((p: any) => ({
                id: p.pot_id,
                floorId: p.floor_id,
                hasPlant: !!p.has_plant,
                waterLevel: p.water_level,
                fertilizerLevel: p.fertilizer_level,
                growthStage: p.growth_stage,
                growingUntil: Number(p.growing_until) || 0,
              }));
              set({ pots });
            }
          } catch (error) {
            console.error("Lỗi load khu vườn khi đăng nhập:", error);
          }

          get().fetchRedemptions();
          get().fetchSubmissions();
          get().registerPushToken();
          return true;
        } catch (error) {
          console.error("Lỗi đăng nhập:", error);
          return false;
        }
      },

      buyItem: async (itemId, price) => {
        try {
          const response = await shopService.buyItem(get().userId || 1, itemId, price);
          if (response.message === "Purchase successful") {
            set((state) => ({ coins: response.remainingCoins }));
            get().fetchRedemptions();
            get().syncStats();
            return response;
          }
          return false;
        } catch (error) {
          console.error("Lỗi khi mua vật phẩm:", error);
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

          const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.projectId;
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
        if (!userId) return;
        try {
          await userService.updateProfile(userId, data);
          set((state) => ({
            fullName: data.fullName ?? state.fullName,
            avatarUrl: data.avatarUrl ?? state.avatarUrl,
            coverUrl: data.coverUrl ?? state.coverUrl,
            bio: data.bio ?? state.bio,
            location: data.location ?? state.location,
          }));
          get().showToast("Cập nhật trang cá nhân thành công!", 'success');
        } catch (error) {
          console.error("Lỗi cập nhật profile:", error);
          get().showToast("Lỗi khi cập nhật trang cá nhân.", 'error');
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
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

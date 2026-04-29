import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];

const BASE_URL_RAW =
  process.env.EXPO_PUBLIC_API_URL ||
  (expoHost ? `http://${expoHost}:3000/api` : Platform.OS === "android" ? "http://10.0.2.2:3000/api" : "http://localhost:3000/api");

const BASE_URL = BASE_URL_RAW.endsWith("/") ? BASE_URL_RAW : `${BASE_URL_RAW}/`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// ── Standardized Response Interceptor ──
api.interceptors.response.use(
  (response) => {
    // If the backend uses the { success, data, message } format
    if (response.data && typeof response.data.success === 'boolean') {
      if (response.data.success) {
        // Return only the inner data to the caller
        return response.data.data;
      } else {
        // Reject with the backend message
        const errorMsg = response.data.message || 'Lỗi hệ thống';
        return Promise.reject(new Error(errorMsg));
      }
    }
    // Fallback for non-standardized responses
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Lỗi kết nối server';
    console.error("🌐 [API Error]:", message);
    return Promise.reject(new Error(message));
  }
);

console.log("🚀 App đang kết nối đến API tại:", BASE_URL);

export const uploadImage = async (uri: string) => {
  const formData = new FormData();
  const filename = uri.split("/").pop();
  const type = `image/${uri.split(".").pop() || "jpeg"}`;

  formData.append("image", {
    uri: uri,
    name: filename || "upload.jpg",
    type: type,
  } as any);

  const uploadUrl = `${BASE_URL}upload`;
  console.log("📤 Uploading via fetch to:", uploadUrl);
  
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
    headers: {
      "Accept": "application/json",
      // Note: Do NOT set Content-Type, fetch will set it with boundary
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.url;
};

export const userService = {
  register: async (userData: any) => {
    return await api.post("auth/register", userData);
  },
  login: async (credentials: any) => {
    return await api.post("auth/login", credentials);
  },
  getUserInfo: async (userId: number) => {
    return await api.get(`user/${userId}`);
  },
  updateCoins: async (userId: number, amount: number) => {
    return await api.post(`/user/${userId}/coins`, { amount });
  },
  updateStats: async (userId: number, stats: { coins: number; seeds?: number; waterLevel?: number; energyLevel?: number; growthStage?: string }) => {
    return await api.patch(`stats/${userId}`, stats);
  },
  updateLocation: async (userId: number, lat: number, lng: number) => {
    return await api.patch(`location/${userId}`, { lat, lng });
  },
  updateProfile: async (userId: number, data: { fullName?: string; email?: string; avatarUrl?: string; coverUrl?: string; bio?: string; location?: string }) => {
    return await api.patch(`user/profile/${userId}`, data);
  },
  getProfile: () => api.get('/user/profile'),
};

export const shopService = {
  getShopItems: async () => {
    return await api.get("shop");
  },
  buyItem: async (userId: number, itemId: number, price: number, shippingData?: any) => {
    return await api.post("shop/buy", { userId, itemId, price, ...shippingData });
  },
  getRedemptions: async (userId: number) => {
    return await api.get(`redemptions/${userId}`);
  },
  getInventory: async (userId: number) => {
    return await api.get(`inventory/${userId}`);
  },
};

export const communityService = {
  getCommunityData: async () => {
    return await api.get("community/data");
  },
  getRankings: async (type: 'individual' | 'village' = 'individual') => {
    return await api.get("rankings", { params: { type } });
  },
};

export const taskService = {
  getTasks: async () => {
    return await api.get("tasks");
  },
  getWeeklyTasks: async (userId: number) => {
    return await api.get(`tasks/weekly/${userId}`);
  },
  getUserSubmissions: async (userId: number) => {
    return await api.get(`tasks/submissions/${userId}`);
  },
  submitTask: async (userId: number, taskId: number, imageUrl: string) => {
    return await api.post("tasks/submit", { userId, taskId, imageUrl });
  },
  getQuizQuestions: async () => {
    return await api.get("quiz/questions");
  },
};

export const libraryService = {
  getLibrary: async () => {
    return await api.get("library");
  },
  getPrices: async () => {
    return await api.get("prices");
  },
};

export const adminService = {
  getStats: async () => {
    return await api.get("admin/stats");
  },
  saveTask: async (task: any) => {
    return await api.post("admin/tasks", task);
  },
  saveLibrary: async (item: any) => {
    return await api.post("admin/library", item);
  },
  saveShop: async (data: any) => {
    return await api.post("admin/shop", data);
  },
  getStocks: async () => {
    return await api.get("admin/stock");
  },
  updateStock: async (itemId: number, quantity: number) => {
    return await api.post("admin/stock", { itemId, quantity });
  },
  deleteItem: async (type: "library" | "tasks" | "shop", id: number) => {
    return await api.delete(`admin/${type}/${id}`);
  },
  getPendingSubmissions: async () => {
    return await api.get("admin/submissions");
  },
  approveSubmission: async (submissionId: number) => {
    return await api.post("admin/approve", { submissionId });
  },
  rejectSubmission: async (submissionId: number) => {
    return await api.post("admin/reject", { submissionId });
  },
  // New Admin Methods
  getUsers: async () => {
    return await api.get("admin/users");
  },
  updateUser: async (userId: number, data: any) => {
    return await api.patch(`admin/user/${userId}`, data);
  },
  getUserInventory: async (userId: number) => {
    return await api.get(`admin/user/${userId}/inventory`);
  },
  deleteInventoryItem: async (inventoryId: number) => {
    return await api.delete(`admin/inventory/${inventoryId}`);
  },
  addInventoryItem: async (userId: number, itemId: number) => {
    return await api.post("admin/inventory/add", { userId, itemId });
  },
  // Redemption Management
  getAdminRedemptions: async () => {
    return await api.get("admin/redemptions");
  },
  updateRedemptionStatus: async (id: number, status: string) => {
    return await api.patch(`admin/redemption/${id}`, { status });
  },
};

// ── Garden Pot Sync Service ──────────────────────────────────────────────────
export const gardenService = {
  loadPots: async (userId: number) => {
    return await api.get(`garden/${userId}/pots`);
  },
  savePots: async (userId: number, pots: any[], seeds: number) => {
    return await api.put(`garden/${userId}/pots`, { pots, seeds });
  },
};

// ── Push Notification Service ────────────────────────────────────────────────
export const pushService = {
  registerToken: async (userId: number, token: string, platform: string) => {
    return await api.post("push/register", { userId, token, platform });
  },
};

export default api;

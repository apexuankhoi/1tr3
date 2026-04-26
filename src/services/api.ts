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
  timeout: 10000,
});

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
    const response = await api.post("auth/register", userData);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await api.post("auth/login", credentials);
    return response.data;
  },
  getUserInfo: async (userId: number) => {
    const response = await api.get(`user/${userId}`);
    return response.data;
  },
  updateCoins: async (userId: number, amount: number) => {
    const response = await api.post(`/user/${userId}/coins`, { amount });
    return response.data;
  },
  updateStats: async (userId: number, stats: { coins: number; seeds?: number; waterLevel?: number; energyLevel?: number; growthStage?: string }) => {
    const response = await api.patch(`stats/${userId}`, stats);
    return response.data;
  },
  updateLocation: async (userId: number, lat: number, lng: number) => {
    const response = await api.patch(`location/${userId}`, { lat, lng });
    return response.data;
  },
  updateProfile: async (userId: number, data: { fullName?: string; email?: string; avatarUrl?: string; coverUrl?: string; bio?: string; location?: string }) => {
    const response = await api.patch(`user/profile/${userId}`, data);
    return response.data;
  },
};

export const shopService = {
  getShopItems: async () => {
    const response = await api.get("shop");
    return response.data;
  },
  buyItem: async (userId: number, itemId: number, price: number) => {
    const response = await api.post("shop/buy", { userId, itemId, price });
    return response.data;
  },
  getRedemptions: async (userId: number) => {
    const response = await api.get(`redemptions/${userId}`);
    return response.data;
  },
};

export const taskService = {
  getTasks: async () => {
    const response = await api.get("tasks");
    return response.data;
  },
  getWeeklyTasks: async (userId: number) => {
    const response = await api.get(`tasks/weekly/${userId}`);
    return response.data; // { weekNum, tasks }
  },
  getUserSubmissions: async (userId: number) => {
    const response = await api.get(`tasks/submissions/${userId}`);
    return response.data;
  },
  submitTask: async (userId: number, taskId: number, imageUrl: string) => {
    const response = await api.post("tasks/submit", { userId, taskId, imageUrl });
    return response.data;
  },
};

export const libraryService = {
  getLibrary: async () => {
    const response = await api.get("library");
    return response.data;
  },
};

export const adminService = {
  getStats: async () => {
    const response = await api.get("admin/stats");
    return response.data;
  },
  saveTask: async (task: any) => {
    const response = await api.post("admin/tasks", task);
    return response.data;
  },
  saveLibrary: async (item: any) => {
    const response = await api.post("admin/library", item);
    return response.data;
  },
  saveShop: async (data: any) => {
    const response = await api.post("admin/shop", data);
    return response.data;
  },
  getStock: async () => {
    const response = await api.get("admin/stock");
    return response.data;
  },
  updateStock: async (itemId: number, quantity: number) => {
    const response = await api.post("admin/stock", { itemId, quantity });
    return response.data;
  },
  deleteItem: async (type: "library" | "tasks" | "shop", id: number) => {
    const response = await api.delete(`admin/${type}/${id}`);
    return response.data;
  },
  getPendingSubmissions: async () => {
    const response = await api.get("admin/submissions");
    return response.data;
  },
  approveSubmission: async (submissionId: number) => {
    const response = await api.post("admin/approve", { submissionId });
    return response.data;
  },
  rejectSubmission: async (submissionId: number) => {
    const response = await api.post("admin/reject", { submissionId });
    return response.data;
  },
};

// ── Garden Pot Sync Service ──────────────────────────────────────────────────
export const gardenService = {
  loadPots: async (userId: number) => {
    const response = await api.get(`garden/${userId}/pots`);
    return response.data; // Array of pot data from DB
  },
  savePots: async (userId: number, pots: any[], seeds: number) => {
    const response = await api.put(`garden/${userId}/pots`, { pots, seeds });
    return response.data;
  },
};

// ── Push Notification Service ────────────────────────────────────────────────
export const pushService = {
  registerToken: async (userId: number, token: string, platform: string) => {
    const response = await api.post("push/register", { userId, token, platform });
    return response.data;
  },
};

export default api;

import React from "react";
import { Route } from "react-router-dom";
import { App, ZMPRouter, AnimationRoutes, SnackbarProvider, Icon, Box, Text, useNavigate, useLocation } from "zmp-ui";
import { useGameStore } from "@/store/useGameStore";

// User Pages
import HomePage from "@/pages/index";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import RegisterInfoPage from "@/pages/register-info";
import TasksPage from "@/pages/tasks";
import ShopPage from "@/pages/shop";
import RankingPage from "@/pages/ranking";
import ProfilePage from "@/pages/profile";
import LibraryPage from "@/pages/library";
import CommunityPage from "@/pages/community";

// Interactive Pages
import QuizPage from "@/pages/quiz";
import ReportPage from "@/pages/report";
import CameraPage from "@/pages/camera";
import QRScannerPage from "@/pages/qr-scanner";
import MapPage from "@/pages/map";

// Admin Pages
import AdminDashboardPage from "@/pages/admin-dashboard";
import AdminTasksPage from "@/pages/admin-tasks";
import AdminLibraryPage from "@/pages/admin-library";
import AdminShopPage from "@/pages/admin-shop";
import AdminUsersPage from "@/pages/admin-users";

// Moderator Page
import ModeratorDashboardPage from "@/pages/moderator-dashboard";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;
  const userRole = useGameStore((state) => state.userRole);
  const userId = useGameStore((state) => state.userId);

  // Hide BottomNav on auth and modal pages
  const hiddenPaths = ["/login", "/register", "/register-info", "/camera", "/qr-scanner"];
  if (hiddenPaths.includes(activePath) || !userId) return null;

  // Define nav items based on user role
  let navItems: Array<{ path: string; label: string; icon: string }> = [];

  if (userRole === 'admin') {
    navItems = [
      { path: "/admin-dashboard", label: "Dashboard", icon: "zi-chart" },
      { path: "/admin-tasks", label: "Nhiệm vụ", icon: "zi-list-1" },
      { path: "/admin-library", label: "Thư viện", icon: "zi-book" },
      { path: "/admin-shop", label: "Cửa hàng", icon: "zi-bag" },
      { path: "/admin-users", label: "Người dùng", icon: "zi-user" },
    ];
  } else if (userRole === 'moderator') {
    navItems = [
      { path: "/moderator-dashboard", label: "Duyệt", icon: "zi-check" },
      { path: "/qr-scanner", label: "QR", icon: "zi-qrcode" },
      { path: "/ranking", label: "Xếp hạng", icon: "zi-star" },
      { path: "/profile", label: "Tôi", icon: "zi-user" },
    ];
  } else {
    // Farmer/default role
    navItems = [
      { path: "/", label: "Vườn", icon: "zi-home" },
      { path: "/tasks", label: "Nhiệm vụ", icon: "zi-list-1" },
      { path: "/shop", label: "Cửa hàng", icon: "zi-bag" },
      { path: "/ranking", label: "Xếp hạng", icon: "zi-star" },
      { path: "/profile", label: "Tôi", icon: "zi-user" },
    ];
  }

  return (
    <Box className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center px-2 z-[1000] shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = activePath === item.path;
        return (
          <Box 
            key={item.path}
            className={`flex flex-col items-center justify-center flex-1 transition-all duration-300 cursor-pointer ${isActive ? 'text-green-800 scale-110' : 'text-gray-400'}`}
            onClick={() => navigate(item.path)}
          >
            <Icon icon={item.icon as any} className={isActive ? "text-green-800" : "text-gray-400"} />
            <Text className={`text-[10px] mt-0.5 font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </Text>
            {isActive && <Box className="w-1 h-1 bg-green-800 rounded-full mt-1 animate-pulse" />}
          </Box>
        );
      })}
    </Box>
  );
};

const Layout = () => {
  return (
    <App>
      <SnackbarProvider>
        <ZMPRouter>
          <AnimationRoutes>
            {/* Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-info" element={<RegisterInfoPage />} />

            {/* User Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/community" element={<CommunityPage />} />

            {/* Interactive Pages */}
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/qr-scanner" element={<QRScannerPage />} />
            <Route path="/map" element={<MapPage />} />

            {/* Admin Pages */}
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin-tasks" element={<AdminTasksPage />} />
            <Route path="/admin-library" element={<AdminLibraryPage />} />
            <Route path="/admin-shop" element={<AdminShopPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />

            {/* Moderator Pages */}
            <Route path="/moderator-dashboard" element={<ModeratorDashboardPage />} />
          </AnimationRoutes>
          <BottomNav />
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};

export default Layout;

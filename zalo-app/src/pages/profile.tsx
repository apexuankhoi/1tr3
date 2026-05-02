import React, { useState, useEffect } from "react";
import { Page, Box, Text, Icon, Button, Avatar, Tabs, Spinner, Modal, Input } from "zmp-ui";
import { useGameStore } from "@/store/useGameStore";

const ProfilePage = () => {
  const { 
    userId, fullName, userName, coins, level, exp, avatarUrl, coverUrl, bio, location, createdAt,
    redemptions, fetchRedemptions, submissions, fetchSubmissions, userStats, updateProfile, 
    language, setLanguage, t, logout
  } = useGameStore();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ fullName, bio, location });

  const role = useGameStore(s => s.role);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRedemptions();
    fetchSubmissions();
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white pb-24">
      {/* Cover & Avatar */}
      <Box className="relative">
        <Box className="h-40 bg-green-900 overflow-hidden">
            <img src={coverUrl || "https://res.cloudinary.com/dnxuaugmx/image/upload/v1777456006/nongnghiepxanh/sky_bg.png"} className="w-full h-full object-cover opacity-60" />
        </Box>
        <Box className="px-4 -mt-12 flex items-end justify-between">
            <Box className="relative">
                <Avatar src={avatarUrl} size={90} className="border-4 border-white shadow-lg bg-gray-200" />
                <Box className="absolute bottom-0 right-0 bg-green-800 p-1.5 rounded-full border-2 border-white">
                    <Icon icon="zi-camera" className="text-white" size={14} />
                </Box>
            </Box>
            <Box className="flex space-x-2 mb-2">
                <Button size="small" variant="secondary" className="rounded-full px-4 h-9 font-bold border-gray-200" onClick={() => setIsEditing(true)}>Sửa hồ sơ</Button>
                <Button size="small" variant="secondary" className="rounded-full w-9 h-9 flex items-center justify-center border-gray-200 p-0"><Icon icon="zi-share-external" size={20} /></Button>
            </Box>
        </Box>
      </Box>

      {/* User Info */}
      <Box className="px-4 mt-4">
        <Box className="flex items-center space-x-1">
            <Text className="text-2xl font-black text-gray-800">{fullName || "Người dùng"}</Text>
            <Icon icon="zi-check-circle-solid" className="text-blue-600" size={20} />
        </Box>
        <Text className="text-gray-400 font-bold text-sm">@{userName || "nongdan"} • {role?.toUpperCase()}</Text>
        
        <Box className="flex items-center space-x-3 mt-2">
            <Box className="bg-green-800 text-white px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">Level {level}</Box>
            <Text className="text-[10px] font-bold text-gray-400">{exp} / {level * 100} EXP</Text>
        </Box>

        {bio && <Text className="mt-4 text-sm text-gray-600 leading-relaxed font-medium">{bio}</Text>}

        <Box className="flex space-x-6 mt-4 pt-4 border-t border-gray-50">
            <Box className="flex items-center space-x-1">
                <Icon icon="zi-location" className="text-gray-400" size={16} />
                <Text className="text-xs text-gray-500 font-bold">{location || "Chưa cập nhật"}</Text>
            </Box>
            <Box className="flex items-center space-x-1">
                <Icon icon="zi-calendar" className="text-gray-400" size={16} />
                <Text className="text-xs text-gray-500 font-bold">Tham gia {new Date(createdAt || Date.now()).toLocaleDateString('vi-VN')}</Text>
            </Box>
        </Box>

        <Box className="flex space-x-8 mt-6">
            <Box>
                <Text className="text-lg font-black text-gray-800">{userStats?.tasksCompleted || 0}</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase">Nhiệm vụ</Text>
            </Box>
            <Box>
                <Text className="text-lg font-black text-gray-800">{coins}</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase">Xu tích lũy</Text>
            </Box>
            <Box>
                <Text className="text-lg font-black text-gray-800">12</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase">Huy hiệu</Text>
            </Box>
        </Box>
      </Box>

      {/* Admin/Moderator Links */}
      {(role === 'admin' || role === 'moderator') && (
        <Box className="px-4 mt-6 space-y-2">
            <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Quản trị viên</Text>
            {role === 'admin' && (
                <Button fullWidth variant="secondary" className="justify-start px-4 h-12 rounded-2xl bg-orange-50 border-orange-100 flex items-center space-x-3 text-orange-800" onClick={() => navigate("/admin-dashboard")}>
                    <Icon icon="zi-setting" />
                    <Text className="text-sm font-bold">Bảng điều khiển Admin</Text>
                </Button>
            )}
            <Button fullWidth variant="secondary" className="justify-start px-4 h-12 rounded-2xl bg-blue-50 border-blue-100 flex items-center space-x-3 text-blue-800" onClick={() => navigate("/moderator-dashboard")}>
                <Icon icon="zi-check-circle" />
                <Text className="text-sm font-bold">Duyệt bài (Moderator)</Text>
            </Button>
        </Box>
      )}

      {/* Tabs */}
      <Box className="mt-6 border-t-8 border-gray-50">
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
            <Tabs.Tab key="tasks" label="Hoạt động" />
            <Tabs.Tab key="rewards" label="Quà của tôi" />
            <Tabs.Tab key="badges" label="Huy hiệu" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box className="p-4">
        {activeTab === 'tasks' ? (
            <Box className="space-y-4">
                {(submissions?.length || 0) > 0 ? submissions.map((sub, idx) => (
                    <Box key={idx} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm">
                        <Box className={`w-10 h-10 rounded-xl flex items-center justify-center ${sub.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            <Icon icon={sub.status === 'approved' ? 'zi-check' : 'zi-clock-2'} />
                        </Box>
                        <Box className="flex-1">
                            <Text className="font-bold text-sm" numberOfLines={1}>{sub.title}</Text>
                            <Box className="flex justify-between items-center mt-1">
                                <Text className="text-[10px] text-gray-400">{new Date(sub.submitted_at).toLocaleDateString('vi-VN')}</Text>
                                <Text className={`text-[10px] font-black ${sub.status === 'approved' ? 'text-green-700' : 'text-orange-700'}`}>
                                    {sub.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                )) : <Text className="text-center py-10 opacity-30">Chưa có hoạt động nào</Text>}
            </Box>
        ) : activeTab === 'rewards' ? (
            <Box className="grid grid-cols-3 gap-3">
                {(redemptions?.length || 0) > 0 ? redemptions.map((red, i) => (
                    <Box key={i} className="flex flex-col items-center">
                        <Box className="w-full h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-2">
                            <img src={red.image_url} className="w-full h-full object-cover" />
                        </Box>
                        <Text className="text-[10px] font-bold text-center" numberOfLines={1}>{red.name}</Text>
                    </Box>
                )) : <Text className="text-center py-10 opacity-30 col-span-3">Chưa có quà nào</Text>}
            </Box>
        ) : (
            <Box className="grid grid-cols-4 gap-4 py-4">
                {[1,2,3,4,5].map(b => (
                    <Box key={b} className="flex flex-col items-center opacity-20 grayscale">
                        <Box className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <Icon icon="zi-lock" size={24} />
                        </Box>
                        <Text className="text-[8px] font-bold">LOCKED</Text>
                    </Box>
                ))}
            </Box>
        )}
      </Box>

      {/* Settings & Logout */}
      <Box className="px-4 space-y-3 mt-4 border-t pt-6">
        <Button fullWidth variant="secondary" className="justify-start px-4 h-12 rounded-2xl border-gray-100 flex items-center space-x-3">
            <Icon icon="zi-help" className="text-gray-400" />
            <Text className="text-sm font-bold text-gray-700">Trung tâm trợ giúp</Text>
        </Button>
        <Button 
            fullWidth 
            variant="secondary" 
            className="justify-start px-4 h-12 rounded-2xl border-red-50 flex items-center space-x-3 text-red-600"
            onClick={() => logout()}
        >
            <Icon icon="zi-delete" />
            <Text className="text-sm font-bold">Đăng xuất</Text>
        </Button>
      </Box>

      {/* Edit Modal */}
      <Modal visible={isEditing} title="Sửa hồ sơ" onClose={() => setIsEditing(false)} verticalActions>
        <Box className="space-y-4 pt-4">
            <Input label="Họ và tên" value={editData.fullName} onChange={(e) => setEditData({...editData, fullName: e.target.value})} />
            <Input label="Tiểu sử" value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} />
            <Input label="Địa chỉ" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} />
            <Button fullWidth className="bg-green-800 h-12 rounded-xl font-bold mt-4" onClick={handleSave} loading={loading}>Lưu thay đổi</Button>
        </Box>
      </Modal>
    </Page>
  );
};

export default ProfilePage;

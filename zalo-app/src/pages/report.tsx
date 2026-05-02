import React, { useState, useEffect } from "react";
import { Page, Box, Text, Icon, Button, Spinner, useLocation, useNavigate } from "zmp-ui";
import { useGameStore } from "@/store/useGameStore";
import { taskService } from "@/services/api";

const ReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, t } = useGameStore();

  const taskId = location.state?.taskId ?? 1;
  const taskTitle = location.state?.taskTitle ?? "Báo cáo";
  const taskReward = location.state?.taskReward ?? 60;
  const needsGps = location.state?.needsGps ?? false;

  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handlePickPhoto = () => {
    // In Zalo Mini App, we use api.chooseImage
    (window as any).zmp.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: (res: any) => {
        setPhoto(res.tempFiles[0].path);
      }
    });
  };

  const handleGetLocation = () => {
    setGpsLoading(true);
    (window as any).zmp.getLocation({
      success: (res: any) => {
        setGpsData({
          lat: res.latitude,
          lng: res.longitude,
          address: "Vị trí đã được ghi nhận"
        });
      },
      fail: (err: any) => {
          console.error(err);
          alert("Không thể lấy vị trí. Vui lòng bật GPS.");
      },
      complete: () => setGpsLoading(false)
    });
  };

  const handleSubmit = async () => {
    if (!photo) return alert("Vui lòng chụp ảnh minh chứng");
    if (needsGps && !gpsData) return alert("Vui lòng xác nhận vị trí");

    setLoading(true);
    try {
      // Mocking submission for now
      await taskService.submitTask(userId, taskId, "photo-evidence");
      alert("Nộp báo cáo thành công! Đang chờ duyệt.");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi nộp báo cáo");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Page className="bg-gray-50 pb-10">
      <Box className="bg-green-700 pt-12 pb-6 px-4 text-white rounded-b-[32px] shadow-lg">
        <Box className="flex items-center space-x-2 opacity-70">
            <Icon icon="zi-camera" size={16} />
            <Text className="text-xs font-bold uppercase tracking-wider">Báo cáo hoạt động</Text>
        </Box>
        <Text className="text-xl font-black mt-1 leading-tight">{taskTitle}</Text>
        <Box className="mt-4 bg-white/20 px-3 py-1 rounded-full inline-block">
            <Text className="text-xs font-bold">Thưởng: {taskReward} ⭐</Text>
        </Box>
      </Box>

      <Box className="p-4 space-y-6">
        {/* Description */}
        <Box className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <Text className="text-sm font-medium text-gray-600 leading-relaxed">
                {location.state?.taskDesc || "Hãy chụp ảnh minh chứng cho hành động xanh của bạn và gửi cho chúng tôi để nhận thưởng."}
            </Text>
        </Box>

        {/* GPS Section */}
        {needsGps && (
            <Box className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <Text className="font-black text-gray-800 mb-4 flex items-center space-x-2">
                    <Icon icon="zi-location" className="text-red-600" />
                    <span>Xác nhận vị trí</span>
                </Text>
                {gpsData ? (
                    <Box className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center justify-between">
                        <Box>
                            <Text className="text-green-800 font-bold text-sm">Vị trí đã khớp</Text>
                            <Text className="text-[10px] text-green-600">{gpsData.lat.toFixed(4)}, {gpsData.lng.toFixed(4)}</Text>
                        </Box>
                        <Button size="small" variant="secondary" onClick={handleGetLocation}>Thử lại</Button>
                    </Box>
                ) : (
                    <Button fullWidth variant="secondary" className="h-12 border-dashed border-2 rounded-2xl" onClick={handleGetLocation} loading={gpsLoading}>
                        Nhấn để lấy tọa độ GPS
                    </Button>
                )}
            </Box>
        )}

        {/* Photo Section */}
        <Box className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <Text className="font-black text-gray-800 mb-4 flex items-center space-x-2">
                <Icon icon="zi-plus-circle" className="text-green-700" />
                <span>Ảnh minh chứng</span>
            </Text>
            {photo ? (
                <Box className="relative rounded-2xl overflow-hidden h-48">
                    <img src={photo} className="w-full h-full object-cover" />
                    <Box className="absolute top-2 right-2 bg-black/50 p-1 rounded-full" onClick={() => setPhoto(null)}>
                        <Icon icon="zi-close" className="text-white" size={16} />
                    </Box>
                    <Box className="absolute bottom-2 right-2 bg-green-800 text-white px-3 py-1 rounded-full text-[10px] font-bold" onClick={handlePickPhoto}>Chụp lại</Box>
                </Box>
            ) : (
                <Box 
                    className="h-48 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-gray-50"
                    onClick={handlePickPhoto}
                >
                    <Icon icon="zi-camera" size={40} className="text-gray-300 mb-2" />
                    <Text className="text-xs font-bold text-gray-400 text-center px-6">Bấm vào đây để chụp ảnh hoặc chọn từ thư viện</Text>
                </Box>
            )}
        </Box>

        <Box className="pt-4">
            <Button fullWidth className="bg-green-800 h-14 rounded-2xl font-black shadow-lg" onClick={handleSubmit} loading={loading}>
                Nộp báo cáo
            </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default ReportPage;

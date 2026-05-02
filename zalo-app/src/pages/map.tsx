import React, { useEffect, useState } from "react";
import { Page, Box, Text, Icon, Spinner, useNavigate } from "zmp-ui";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGameStore } from "@/store/useGameStore";
import { communityService } from "@/services/api";

// Fix leaflet icon issue in Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  const navigate = useNavigate();
  const { t } = useGameStore();
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const res: any = await communityService.getCommunityData();
      setMapData(res || { users: [], pois: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box className="flex justify-center items-center h-screen"><Spinner /></Box>;

  return (
    <Page className="relative h-screen">
      {/* Overlay Header */}
      <Box className="absolute top-12 left-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl flex items-center space-x-3 border border-white/50">
        <Box className="bg-gray-100 p-2 rounded-xl" onClick={() => navigate(-1)}>
            <Icon icon="zi-chevron-left" />
        </Box>
        <Box className="flex-1">
            <Text className="text-lg font-black text-green-900 leading-none">Bản đồ cộng đồng</Text>
            <Text className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                {mapData?.users?.filter((u: any) => u.isOnline).length || 0} nông dân đang online
            </Text>
        </Box>
        <Box className="bg-green-100 p-2 rounded-xl text-green-800">
            <Icon icon="zi-location" />
        </Box>
      </Box>

      {/* Map Container */}
      <Box className="h-full w-full z-0">
        <MapContainer 
            center={[12.6667, 108.0500]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            {mapData?.users?.map((user: any) => (
                user.lat && user.lng && (
                    <Marker key={user.id} position={[user.lat, user.lng]}>
                        <Popup>
                            <Box className="p-2 min-w-[120px]">
                                <Text className="font-black text-sm">{user.full_name || user.username}</Text>
                                <Text className="text-[10px] text-gray-400">Cấp độ {user.level || 1}</Text>
                            </Box>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
      </Box>

      {/* Legend */}
      <Box className="absolute bottom-24 right-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/50 space-y-2">
        <Box className="flex items-center space-x-2">
            <Box className="w-3 h-3 bg-blue-600 rounded-full" />
            <Text className="text-[10px] font-bold text-gray-600">Nông dân</Text>
        </Box>
        <Box className="flex items-center space-x-2">
            <Box className="w-3 h-3 bg-red-600 rounded-full" />
            <Text className="text-[10px] font-bold text-gray-600">Điểm xanh</Text>
        </Box>
      </Box>
    </Page>
  );
};

export default MapPage;

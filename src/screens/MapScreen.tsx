import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState<any>(null);

  const fetchMapData = async () => {
    try {
      const data = await api.get("/map/data");
      setMapData(data || { users: [], pois: [] });
      if (webViewRef.current && data) {
        const script = `updateMap(${JSON.stringify(data)})`;
        webViewRef.current.injectJavaScript(script);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu bản đồ:", err);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 10000); // Tự động cập nhật mỗi 10 giây
    return () => clearInterval(interval);
  }, []);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { height: 100%; margin: 0; padding: 0; background: #f8fafc; }
        .user-marker { background: #154212; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 0 10px rgba(21,66,18,0.4); }
        .user-marker.offline { background: #94a3b8; box-shadow: none; }
        .poi-marker { background: #f59e0b; border: 2px solid white; border-radius: 4px; width: 16px; height: 16px; transform: rotate(45deg); }
        .leaflet-popup-content-wrapper { border-radius: 12px; font-family: 'Nunito', sans-serif; }
        .popup-img { width: 100%; height: 100px; border-radius: 8px; object-fit: cover; margin-bottom: 8px; }
        .popup-title { font-weight: 800; color: #1e293b; margin: 0; font-size: 14px; }
        .popup-sub { color: #64748b; font-size: 11px; margin: 2px 0 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([12.6667, 108.0500], 13); // Buôn Ma Thuột
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var userMarkers = {};
        var poiMarkers = [];
        var hasCentered = false;

        function updateMap(data) {
          // Auto center on first user if not centered yet
          if (!hasCentered && data.users.length > 0) {
            var first = data.users.find(u => u.lat && u.lng);
            if (first) {
              map.setView([first.lat, first.lng], 13);
              hasCentered = true;
            }
          }

          // Update Users
          data.users.forEach(user => {
            var className = 'user-marker' + (user.isOnline ? '' : ' offline');
            if (userMarkers[user.id]) {
              userMarkers[user.id].setLatLng([user.lat, user.lng]);
              userMarkers[user.id].setIcon(L.divIcon({ className: className }));
            } else {
              var icon = L.divIcon({ className: className });
              userMarkers[user.id] = L.marker([user.lat, user.lng], { icon: icon })
                .addTo(map)
                .bindPopup('<b>' + user.full_name + '</b><br/>' + user.role + (user.isOnline ? ' (Online)' : ' (Ngoại tuyến)'));
            }
          });

          // Update POIs
          poiMarkers.forEach(m => map.removeLayer(m));
          poiMarkers = [];
          data.pois.forEach(poi => {
            var icon = L.divIcon({ className: 'poi-marker' });
            var m = L.marker([poi.lat, poi.lng], { icon: icon })
              .addTo(map)
              .bindPopup(\`
                <div style="width:150px">
                  <img src="\${poi.imageUrl}" class="popup-img" />
                  <p class="popup-title">\${poi.title}</p>
                  <p class="popup-sub">Địa chỉ: \${poi.address}</p>
                  <p class="popup-sub">Gửi bởi: \${poi.username}</p>
                  <p class="popup-sub">Trạng thái: \${poi.status}</p>
                </div>
              \`);
            poiMarkers.push(m);
          });
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Over Map */}
      <View style={[st.header, { top: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#154212" />
        </TouchableOpacity>
        <View style={st.titleBox}>
          <Text style={st.title}>Bản đồ Buôn Làng</Text>
          <View style={st.statusRow}>
            <View style={st.dot} />
            <Text style={st.statusText}>
              {mapData?.users?.filter((u: any) => u.isOnline).length || 0} online / {mapData?.users?.length || 0} vị trí
            </Text>
          </View>
        </View>
      </View>

      <WebView 
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        onLoadEnd={() => {
          setLoading(false);
          if (mapData) {
            webViewRef.current?.injectJavaScript(`updateMap(${JSON.stringify(mapData)})`);
          }
        }}
      />

      {loading && (
        <View style={st.loadingOverlay}>
          <ActivityIndicator size="large" color="#154212" />
        </View>
      )}

      {/* Legend */}
      <View style={[st.legend, { bottom: insets.bottom + 20 }]}>
        <View style={st.legendItem}>
          <View style={[st.legendDot, { backgroundColor: '#154212' }]} />
          <Text style={st.legendText}>Online</Text>
        </View>
        <View style={st.legendItem}>
          <View style={[st.legendDot, { backgroundColor: '#94a3b8' }]} />
          <Text style={st.legendText}>Ngoại tuyến</Text>
        </View>
        <View style={st.legendItem}>
          <View style={[st.legendDot, { backgroundColor: '#f59e0b', borderRadius: 2 }]} />
          <Text style={st.legendText}>Minh chứng</Text>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: { 
    position: 'absolute', left: 20, right: 20, zIndex: 10, 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)', padding: 12, borderRadius: 20,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  titleBox: { marginLeft: 12 },
  title: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
  statusText: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#64748b" },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  legend: { 
    position: 'absolute', right: 20, zIndex: 10, 
    backgroundColor: 'rgba(255,255,255,0.95)', padding: 12, borderRadius: 16,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#475569" },
});

import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Platform, Modal, Image } from "react-native";
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showList, setShowList] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'pois'>('users');

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
        body, html, #map { height: 100%; margin: 0; padding: 0; background: #e2e8f0; }
        .user-marker { background: #154212; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 0 10px rgba(21,66,18,0.4); }
        .user-marker.offline { background: #94a3b8; box-shadow: none; }
        .leaflet-container { background: #cbd5e1 !important; }
        /* Hiệu ứng xám bản đồ ngoài Việt Nam */
        .leaflet-tile-pane { filter: grayscale(1) opacity(0.5); }
        .vietnam-highlight { filter: grayscale(0) opacity(1) !important; z-index: 1000; }
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
        var vnBounds = L.latLngBounds([8.18, 102.14], [23.39, 109.46]);
        var map = L.map('map', { 
          zoomControl: false,
          maxBounds: vnBounds,
          maxBoundsViscosity: 1.0,
          minZoom: 5
        }).setView([12.6667, 108.0500], 13); // Buôn Ma Thuột
        
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
                .on('click', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'user_click', data: user }));
                });
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

        function focusOn(lat, lng) {
          map.flyTo([lat, lng], 16, { duration: 1.5 });
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
        <TouchableOpacity onPress={() => setShowList(!showList)} style={st.listToggle}>
          <MaterialCommunityIcons name={showList ? "close" : "format-list-bulleted"} size={22} color="#154212" />
        </TouchableOpacity>
      </View>

      <WebView 
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'user_click') {
              setSelectedUser(msg.data);
            }
          } catch (e) {}
        }}
        onLoadEnd={() => {
          setLoading(false);
          if (mapData) {
            webViewRef.current?.injectJavaScript(`updateMap(${JSON.stringify(mapData)})`);
          }
        }}
      />

      {/* Mini Profile Modal */}
      {selectedUser && (
        <View style={st.miniProfileOverlay}>
          <TouchableOpacity style={st.dismissArea} onPress={() => setSelectedUser(null)} />
          <View style={st.miniCard}>
            <View style={st.miniHeader}>
              <Image 
                source={selectedUser.cover_url ? { uri: selectedUser.cover_url } : require("../../assets/sky_bg.png")} 
                style={st.miniCover} 
              />
              <View style={st.miniAvatarWrap}>
                <Image 
                  source={selectedUser.avatar_url ? { uri: selectedUser.avatar_url } : require("../../assets/avatar_premium.png")} 
                  style={st.miniAvatar} 
                />
                <View style={[st.onlineStatus, { backgroundColor: selectedUser.isOnline ? '#10b981' : '#94a3b8' }]} />
              </View>
            </View>

            <View style={st.miniInfo}>
              <Text style={st.miniName}>{selectedUser.full_name || "Nông dân"}</Text>
              <Text style={st.miniRole}>@{selectedUser.username} • {selectedUser.role === 'farmer' ? 'Nông dân' : selectedUser.role}</Text>
              
              {selectedUser.bio ? <Text style={st.miniBio} numberOfLines={2}>{selectedUser.bio}</Text> : null}

              <View style={st.miniStats}>
                <View style={st.miniStatItem}>
                  <Text style={st.statVal}>{selectedUser.tasksCompleted || 0}</Text>
                  <Text style={st.statLab}>Nhiệm vụ</Text>
                </View>
                <View style={st.statDivider} />
                <View style={st.miniStatItem}>
                  <Text style={st.statVal}>{selectedUser.coins || 0}</Text>
                  <Text style={st.statLab}>Xu tích lũy</Text>
                </View>
              </View>

              <TouchableOpacity style={st.viewProfileBtn} onPress={() => setSelectedUser(null)}>
                <Text style={st.viewProfileTxt}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {loading && (
        <View style={st.loadingOverlay}>
          <ActivityIndicator size="large" color="#154212" />
        </View>
      )}

      {/* Side List Panel */}
      {showList && (
        <View style={[st.sidePanel, { top: insets.top + 80, bottom: insets.bottom + 100 }]}>
          <View style={st.panelTabs}>
            <TouchableOpacity onPress={() => setActiveTab('users')} style={[st.panelTab, activeTab === 'users' && st.panelTabActive]}>
              <Text style={[st.panelTabText, activeTab === 'users' && st.panelTabTextActive]}>Người dùng</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('pois')} style={[st.panelTab, activeTab === 'pois' && st.panelTabActive]}>
              <Text style={[st.panelTabText, activeTab === 'pois' && st.panelTabTextActive]}>Ảnh nhiệm vụ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={st.panelList} showsVerticalScrollIndicator={false}>
            {activeTab === 'users' ? (
              mapData?.users?.map((u: any) => (
                <TouchableOpacity 
                  key={u.id} 
                  style={st.listItem}
                  onPress={() => {
                    webViewRef.current?.injectJavaScript(`focusOn(${u.lat}, ${u.lng})`);
                    setShowList(false);
                  }}
                >
                  <Image source={u.avatar_url ? { uri: u.avatar_url } : require("../../assets/avatar_premium.png")} style={st.listAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={st.listItemName}>{u.full_name || "Nông dân"}</Text>
                    <Text style={st.listItemSub}>{u.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}</Text>
                  </View>
                  <MaterialCommunityIcons name="target" size={20} color="#154212" />
                </TouchableOpacity>
              ))
            ) : (
              mapData?.pois?.map((p: any) => {
                const parts = p.image_url.split("|GPS:");
                const coords = parts[1]?.split("|ADDR:")[0].split(",");
                const lat = parseFloat(coords[0]);
                const lng = parseFloat(coords[1]);
                return (
                  <TouchableOpacity 
                    key={p.id} 
                    style={st.listItem}
                    onPress={() => {
                      webViewRef.current?.injectJavaScript(`focusOn(${lat}, ${lng})`);
                      setShowList(false);
                    }}
                  >
                    <Image source={{ uri: parts[0] }} style={st.listPoiImg} />
                    <View style={{ flex: 1 }}>
                      <Text style={st.listItemName} numberOfLines={1}>{p.title}</Text>
                      <Text style={st.listItemSub}>Bởi: {p.username}</Text>
                    </View>
                    <MaterialCommunityIcons name="map-marker-radius" size={20} color="#f59e0b" />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
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

  miniProfileOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  dismissArea: { ...StyleSheet.absoluteFillObject },
  miniCard: { width: '85%', backgroundColor: '#fff', borderRadius: 28, overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20 },
  miniHeader: { height: 120, position: 'relative' },
  miniCover: { width: '100%', height: '100%' },
  miniAvatarWrap: { position: 'absolute', bottom: -30, left: 20, width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', backgroundColor: '#f3f4f6' },
  miniAvatar: { width: '100%', height: '100%', borderRadius: 31 },
  onlineStatus: { position: 'absolute', right: 2, bottom: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  
  miniInfo: { padding: 20, paddingTop: 35 },
  miniName: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#1e293b' },
  miniRole: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#64748b', marginTop: 2 },
  miniBio: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#475569', marginTop: 12, fontStyle: 'italic' },
  
  miniStats: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 16, padding: 15, marginTop: 20, alignItems: 'center' },
  miniStatItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#154212' },
  statLab: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#94a3b8', marginTop: 2 },
  statDivider: { width: 1, height: 20, backgroundColor: '#e2e8f0' },
  
  viewProfileBtn: { backgroundColor: '#154212', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  viewProfileTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },

  listToggle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  sidePanel: { position: 'absolute', left: 20, width: 280, backgroundColor: '#fff', borderRadius: 24, zIndex: 100, elevation: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 15, overflow: 'hidden' },
  panelTabs: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 4, borderRadius: 12, margin: 12 },
  panelTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  panelTabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  panelTabText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#94a3b8' },
  panelTabTextActive: { color: '#154212' },
  
  panelList: { paddingHorizontal: 12 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12 },
  listAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' },
  listPoiImg: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6' },
  listItemName: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: '#1e293b' },
  listItemSub: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#94a3b8', marginTop: 2 },
});

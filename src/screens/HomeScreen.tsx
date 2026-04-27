import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  RefreshControl,
  StyleSheet,
  Animated as RNAnimated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore, PotData } from "../store/useGameStore";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import * as haptics from "expo-haptics";
import * as Location from "expo-location";
import { userService } from "../services/api";
import FeedbackPopup from "../components/FeedbackPopup";

const { width, height } = Dimensions.get("window");

// ── Con Bướm 3D ──
function Butterfly({ startX, startY, delay }: { startX: number; startY: number; delay: number }) {
  const posX = useRef(new RNAnimated.Value(startX)).current;
  const posY = useRef(new RNAnimated.Value(startY)).current;
  const wingFlap = useRef(new RNAnimated.Value(1)).current;
  const bobY = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    // Vỗ cánh liên tục
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(wingFlap, { toValue: 0.15, duration: 130, useNativeDriver: true }),
        RNAnimated.timing(wingFlap, { toValue: 1, duration: 130, useNativeDriver: true }),
      ])
    ).start();

    // Lắc lư nhẹ
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(bobY, { toValue: -6, duration: 600, useNativeDriver: true }),
        RNAnimated.timing(bobY, { toValue: 6, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    // Bay đến vị trí ngẫu nhiên
    const fly = () => {
      const toX = Math.random() * (width - 60);
      const toY = Math.random() * (height * 0.5 - 40) + 80;
      RNAnimated.parallel([
        RNAnimated.timing(posX, { toValue: toX, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
        RNAnimated.timing(posY, { toValue: toY, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
      ]).start(() => fly());
    };
    const t = setTimeout(fly, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <RNAnimated.View
      pointerEvents="none"
      style={{ position: 'absolute', transform: [{ translateX: posX }, { translateY: posY }, { translateY: bobY }], alignItems: 'center' }}
    >
      <RNAnimated.View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Cánh trái trên */}
        <RNAnimated.View style={{ transform: [{ scaleX: wingFlap }], transformOrigin: 'right' }}>
          <View style={{ width: 20, height: 16, borderRadius: 10, backgroundColor: 'rgba(200,100,255,0.85)', marginRight: -2, transform: [{ rotate: '-20deg' }], shadowColor: '#AA00FF', shadowOpacity: 0.6, shadowRadius: 4 }} />
          <View style={{ width: 14, height: 10, borderRadius: 7, backgroundColor: 'rgba(170,60,230,0.75)', marginRight: -2, marginTop: -2, transform: [{ rotate: '-15deg' }] }} />
        </RNAnimated.View>

        {/* Thân */}
        <View style={{ width: 5, height: 22, borderRadius: 3, backgroundColor: '#3A1060', zIndex: 2 }} />

        {/* Cánh phải */}
        <RNAnimated.View style={{ transform: [{ scaleX: wingFlap }], transformOrigin: 'left' }}>
          <View style={{ width: 20, height: 16, borderRadius: 10, backgroundColor: 'rgba(200,100,255,0.85)', marginLeft: -2, transform: [{ rotate: '20deg' }], shadowColor: '#AA00FF', shadowOpacity: 0.6, shadowRadius: 4 }} />
          <View style={{ width: 14, height: 10, borderRadius: 7, backgroundColor: 'rgba(170,60,230,0.75)', marginLeft: -2, marginTop: -2, transform: [{ rotate: '15deg' }] }} />
        </RNAnimated.View>
      </RNAnimated.View>
    </RNAnimated.View>
  );
}

// ── Con Ong 3D ──
function Bee({ startX, startY, delay }: { startX: number; startY: number; delay: number }) {
  const posX = useRef(new RNAnimated.Value(startX)).current;
  const posY = useRef(new RNAnimated.Value(startY)).current;
  const wingFlap = useRef(new RNAnimated.Value(1)).current;
  const wobble = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(wingFlap, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        RNAnimated.timing(wingFlap, { toValue: 1, duration: 80, useNativeDriver: true }),
      ])
    ).start();

    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(wobble, { toValue: 3, duration: 200, useNativeDriver: true }),
        RNAnimated.timing(wobble, { toValue: -3, duration: 200, useNativeDriver: true }),
      ])
    ).start();

    const fly = () => {
      const toX = Math.random() * (width - 60);
      const toY = Math.random() * (height * 0.5 - 40) + 80;
      RNAnimated.parallel([
        RNAnimated.timing(posX, { toValue: toX, duration: 2000 + Math.random() * 1500, useNativeDriver: true }),
        RNAnimated.timing(posY, { toValue: toY, duration: 2000 + Math.random() * 1500, useNativeDriver: true }),
      ]).start(() => fly());
    };
    const t = setTimeout(fly, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <RNAnimated.View
      pointerEvents="none"
      style={{ position: 'absolute', transform: [{ translateX: posX }, { translateY: posY }, { translateY: wobble }], alignItems: 'center' }}
    >
      {/* Cánh ong */}
      <RNAnimated.View style={{ flexDirection: 'row', transform: [{ scaleX: wingFlap }], marginBottom: -4 }}>
        <View style={{ width: 16, height: 9, borderRadius: 8, backgroundColor: 'rgba(180,220,255,0.7)', marginRight: 1, shadowColor: '#FFF', shadowOpacity: 0.8, shadowRadius: 3 }} />
        <View style={{ width: 16, height: 9, borderRadius: 8, backgroundColor: 'rgba(180,220,255,0.7)', marginLeft: 1, shadowColor: '#FFF', shadowOpacity: 0.8, shadowRadius: 3 }} />
      </RNAnimated.View>
      {/* Thân ong sọc vàng đen */}
      <View style={{ width: 14, height: 20, borderRadius: 7, backgroundColor: '#FFD700', overflow: 'hidden', shadowColor: '#FF6600', shadowOpacity: 0.5, shadowRadius: 3, elevation: 3 }}>
        <View style={{ width: '100%', height: 4, backgroundColor: '#2D2D00', marginTop: 5 }} />
        <View style={{ width: '100%', height: 4, backgroundColor: '#2D2D00', marginTop: 3 }} />
      </View>
      {/* Đầu ong */}
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#2D2D00', marginTop: -2 }} />
    </RNAnimated.View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const {
    userId, userRole, fullName, coins, pots, seeds, avatarUrl,
    plantSeed, waterPot, fertilizePot, harvestPot, advancePotStage, t
  } = useGameStore();

  const [refreshing, setRefreshing] = useState(false);
  const [popup, setPopup] = useState({ visible: false, type: "success" as any, title: "", message: "" });
  const [now, setNow] = useState(Date.now());
  const [selectedPotId, setSelectedPotId] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === 'farmer') {
      let interval: any;
      const startTracking = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;

          const report = async () => {
            try {
              const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
              await userService.updateLocation(userId, loc.coords.latitude, loc.coords.longitude);
            } catch (e) {
              console.log("GPS update fail:", e);
            }
          };

          report();
          interval = setInterval(report, 30000);
        } catch (err) {
          console.error(err);
        }
      };

      startTracking();
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [userRole, userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      pots.forEach(pot => {
        if (pot.growingUntil > 0 && Date.now() >= pot.growingUntil) {
          advancePotStage(pot.id);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pots, advancePotStage]);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && pots.length > 0) {
      initializedRef.current = true;
      // Không auto-select nữa — để người dùng tự chọn
    }
  }, [pots]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const selectedPot = pots.find(p => p.id === selectedPotId);

  const handleAction = (action: 'water' | 'fertilize' | 'harvest' | 'plant') => {
    if (!selectedPot) return;
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
    if (action === 'water') waterPot(selectedPot.id);
    if (action === 'fertilize') fertilizePot(selectedPot.id);
    if (action === 'harvest') harvestPot(selectedPot.id);
    if (action === 'plant') plantSeed(selectedPot.id);
  };

  const isGrowing = selectedPot && selectedPot.growingUntil > 0 && selectedPot.growingUntil > now;
  const remainingTime = selectedPot ? Math.max(0, selectedPot.growingUntil - now) : 0;
  const totalGrowTime = 3600000; // 1 hour in milliseconds (matches GROWTH_DURATION_MS in store)
  
  const currentWaterPct = isGrowing 
    ? Math.round((remainingTime / totalGrowTime) * 100) 
    : (selectedPot ? Math.round(selectedPot.waterLevel * 100) : 0);
    
  const currentFertilizerPct = isGrowing
    ? Math.round((remainingTime / totalGrowTime) * 100)
    : (selectedPot ? Math.round(selectedPot.fertilizerLevel * 100) : 0);

  const formatTime = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    if (m > 0) return `${m} phút ${s.toString().padStart(2, '0')}s`;
    return `${s} giây`; 
  };

  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 18;
  const isEvening = hour >= 17 && hour < 20;

  const getThemeColors = (): readonly [string, string, ...string[]] => {
    if (hour >= 5 && hour < 8)   return ['#FBBF87', '#FDE68A', '#87CEEB']; // Bình minh
    if (hour >= 8 && hour < 17)  return ['#5B9BD5', '#AEE1FF', '#E1F2FB']; // Ban ngày
    if (hour >= 17 && hour < 20) return ['#FF7043', '#FF8C69', '#9B59B6']; // Hoàng hôn
    return ['#1A237E', '#283593', '#3949AB'];                               // Ban đêm
  };

  // Animate sun/moon pulse glow
  const glowAnim = useRef(new RNAnimated.Value(1)).current;
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(glowAnim, { toValue: 1.18, duration: 1800, useNativeDriver: true }),
        RNAnimated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const getPlantSize = (pot: PotData): number => {
    switch (pot.growthStage) {
      case "Nảy mầm":      return 110;
      case "Cây non":      return 120;
      case "Trưởng thành": return 130;
      case "Kết trái":     return 140;
      default:             return 110;
    }
  };

  const getTreeImage = (pot: PotData) => {
    if (!pot.hasPlant) return null;
    switch (pot.growthStage) {
      case "Nảy mầm": return require("../../assets/1.png");
      case "Cây non": return require("../../assets/2.png");
      case "Cây trưởng thành": return require("../../assets/3.png");
      case "Ra hoa": return require("../../assets/4.png");
      case "Kết trái": return require("../../assets/5.png");
      default: return require("../../assets/1.png");
    }
  };

  return (
    <LinearGradient colors={getThemeColors()} style={st.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Depth Clouds */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <MaterialCommunityIcons name="cloud" size={150} color="#FFFFFF" style={{ position: 'absolute', top: '15%', left: '-15%', opacity: 0.15 }} />
        <MaterialCommunityIcons name="cloud" size={220} color="#FFFFFF" style={{ position: 'absolute', top: '45%', right: '-25%', opacity: 0.1 }} />
        <MaterialCommunityIcons name="cloud" size={120} color="#FFFFFF" style={{ position: 'absolute', top: '75%', left: '10%', opacity: 0.12 }} />
      </View>

      {/* Header */}
      <View style={st.header}>
        <View style={st.userProfile}>
          <View style={st.avatar}>
            <Image source={avatarUrl ? { uri: avatarUrl } : require("../../assets/avatar_premium.png")} style={{width: '100%', height: '100%'}} />
          </View>
          <View style={st.userInfo}>
            <Text style={st.subText}>{t('home.garden_of')}</Text>
            <Text style={st.name}>{fullName || "Nông dân"}</Text>
          </View>
        </View>
        <View style={st.stats}>
          <TouchableOpacity style={st.statBadge} onPress={() => navigation.navigate("Shop")}>
            <Text style={{fontSize: 18}}>🍃</Text>
            <Text style={st.statBadgeText}>{seeds}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.statBadge} onPress={() => navigation.navigate("Shop")}>
            <Text style={{fontSize: 18}}>⭐</Text>
            <Text style={st.statBadgeText}>{coins}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sun / Moon ── */}
      <View style={{ position: 'absolute', top: 100, right: 20, zIndex: 5 }} pointerEvents="none">
        {isDaytime ? (
          // ☀️ Mặt trời với tia nắng xoay
          <RNAnimated.View style={{ transform: [{ rotate: glowAnim.interpolate({ inputRange: [1, 1.18], outputRange: ['0deg', '30deg'] }) }], alignItems: 'center', justifyContent: 'center', width: 70, height: 70 }}>
            {/* Tia nắng */}
            {[0,45,90,135].map(deg => (
              <View key={deg} style={{ position: 'absolute', width: 3, height: 70, borderRadius: 2, backgroundColor: 'rgba(255,220,50,0.5)', transform: [{ rotate: `${deg}deg` }] }} />
            ))}
            {/* Vầng hào quang ngoài */}
            <View style={{ position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,200,30,0.25)' }} />
            {/* Lõi mặt trời */}
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFD700', shadowColor: '#FF8C00', shadowOpacity: 0.8, shadowRadius: 12, shadowOffset: {width:0,height:0}, elevation: 10 }} />
          </RNAnimated.View>
        ) : (
          // 🌙 Mặt trăng với vầng sáng xanh bạc
          <RNAnimated.View style={{ transform: [{ scale: glowAnim }], alignItems: 'center', justifyContent: 'center', width: 64, height: 64 }}>
            {/* Hào quang ngoài */}
            <View style={{ position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(180,200,255,0.18)' }} />
            {/* Vầng trăng */}
            <View style={{ position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(180,200,255,0.28)' }} />
            {/* Lõi trăng lưỡi liềm */}
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#C8D8FF', shadowColor: '#8090FF', shadowOpacity: 0.9, shadowRadius: 14, shadowOffset: {width:0,height:0}, elevation: 8 }} />
            {/* Cắt khuyết tạo hình lưỡi liềm */}
            <View style={{ position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: 'transparent', borderWidth: 0, top: 3, left: 14, overflow: 'hidden', backgroundColor: 'rgba(30,40,100,0.55)' }} />
            {/* Các ngôi sao nhỏ */}
            <Text style={{ position: 'absolute', top: -18, left: -22, fontSize: 10, opacity: 0.9 }}>✦</Text>
            <Text style={{ position: 'absolute', top: -8, left: -35, fontSize: 7, opacity: 0.7 }}>✦</Text>
            <Text style={{ position: 'absolute', top: 8, left: -30, fontSize: 8, opacity: 0.8 }}>✦</Text>
          </RNAnimated.View>
        )}
      </View>

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Butterfly startX={50}  startY={180} delay={0}    />
        <Butterfly startX={220} startY={280} delay={1200} />
        <Bee       startX={130} startY={240} delay={600}  />
      </View>
      
      <Text style={st.pageTitle}>{t('home.garden_title')} ☁️</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 250 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A2E26" />}
      >
        <View
          style={st.gardenGrid}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => setSelectedPotId(null)}
        >
          {pots.map((pot) => {
            const isSelected = selectedPotId === pot.id;
            const treeImg = getTreeImage(pot);
            return (
              <TouchableOpacity 
                key={pot.id}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedPotId(pot.id);
                  haptics.selectionAsync();
                }}
                style={st.gridItem}
              >
                <View style={[st.cloudSlot, isSelected && { transform: [{scale: 1.05}] }]}>
                  {pot.hasPlant ? (
                    <Image source={treeImg} style={[st.plantImg, { width: getPlantSize(pot), height: getPlantSize(pot) }]} resizeMode="contain" />
                  ) : (
                    <View style={st.addBtnWrap}>
                      <LinearGradient colors={['#A8E8DF', '#83D6D2']} style={st.addBtnGradient}>
                        <Text style={st.addBtnText}>+</Text>
                      </LinearGradient>
                    </View>
                  )}
                  {/* Cloud Render */}
                  <View style={st.cloud}>
                    <LinearGradient colors={['#FFFFFF', '#D8F2FB']} style={st.cloudGradient} />
                    <View style={st.cloudBefore} />
                    <View style={st.cloudAfter} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>



      {/* Action Panel */}
      <Animated.View entering={FadeInUp.duration(400)}>
        <View style={st.actionPanel}>
        {!selectedPot ? (
          <Text style={{textAlign: 'center', color: '#8D9999'}}>Chọn chậu cây để chăm sóc</Text>
        ) : !selectedPot.hasPlant ? (
          <View style={st.emptyStateContainer}>
            <View style={st.emptyStateIconWrap}>
              <MaterialCommunityIcons name="seed-outline" size={48} color="#10B981" />
            </View>
            <Text style={st.emptyStateTitle}>CHẬU ĐANG TRỐNG</Text>
            <Text style={st.emptyStateSub}>Bạn đang có {seeds} hạt giống trong kho</Text>
            
            <TouchableOpacity onPress={() => handleAction('plant')} activeOpacity={0.8} style={st.btnPlantWrap}>
              <LinearGradient colors={['#4ADE80', '#22C55E']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={st.btnPlant}>
                <MaterialCommunityIcons name="seed" size={20} color="#fff" />
                <Text style={st.btnPlantText}>Gieo hạt ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={st.panelHeader}>
              <Text style={st.panelTitle}>CHẬU ĐANG CHỌN</Text>
              <View style={st.statusBadge}>
                <MaterialCommunityIcons name="leaf" size={14} color="#0284C7" />
                <Text style={st.statusBadgeText}>{selectedPot.growthStage}</Text>
              </View>
            </View>

            <View style={st.progressItem}>
              <View style={st.progressHeader}>
                <Text style={st.progressLabel}>Độ ẩm</Text>
                <Text style={[st.progressValue, st.blueText]}>{currentWaterPct}%</Text>
              </View>
              <View style={st.progressTrack}>
                <LinearGradient colors={['#60A5FA', '#3B82F6']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={[st.progressFill, {width: `${currentWaterPct}%`}]} />
              </View>
            </View>

            <View style={[st.progressItem, {marginBottom: 0}]}>
              <View style={st.progressHeader}>
                <Text style={st.progressLabel}>Dinh dưỡng</Text>
                <Text style={[st.progressValue, st.greenText]}>{currentFertilizerPct}%</Text>
              </View>
              <View style={st.progressTrack}>
                <LinearGradient colors={['#4ADE80', '#22C55E']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={[st.progressFill, {width: `${currentFertilizerPct}%`}]} />
              </View>
            </View>

            {/* Buttons */}
            {selectedPot.growthStage === "Kết trái" ? (
              <View style={st.buttonGroup}>
                <TouchableOpacity onPress={() => handleAction('harvest')} activeOpacity={0.8} style={{flex: 1, shadowColor: '#f59e0b', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width:0, height: 4}}}>
                  <LinearGradient colors={['#fbbf24', '#f59e0b']} style={st.btn}>
                    <Text style={st.btnText}>🌟 Thu hoạch</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : isGrowing ? (
              <Animated.View entering={FadeInUp}>
                <View style={st.growingStateWrap}>
                  <View style={st.growingStateIcon}>
                    <MaterialCommunityIcons name="timer-sand" size={26} color="#8b5cf6" />
                  </View>
                  <View style={st.growingStateTextWrap}>
                    <Text style={st.growingStateTitle}>Cây đang lớn...</Text>
                    <Text style={st.growingStateTime}>Còn {formatTime(remainingTime)}</Text>
                  </View>
                  <MaterialCommunityIcons name="star-four-points" size={24} color="#fcd34d" style={{marginRight: 5}} />
                </View>
              </Animated.View>
            ) : (
              <View style={st.buttonGroup}>
                <TouchableOpacity onPress={() => handleAction('water')} activeOpacity={0.8} style={st.btnWaterWrap}>
                  <LinearGradient colors={['#7DD3FC', '#3B82F6']} style={st.btn}>
                    <MaterialCommunityIcons name="water" size={20} color="#fff" />
                    <Text style={st.btnText}>Tưới nước</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleAction('fertilize')} activeOpacity={0.8} style={st.btnFertWrap}>
                  <LinearGradient colors={['#86EFAC', '#22C55E']} style={st.btn}>
                    <MaterialCommunityIcons name="leaf" size={20} color="#fff" />
                    <Text style={st.btnText}>Bón phân</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </Animated.View>

      <FeedbackPopup visible={popup.visible} type={popup.type} title={popup.title} message={popup.message} onClose={() => setPopup({ ...popup, visible: false })} />
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#A9EBD5' },

  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingTop: 56, paddingBottom: 10, paddingHorizontal: 20,
  },
  userProfile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFDDAA', borderWidth: 2, borderColor: '#fff', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: {width:0, height:2} },
  userInfo: { flexDirection: 'column' },
  subText: { color: '#374151', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  name: { color: '#0F172A', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  
  stats: { flexDirection: 'row', gap: 10 },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: {width:0, height:4} },
  statBadgeText: { color: '#1a1a1a', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },

  pageTitle: {
    textAlign: 'center', color: '#fff', fontSize: 26, fontFamily: 'Nunito_800ExtraBold', 
    marginTop: 15, marginBottom: 35, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4
  },

  gardenGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  gridItem: { width: '33.33%', marginBottom: 50, alignItems: 'center' },
  
  cloudSlot: { width: 140, height: 140, justifyContent: 'flex-end', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  
  plantImg: { width: 70, height: 70, position: 'absolute', bottom: 16, zIndex: 3 },
  addBtnWrap: { position: 'absolute', bottom: 20, zIndex: 3, borderRadius: 18 },
  addBtnGradient: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  addBtnText: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_600SemiBold', lineHeight: 28 },

  cloud: { width: 140, height: 58, zIndex: 1 },
  cloudGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 50, shadowColor: '#76C0C6', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: {width: 0, height: 6}, elevation: 5 },
  cloudBefore: { position: 'absolute', width: 70, height: 70, backgroundColor: '#FFFFFF', borderRadius: 35, top: -33, left: 18 },
  cloudAfter: { position: 'absolute', width: 53, height: 53, backgroundColor: '#FFFFFF', borderRadius: 26.5, top: -23, right: 22 },

  actionPanel: {
    position: 'absolute', bottom: 85, left: 15, right: 15,
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 25, zIndex: 10
  },

  emptyStateContainer: { alignItems: 'center', paddingVertical: 10 },
  emptyStateIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyStateTitle: { fontSize: 16, color: '#1E293B', fontFamily: 'Nunito_800ExtraBold', marginBottom: 8, letterSpacing: 0.5 },
  emptyStateSub: { fontSize: 14, color: '#64748B', fontFamily: 'Nunito_600SemiBold', marginBottom: 25 },
  btnPlantWrap: { width: '100%', shadowColor: '#22C55E', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width:0, height: 4}, elevation: 4, borderRadius: 24 },
  btnPlant: { paddingVertical: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnPlantText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },

  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  panelTitle: { fontSize: 15, color: '#1E293B', fontFamily: 'Nunito_800ExtraBold', letterSpacing: 0.5 },
  
  growingStateWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF', borderRadius: 24, padding: 16, marginTop: 25, borderWidth: 1, borderColor: '#E9D5FF' },
  growingStateIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#8B5CF6', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  growingStateTextWrap: { marginLeft: 15, flex: 1 },
  growingStateTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: '#6D28D9' },
  growingStateTime: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#8B5CF6', marginTop: 2 },
  
  statusBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadgeText: { fontSize: 12, color: '#0284C7', fontFamily: 'Nunito_800ExtraBold', textTransform: 'uppercase' },

  progressItem: { marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#1E293B', fontFamily: 'Nunito_600SemiBold' },
  progressValue: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  blueText: { color: '#0284C7' },
  greenText: { color: '#15803D' },
  
  progressTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  buttonGroup: { flexDirection: 'row', gap: 15, marginTop: 25 },
  btnWaterWrap: { flex: 1, shadowColor: '#3B82F6', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width:0, height: 4}, elevation: 4, borderRadius: 24 },
  btnFertWrap: { flex: 1, shadowColor: '#22C55E', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width:0, height: 4}, elevation: 4, borderRadius: 24 },
  btn: { paddingVertical: 14, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' }
});

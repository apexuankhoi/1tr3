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
  Modal,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore, PotData, translatePotStage, POT_SKINS, PLANT_ASSETS } from "../store/useGameStore";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  Easing,
} from "react-native-reanimated";
import * as haptics from "expo-haptics";
import * as Location from "expo-location";
import { userService } from "../services/api";
import FeedbackPopup from "../components/FeedbackPopup";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const width = SCREEN_WIDTH || 375;
const height = SCREEN_HEIGHT || 812;

// ── Con Bướm 3D ──
function Butterfly({ startX, startY, delay }: { startX: number; startY: number; delay: number }) {
  const posX = useRef(new RNAnimated.Value(startX)).current;
  const posY = useRef(new RNAnimated.Value(startY)).current;
  const wingFlap = useRef(new RNAnimated.Value(1)).current;
  const bobY = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(wingFlap, { toValue: 0.15, duration: 130, useNativeDriver: true }),
        RNAnimated.timing(wingFlap, { toValue: 1, duration: 130, useNativeDriver: true }),
      ])
    ).start();

    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(bobY, { toValue: -6, duration: 600, useNativeDriver: true }),
        RNAnimated.timing(bobY, { toValue: 6, duration: 600, useNativeDriver: true }),
      ])
    ).start();

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
      style={{ position: 'absolute', transform: [{ translateX: posX }, { translateY: posY }, { translateY: bobY }], alignItems: 'center', pointerEvents: 'none' }}
    >
      <RNAnimated.View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <RNAnimated.View style={{ transform: [{ scaleX: wingFlap }], transformOrigin: 'right' }}>
          <View style={{ width: 20, height: 16, borderRadius: 10, backgroundColor: 'rgba(200,100,255,0.85)', marginRight: -2, transform: [{ rotate: '-20deg' }], shadowColor: '#AA00FF', shadowOpacity: 0.6, shadowRadius: 4 }} />
          <View style={{ width: 14, height: 10, borderRadius: 7, backgroundColor: 'rgba(170,60,230,0.75)', marginRight: -2, marginTop: -2, transform: [{ rotate: '-15deg' }] }} />
        </RNAnimated.View>
        <View style={{ width: 5, height: 22, borderRadius: 3, backgroundColor: '#3A1060', zIndex: 2 }} />
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
      style={{ position: 'absolute', transform: [{ translateX: posX }, { translateY: posY }, { translateY: wobble }], alignItems: 'center', pointerEvents: 'none' }}
    >
      <RNAnimated.View style={{ flexDirection: 'row', transform: [{ scaleX: wingFlap }], marginBottom: -4 }}>
        <View style={{ width: 16, height: 9, borderRadius: 8, backgroundColor: 'rgba(180,220,255,0.7)', marginRight: 1, shadowColor: '#FFF', shadowOpacity: 0.8, shadowRadius: 3 }} />
        <View style={{ width: 16, height: 9, borderRadius: 8, backgroundColor: 'rgba(180,220,255,0.7)', marginLeft: 1, shadowColor: '#FFF', shadowOpacity: 0.8, shadowRadius: 3 }} />
      </RNAnimated.View>
      <View style={{ width: 14, height: 20, borderRadius: 7, backgroundColor: '#FFD700', overflow: 'hidden', shadowColor: '#FF6600', shadowOpacity: 0.5, shadowRadius: 3, elevation: 3 }}>
        <View style={{ width: '100%', height: 4, backgroundColor: '#2D2D00', marginTop: 5 }} />
        <View style={{ width: '100%', height: 4, backgroundColor: '#2D2D00', marginTop: 3 }} />
      </View>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#2D2D00', marginTop: -2 }} />
    </RNAnimated.View>
  );
}

// ── Tutorial Overlay ──
function TutorialOverlay({ visible, onFinish, t }: any) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: t('tutorial.welcome_title'), desc: t('tutorial.welcome_desc'), icon: "hand-wave" },
    { title: t('tutorial.plant_title'), desc: t('tutorial.plant_desc'), icon: "seed" },
    { title: t('tutorial.care_title'), desc: t('tutorial.care_desc'), icon: "watering-can" },
    { title: t('tutorial.harvest_title'), desc: t('tutorial.harvest_desc'), icon: "star-circle" },
  ];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={st.tutorialRoot}>
        <Animated.View style={st.tutorialCard}>
          <View style={st.tutorialIconWrap}>
            <MaterialCommunityIcons name={steps[step].icon as any} size={50} color="#154212" />
          </View>
          <Text style={st.tutorialTitle}>{steps[step].title}</Text>
          <Text style={st.tutorialDesc}>{steps[step].desc}</Text>

          <View style={st.tutorialDots}>
            {steps.map((_, i) => (
              <View key={i} style={[st.dot, step === i && st.dotActive]} />
            ))}
          </View>

          <TouchableOpacity
            style={st.tutorialBtn}
            onPress={() => {
              if (step < steps.length - 1) setStep(step + 1);
              else onFinish();
            }}
          >
            <Text style={st.tutorialBtnText}>{step < steps.length - 1 ? t('common.next') : t('common.start')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Static Cloud Platform ──
function CloudPlatform() {
  return (
    <View style={st.cloudBackgroundContainer}>
      <Image
        source={require('../../assets/may/may.png')}
        style={st.cloudTexture}
        resizeMode="stretch"
      />
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const userId = useGameStore(s => s.userId);
  const userRole = useGameStore(s => s.userRole);
  const fullName = useGameStore(s => s.fullName);
  const coins = useGameStore(s => s.coins);
  const level = useGameStore(s => s.level);
  const exp = useGameStore(s => s.exp);
  const pots = useGameStore(s => s.pots);
  const seeds = useGameStore(s => s.seeds);
  const avatarUrl = useGameStore(s => s.avatarUrl);
  const plantSeed = useGameStore(s => s.plantSeed);
  const waterPot = useGameStore(s => s.waterPot);
  const fertilizePot = useGameStore(s => s.fertilizePot);
  const harvestPot = useGameStore(s => s.harvestPot);
  const advancePotStage = useGameStore(s => s.advancePotStage);
  const changePotSkin = useGameStore(s => s.changePotSkin);
  const redemptions = useGameStore(s => s.redemptions);
  const inventory = useGameStore(s => s.inventory);
  const fetchInventory = useGameStore(s => s.fetchInventory);
  const fetchUserData = useGameStore(s => s.fetchUserData);
  const fetchRedemptions = useGameStore(s => s.fetchRedemptions);
  const fetchSubmissions = useGameStore(s => s.fetchSubmissions);
  const t = useGameStore(s => s.t);
  const showToast = useGameStore(s => s.showToast);
  const hasSeenTutorial = useGameStore(s => s.hasSeenTutorial);
  const setHasSeenTutorial = useGameStore(s => s.setHasSeenTutorial);
  const updateLocation = useGameStore(s => s.updateLocation);

  const [refreshing, setRefreshing] = useState(false);
  const [popup, setPopup] = useState({ visible: false, type: "success" as any, title: "", message: "" });
  const [now, setNow] = useState(Date.now());
  const [selectedPotId, setSelectedPotId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial);
  const [showSkinPicker, setShowSkinPicker] = useState(false);
  const [showPlantPicker, setShowPlantPicker] = useState(false);

  // Initial Data & Growth Sync
  useEffect(() => {
    if (!userId) return;
    
    const init = async () => {
      await fetchUserData(userId);
      await fetchInventory();
      await fetchRedemptions();
      await fetchSubmissions();
    };
    
    init();

    // Background Growth Refresh: Every 60 seconds (1 minute = 1% growth)
    const growthInterval = setInterval(() => {
      if (userId) {
        fetchUserData(userId);
      }
    }, 60000);

    return () => clearInterval(growthInterval);
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
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

  const currentGrowthPct = selectedPot ? Math.round(selectedPot.growthProgress || 0) : 0;

  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 18;

  const getThemeColors = (): readonly [string, string, ...string[]] => {
    return ['#FFFFFF', '#F8FAFC', '#F1F5F9'];
  };

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
      case "Hạt cà phê": return 100;
      case "Nảy mầm": return 110;
      case "Cây non": return 120;
      case "Cây trưởng thành":
      case "Trưởng thành": return 130;
      case "Ra hoa": return 135;
      case "Kết trái": return 140;
      default: return 110;
    }
  };

  const getTreeImage = (pot: PotData) => {
    if (!pot || !pot.hasPlant) return null;
    const type = pot.plantType || 'cafe';
    const stage = pot.growthStage || 'Nảy mầm';

    // Defensive check to prevent crash if stage is unknown
    const asset = PLANT_ASSETS[type]?.[stage];
    if (asset) return asset;

    // Fallback to first available stage or default
    return PLANT_ASSETS['cafe']?.['Nảy mầm'];
  };

  return (
    <ImageBackground source={require('../../assets/background/bg.png')} style={st.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Tutorial and Animations DISABLED for debug */}
      {/* <TutorialOverlay visible={showTutorial} onFinish={() => { setShowTutorial(false); setHasSeenTutorial(true); }} t={t} /> */}

      <View style={st.header}>
        <View style={st.userProfile}>
          <View style={st.avatar}>
            <Image source={(avatarUrl && avatarUrl.length > 5) ? { uri: avatarUrl } : require("../../assets/avatar_premium.png")} style={{ width: '100%', height: '100%' }} />
          </View>
          <View style={st.userInfo}>
            <Text style={st.subText}>{t('home.garden_of')}</Text>
            <Text style={st.name}>{fullName || t('auth.fullname')}</Text>
          </View>
        </View>
        <View style={st.stats}>
          <TouchableOpacity style={st.statBadge} onPress={() => navigation.navigate("Shop")}>
            <Text style={{ fontSize: 18 }}>🍃</Text>
            <Text style={st.statBadgeText}>{seeds}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.statBadge} onPress={() => navigation.navigate("Shop")}>
            <Text style={{ fontSize: 18 }}>⭐</Text>
            <Text style={st.statBadgeText}>{coins}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.statBadge, { backgroundColor: '#FCD34D', borderWidth: 1, borderColor: '#F59E0B', elevation: 5, shadowColor: '#B45309', shadowOpacity: 0.3, shadowRadius: 5 }]}
            onPress={() => navigation.navigate("Ranking")}
          >
            <MaterialCommunityIcons name="ladder" size={22} color="#B45309" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={st.levelContainer}>
        <View style={st.levelBadge}><Text style={st.levelText}>{t('home.level')}.{level}</Text></View>
        <View style={st.expTrack}>
          <LinearGradient colors={['#FCD34D', '#F59E0B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[st.expFill, { width: `${Math.min(100, (exp / (level * 100)) * 100)}%` }]} />
          <Text style={st.expText}>{exp} / {level * 100} {t('home.exp')}</Text>
        </View>
      </View>

      <Text style={st.pageTitle}>{t('home.garden_title')} ☁️</Text>

      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 250, backgroundColor: 'transparent' }}
        showsVerticalScrollIndicator={false}
      >
        {[1, 2, 3].map((floorId) => {
          const floorPots = pots.filter(p => p.floorId === floorId);
          return (
            <View key={`floor-${floorId}`} style={st.floorContainer}>
              {/* LAYER 1: STATIC CLOUD PLATFORM FOR THIS FLOOR */}
              <CloudPlatform />

              <View style={st.gardenGrid} onStartShouldSetResponder={() => true} onResponderGrant={() => setSelectedPotId(null)}>
                {floorPots.map((pot, index) => {
                  const globalIndex = (floorId - 1) * 3 + index;
                  const maxPlots = level;
                  const isLocked = globalIndex >= maxPlots;
                  const isSelected = selectedPotId === pot.id;
                  const treeImg = getTreeImage(pot);

                  return (
                    <TouchableOpacity
                      key={`pot-${pot.id}`}
                      activeOpacity={0.9}
                      onPress={() => {
                        if (isLocked) return showToast(t('home.need_level', { level: globalIndex + 1 }), 'error');
                        if (!pot.hasPot) {
                          setSelectedPotId(pot.id);
                          setShowSkinPicker(true);
                          return;
                        }
                        setSelectedPotId(pot.id);
                        haptics.selectionAsync();
                      }}
                      style={st.gridItem}
                    >
                      <View style={[st.cloudSlot, isSelected && { transform: [{ scale: 1.05 }] }]}>
                        {/* LAYER 2: POT (MIDDLE) */}
                        {isLocked ? (
                          <MaterialCommunityIcons name="lock" size={48} color="#1e293b" style={{ position: 'absolute', top: 110, zIndex: 10 }} />
                        ) : !pot.hasPot ? (
                          <View style={st.addBtnWrap}>
                            <LinearGradient colors={['#A8E8DF', '#83D6D2']} style={st.addBtnGradient}>
                              <Text style={st.addBtnText}>+</Text>
                            </LinearGradient>
                          </View>
                        ) : (
                          <Image
                            source={POT_SKINS[pot.skinId]?.image || require('../../assets/chau/11.png')} 
                            style={st.potSkinImg} 
                            resizeMode="contain" 
                          />
                        )}

                        {/* LAYER 3: PLANT (TOP) */}
                        {!isLocked && pot.hasPot && pot.hasPlant && (
                          <Image
                            source={treeImg}
                            style={[
                              st.plantImg,
                              { width: getPlantSize(pot), height: getPlantSize(pot) },
                              pot.isWilted && { tintColor: '#666', opacity: 0.8 }
                            ]}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={st.actionPanelWrap}>
        <View style={st.actionPanel}>
          {!selectedPot ? (
            <Text style={{ textAlign: 'center', color: '#8D9999' }}>{t('home.locked_plot')}</Text>
          ) : !selectedPot.hasPot ? (
            <Text style={{ textAlign: 'center', color: '#8D9999' }}>Chưa có chậu. Nhấn để mua hoặc đặt chậu.</Text>
          ) : !selectedPot.hasPlant ? (
            <View style={st.emptyStateContainer}>
              <View style={st.emptyStateIconWrap}><MaterialCommunityIcons name="seed-outline" size={48} color="#10B981" /></View>
              <Text style={st.emptyStateTitle}>{t('garden.empty_plot')}</Text>
              <Text style={st.emptyStateSub}>{t('home.balance')}: {seeds} {t('garden.plant')}</Text>
              <TouchableOpacity onPress={() => setShowPlantPicker(true)} activeOpacity={0.8} style={st.btnPlantWrap}>
                <LinearGradient colors={['#4ADE80', '#22C55E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.btnPlant}>
                  <MaterialCommunityIcons name="seed" size={20} color="#fff" />
                  <Text style={st.btnPlantText}>{t('garden.plant')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={st.panelHeader}>
                <Text style={st.panelTitle}>{t('garden.growing')}</Text>
                <View style={st.statusBadge}>
                  <MaterialCommunityIcons name="leaf" size={14} color="#0284C7" />
                  <Text style={st.statusBadgeText}>{translatePotStage(selectedPot.growthStage, t)}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowSkinPicker(true)} style={st.skinBtn}>
                  <MaterialCommunityIcons name="palette-outline" size={20} color="#6366f1" />
                </TouchableOpacity>
              </View>
              <View style={st.progressItem}>
                <View style={st.progressHeader}><Text style={st.progressLabel}>{t('garden.growth_progress')}</Text><Text style={[st.progressValue, st.greenText]}>{currentGrowthPct}%</Text></View>
                <View style={st.progressTrack}><LinearGradient colors={['#4ADE80', '#22C55E']} style={[st.progressFill, { width: `${currentGrowthPct}%` }]} /></View>
              </View>
              {selectedPot.isWilted && (
                <View style={st.wiltWarning}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#ef4444" />
                  <Text style={st.wiltWarningText}>{t('garden.is_wilted')}</Text>
                </View>
              )}
              {selectedPot.growthStage === "Kết trái" ? (
                <TouchableOpacity onPress={() => handleAction('harvest')} activeOpacity={0.8} style={st.btnHarvestWrap}>
                  <LinearGradient colors={['#fbbf24', '#f59e0b']} style={st.btn}><Text style={st.btnText}>🌟 {t('garden.harvest')}</Text></LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => { setSelectedPotId(null); navigation.navigate("Tasks"); }} activeOpacity={0.8} style={st.btnHarvestWrap}>
                  <LinearGradient colors={['#6366f1', '#4f46e5']} style={st.btn}><MaterialCommunityIcons name="clipboard-text-play-outline" size={20} color="#fff" /><Text style={st.btnText}>{t('garden.go_to_tasks')}</Text></LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      <FeedbackPopup visible={popup.visible} type={popup.type} title={popup.title} message={popup.message} onClose={() => setPopup({ ...popup, visible: false })} />

      {/* Skin Picker Modal */}
      <Modal visible={showSkinPicker} transparent animationType="slide">
        <View style={st.modalOverlay}>
          <View style={st.skinPickerCard}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>{t('garden.change_skin')}</Text>
              <TouchableOpacity onPress={() => setShowSkinPicker(false)}><MaterialCommunityIcons name="close" size={24} color="#64748b" /></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.skinList}>
              {Object.keys(POT_SKINS).map(skinKey => {
                const skin = POT_SKINS[skinKey];
                const isOwned = skinKey === 'default' || inventory.some(i => i.item_id === parseInt(skinKey));

                return (
                  <TouchableOpacity
                    key={skinKey}
                    disabled={!isOwned}
                    onPress={() => {
                      if (!selectedPot) return;
                      const store = useGameStore.getState();
                      if (!selectedPot.hasPot) {
                        store.placePot(selectedPot.id, skinKey);
                      } else {
                        changePotSkin(selectedPot.id, skinKey);
                      }
                      setShowSkinPicker(false);
                    }}
                    style={[st.skinItem, selectedPot?.skinId === skinKey && st.skinItemActive, !isOwned && st.skinItemLocked]}
                  >
                    <View style={[st.skinImgWrap, selectedPot?.skinId === skinKey && st.skinItemActiveWrap]}>
                      {skin.image ? (
                        <Image source={skin.image} style={st.skinImgSmall} resizeMode="contain" />
                      ) : (
                        <View style={st.defaultSkinPreview} />
                      )}
                      {!isOwned && <MaterialCommunityIcons name="lock" size={16} color="#fff" style={st.lockIcon} />}
                    </View>
                    <Text style={st.skinName} numberOfLines={1}>{skin.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={st.shopRedirectBtn}
              onPress={() => { setShowSkinPicker(false); navigation.navigate("Shop"); }}
            >
              <Text style={st.shopRedirectText}>{t('garden.go_to_shop')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Plant Picker Modal */}
      <Modal visible={showPlantPicker} transparent animationType="slide">
        <View style={st.modalOverlay}>
          <View style={st.skinPickerCard}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>{t('garden.choose_seed')}</Text>
              <TouchableOpacity onPress={() => setShowPlantPicker(false)}><MaterialCommunityIcons name="close" size={24} color="#64748b" /></TouchableOpacity>
            </View>
            <View style={st.plantPickerList}>
              {(() => {
                const seeds = useGameStore.getState().seeds;
                const cafeSeeds = inventory.find(i => i.item_id === 1)?.quantity || 0;
                const sauriengSeeds = inventory.find(i => i.item_id === 2)?.quantity || 0;
                
                // Effective counts for display
                const displayCafeSeeds = Math.max(cafeSeeds, seeds);
                
                return (
                  <>
                    <TouchableOpacity
                      style={[st.plantOption, displayCafeSeeds <= 0 && { opacity: 0.5 }]}
                      disabled={displayCafeSeeds <= 0}
                      onPress={() => {
                        if (selectedPotId) plantSeed(selectedPotId, 'cafe');
                        setShowPlantPicker(false);
                      }}
                    >
                      <View style={st.plantOptionIcon}><Text style={{ fontSize: 30 }}>☕</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={st.plantOptionName}>{t('garden.seed_cafe')}</Text>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>{t('common.quantity')}: {displayCafeSeeds}</Text>
                      </View>
                      {displayCafeSeeds > 0 && <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[st.plantOption, sauriengSeeds <= 0 && { opacity: 0.5 }]}
                      disabled={sauriengSeeds <= 0}
                      onPress={() => {
                        if (selectedPotId) plantSeed(selectedPotId, 'saurieng');
                        setShowPlantPicker(false);
                      }}
                    >
                      <View style={st.plantOptionIcon}><Text style={{ fontSize: 30 }}>🍈</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={st.plantOptionName}>{t('garden.seed_saurieng')}</Text>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>{t('common.quantity')}: {sauriengSeeds}</Text>
                      </View>
                      {sauriengSeeds > 0 && <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />}
                    </TouchableOpacity>
                  </>
                );
              })()}
            </View>
            {displayCafeSeeds <= 0 && sauriengSeeds <= 0 && (
              <TouchableOpacity
                style={[st.shopRedirectBtn, { marginTop: 10 }]}
                onPress={() => { setShowPlantPicker(false); navigation.navigate("Shop"); }}
              >
                <Text style={st.shopRedirectText}>{t('garden.go_to_shop_buy_seeds') || "Mua thêm hạt giống"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const st = StyleSheet.create({
  appContainer: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingBottom: 10, paddingHorizontal: 20 },
  userProfile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFDDAA', borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
  userInfo: { flexDirection: 'column' },
  subText: { color: '#374151', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  name: { color: '#0F172A', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  stats: { flexDirection: 'row', gap: 10 },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  statBadgeText: { color: '#1a1a1a', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  levelContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, gap: 10 },
  levelBadge: { backgroundColor: '#154212', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  levelText: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  expTrack: { flex: 1, height: 20, backgroundColor: 'transparent', borderRadius: 10, overflow: 'hidden', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  expFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 10 },
  expText: { textAlign: 'center', fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: '#154212' },
  pageTitle: { textAlign: 'center', color: '#1E293B', fontSize: 26, fontFamily: 'Nunito_800ExtraBold', marginTop: 15, marginBottom: 20 },
  floorContainer: { marginBottom: 40, position: 'relative', backgroundColor: 'transparent' },
  gardenGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, backgroundColor: 'transparent' },
  gridItem: { width: '33.33%', marginBottom: 50, alignItems: 'center', backgroundColor: 'transparent' },
  cloudSlot: { width: 140, height: 240, justifyContent: 'center', alignItems: 'center', position: 'relative', backgroundColor: 'transparent' },
  plantImg: { width: 60, height: 60, position: 'absolute', top: 40, zIndex: 10 },
  addBtnWrap: { position: 'absolute', top: 110, zIndex: 10, borderRadius: 18 },
  addBtnGradient: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_600SemiBold' },
  cloudBackgroundContainer: { position: 'absolute', top: 80, left: 0, right: 0, height: 240, zIndex: 0, overflow: 'hidden', backgroundColor: 'transparent' },
  cloudTexture: { width: '100%', height: '100%', transform: [{ scaleY: 1.1 }] },
  potSkinImg: { width: 75, height: 75, position: 'absolute', top: 115, zIndex: 5 },
  actionPanelWrap: { position: 'absolute', bottom: 85, left: 15, right: 15, zIndex: 100 },
  actionPanel: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  emptyStateContainer: { alignItems: 'center' },
  emptyStateIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyStateTitle: { fontSize: 16, color: '#1E293B', fontFamily: 'Nunito_800ExtraBold', marginBottom: 8 },
  emptyStateSub: { fontSize: 14, color: '#64748B', fontFamily: 'Nunito_600SemiBold', marginBottom: 25 },
  btnPlantWrap: { width: '100%', borderRadius: 24 },
  btnPlant: { paddingVertical: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnPlantText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  panelTitle: { fontSize: 15, color: '#1E293B', fontFamily: 'Nunito_800ExtraBold' },
  statusBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadgeText: { fontSize: 12, color: '#0284C7', fontFamily: 'Nunito_800ExtraBold' },
  skinBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e0e7ff' },
  progressItem: { marginBottom: 15 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 14, color: '#1E293B', fontFamily: 'Nunito_600SemiBold' },
  progressValue: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  blueText: { color: '#0284C7' },
  greenText: { color: '#15803D' },
  progressTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  buttonGroup: { flexDirection: 'row', gap: 15, marginTop: 15 },
  btnAction: { flex: 1 },
  btn: { paddingVertical: 14, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  btnHarvestWrap: { marginTop: 15 },
  growingStateWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF', borderRadius: 20, padding: 12, marginTop: 15 },
  growingStateIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  growingStateTextWrap: { marginLeft: 12, flex: 1 },
  growingStateTitle: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: '#6D28D9' },
  growingStateTime: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: '#8B5CF6' },
  tutorialRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  tutorialCard: { width: '85%', backgroundColor: '#fff', borderRadius: 32, padding: 30, alignItems: 'center' },
  tutorialIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  tutorialTitle: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: '#154212', textAlign: 'center', marginBottom: 12 },
  tutorialDesc: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  tutorialDots: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
  dotActive: { width: 24, backgroundColor: '#154212' },
  tutorialBtn: { backgroundColor: '#154212', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 20 },
  tutorialBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  skinPickerCard: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#1e293b' },
  skinList: { paddingVertical: 10, gap: 16 },
  skinItem: { width: 100, alignItems: 'center', gap: 8 },
  skinItemActive: { opacity: 1 },
  skinItemLocked: { opacity: 0.5 },
  skinImgWrap: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  skinItemActiveWrap: { borderColor: '#6366f1' },
  skinImgSmall: { width: '80%', height: '80%' },
  defaultSkinPreview: { width: 40, height: 20, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  lockIcon: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 2 },
  skinName: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#64748b', textAlign: 'center' },
  shopRedirectBtn: { marginTop: 20, alignItems: 'center' },
  shopRedirectText: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#6366f1', textDecorationLine: 'underline' },
  wiltWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 8, borderRadius: 12, marginBottom: 15, gap: 6 },
  wiltWarningText: { fontSize: 12, color: '#ef4444', fontFamily: 'Nunito_700Bold' },
  plantPickerList: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 },
  plantOption: { alignItems: 'center', gap: 10 },
  plantOptionIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  plantOptionName: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: '#1e293b' },
});

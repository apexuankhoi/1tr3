import React, { useState, useEffect } from "react";
import { Page, Box, Text, Button, Icon, Tabs, Input, Modal, Spinner } from "zmp-ui";
import { useGameStore } from "@/store/useGameStore";
import { shopService } from "@/services/api";

const ShopPage = () => {
  const { coins, seeds, userId, buyItem, t, fullName, userName, inventory, fetchInventory } = useGameStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("garden");
  const [gardenFilter, setGardenFilter] = useState("all");
  const [buyingId, setBuyingId] = useState<number | null>(null);
  
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: fullName || "",
    phone: userName || "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    fetchItems();
    fetchInventory();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data: any = await shopService.getShopItems();
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(it => {
    if (activeTab === 'rewards') {
      return it.is_real === 1;
    } else {
      if (it.is_real === 1) return false;
      if (gardenFilter === 'all') return true;
      return it.item_type === gardenFilter;
    }
  });

  const handleBuy = async (item: any, shippingData?: any) => {
    if (coins < item.price) {
      alert(t('shop.not_enough_coins'));
      return;
    }

    if (item.is_real && !shippingData) {
      setSelectedItem(item);
      setShippingModalVisible(true);
      return;
    }

    setBuyingId(item.id);
    try {
      const res = await buyItem(item.id, item.price, shippingData);
      if (res) {
        alert(`Thành công! Bạn đã sở hữu ${item.name}`);
        setShippingModalVisible(false);
        fetchItems();
        fetchInventory();
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi mua hàng");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <Page className="bg-gray-50 pb-24">
      {/* Header */}
      <Box className="bg-white px-4 pt-12 pb-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <Text className="text-xl font-black text-green-900">Cửa hàng</Text>
        <Box className="flex space-x-2">
            <Box className="bg-green-50 px-3 py-1 rounded-full flex items-center space-x-1 border border-green-100">
                <Text>🍃</Text>
                <Text className="font-bold text-green-800">{seeds}</Text>
            </Box>
            <Box className="bg-orange-50 px-3 py-1 rounded-full flex items-center space-x-1 border border-orange-100">
                <Text>⭐</Text>
                <Text className="font-bold text-orange-800">{coins}</Text>
            </Box>
        </Box>
      </Box>

      {/* Main Tabs */}
      <Box className="bg-white">
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
            <Tabs.Tab key="garden" label="Khu vườn" />
            <Tabs.Tab key="rewards" label="Quà tặng" />
        </Tabs>
      </Box>

      {/* Filter Row */}
      {activeTab === 'garden' && (
        <Box className="flex space-x-2 p-4 overflow-x-auto">
            {['all', 'seed', 'pot_skin'].map((f) => (
                <Button 
                    key={f}
                    size="small"
                    variant={gardenFilter === f ? "primary" : "secondary"}
                    className={`rounded-full px-4 ${gardenFilter === f ? 'bg-green-800' : ''}`}
                    onClick={() => setGardenFilter(f)}
                >
                    {f === 'all' ? 'Tất cả' : f === 'seed' ? 'Hạt giống' : 'Chậu cây'}
                </Button>
            ))}
        </Box>
      )}

      {/* Content */}
      <Box className="p-4">
        <Box className="mb-4">
            <Text className="text-2xl font-black text-gray-800">
                {activeTab === 'garden' ? "Sắm đồ cho vườn" : "Đổi quà thực tế"}
            </Text>
            <Text className="text-gray-500 text-sm">
                {activeTab === 'garden' 
                  ? "Mua hạt giống và chậu cây để trang trí nông trại." 
                  : "Dùng xu tích lũy để nhận quà thật về nhà."}
            </Text>
        </Box>

        {loading ? (
            <Box className="flex justify-center py-20"><Spinner /></Box>
        ) : filteredItems.length === 0 ? (
            <Box className="text-center py-20 opacity-50">
                <Icon icon="zi-notif-ring" size={48} />
                <Text className="mt-2">Chưa có vật phẩm nào</Text>
            </Box>
        ) : (
            <Box className="grid grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                    const isOwned = item.item_type === 'pot_skin' && inventory.some(i => i.item_id === item.id);
                    return (
                        <Box key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col">
                            <Box className="relative h-32 bg-gray-100">
                                <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />
                                <Box className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                    {isOwned ? "Đã sở hữu" : `${item.price} xu`}
                                </Box>
                            </Box>
                            <Box className="p-3 flex-1 flex flex-col justify-between">
                                <Box>
                                    <Text className="font-bold text-gray-800 text-sm" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-[10px] text-gray-400 mt-1" numberOfLines={1}>{item.description}</Text>
                                </Box>
                                <Button 
                                    fullWidth 
                                    size="small" 
                                    className={`mt-3 rounded-lg font-bold h-8 text-xs ${isOwned ? 'bg-gray-400' : item.is_real ? 'bg-orange-600' : 'bg-green-800'}`}
                                    onClick={() => !isOwned && handleBuy(item)}
                                    disabled={buyingId === item.id || isOwned}
                                >
                                    {buyingId === item.id ? <Spinner size="small" /> : isOwned ? "Sở hữu" : item.is_real ? "Đổi quà" : "Mua"}
                                </Button>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        )}
      </Box>

      {/* Shipping Modal */}
      <Modal
        visible={shippingModalVisible}
        title="Thông tin nhận quà"
        onClose={() => setShippingModalVisible(false)}
        verticalActions
      >
        <Box className="space-y-4 pt-4">
            <Input
                label="Họ và tên"
                placeholder="Tên người nhận..."
                value={shippingInfo.name}
                onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
            />
            <Input
                label="Số điện thoại"
                placeholder="Số điện thoại nhận hàng..."
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
            />
            <Input
                label="Địa chỉ giao hàng"
                placeholder="Số nhà, buôn, xã..."
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
            />
            <Box className="flex justify-between py-4 border-t">
                <Text className="text-gray-500">Thanh toán:</Text>
                <Text className="font-black text-xl text-orange-600">{selectedItem?.price} Xu</Text>
            </Box>
            <Button 
                fullWidth 
                className="bg-orange-600 h-12 rounded-xl font-bold"
                onClick={() => handleBuy(selectedItem, shippingInfo)}
            >
                Xác nhận đổi quà
            </Button>
        </Box>
      </Modal>
    </Page>
  );
};

export default ShopPage;

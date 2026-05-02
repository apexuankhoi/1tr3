import React, { useState, useEffect } from "react";
import { Page, Box, Text, Icon, Spinner, Avatar } from "zmp-ui";
import { useGameStore } from "@/store/useGameStore";
import { communityService } from "@/services/api";

const RankingPage = () => {
  const { t } = useGameStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const res: any = await communityService.getRankings('individual');
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = data.slice(0, 3);
  const others = data.slice(3);

  return (
    <Page className="bg-gray-50 pb-24">
      {/* Header Podium */}
      <Box className="bg-gradient-to-b from-green-800 to-green-900 pt-12 pb-10 px-4 rounded-b-[40px] shadow-lg">
        <Text className="text-center text-white text-xl font-black mb-8">{t('ranking.title_village')}</Text>
        
        <Box className="flex items-end justify-around h-48 px-2">
            {/* Rank 2 */}
            <Box className="flex flex-col items-center flex-1">
                <Box className="relative">
                    <Avatar src={top3[1]?.imageUri} size={60} className="border-2 border-gray-300 bg-white" />
                    <Box className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-300 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-white">2</Box>
                </Box>
                <Text className="text-white text-[10px] font-bold mt-3 truncate w-20 text-center">{top3[1]?.name || "---"}</Text>
                <Text className="text-yellow-400 text-[10px] font-black">{top3[1]?.points || 0} xu</Text>
                <Box className="w-16 h-12 bg-white/10 rounded-t-xl mt-2" />
            </Box>

            {/* Rank 1 */}
            <Box className="flex flex-col items-center flex-1 -mt-4">
                <Icon icon="zi-star-solid" className="text-yellow-400 mb-1" size={24} />
                <Box className="relative">
                    <Avatar src={top3[0]?.imageUri} size={80} className="border-4 border-yellow-400 bg-white" />
                    <Box className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-orange-900 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black border-2 border-white">1</Box>
                </Box>
                <Text className="text-white text-sm font-black mt-3 truncate w-24 text-center">{top3[0]?.name || "---"}</Text>
                <Text className="text-yellow-400 text-sm font-black">{top3[0]?.points || 0} xu</Text>
                <Box className="w-20 h-20 bg-white/20 rounded-t-xl mt-2 shadow-lg" />
            </Box>

            {/* Rank 3 */}
            <Box className="flex flex-col items-center flex-1">
                <Box className="relative">
                    <Avatar src={top3[2]?.imageUri} size={55} className="border-2 border-orange-400 bg-white" />
                    <Box className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-white">3</Box>
                </Box>
                <Text className="text-white text-[10px] font-bold mt-3 truncate w-20 text-center">{top3[2]?.name || "---"}</Text>
                <Text className="text-yellow-400 text-[10px] font-black">{top3[2]?.points || 0} xu</Text>
                <Box className="w-16 h-8 bg-white/5 rounded-t-xl mt-2" />
            </Box>
        </Box>
      </Box>

      {/* List */}
      <Box className="mx-4 -mt-6 bg-white rounded-[32px] p-6 shadow-xl min-h-[400px]">
        <Text className="text-lg font-black text-gray-800 mb-6">{t('ranking.list_title')}</Text>
        
        {loading ? (
            <Box className="flex justify-center py-20"><Spinner /></Box>
        ) : others.length === 0 ? (
            <Box className="text-center py-20 opacity-30"><Text>Chưa có dữ liệu</Text></Box>
        ) : (
            <Box className="space-y-4">
                {others.map((item, index) => (
                    <Box key={item.id} className="flex items-center py-3 border-b border-gray-50 last:border-0">
                        <Text className="w-8 font-black text-gray-400 text-sm">{index + 4}</Text>
                        <Avatar src={item.imageUri} size={40} className="mr-3" />
                        <Box className="flex-1">
                            <Text className="font-bold text-sm text-gray-800">{item.name}</Text>
                            <Text className="text-[10px] text-gray-400">Cấp {item.level}</Text>
                        </Box>
                        <Box className="bg-orange-50 px-3 py-1 rounded-full flex items-center space-x-1">
                            <Icon icon="zi-star-solid" className="text-orange-500" size={14} />
                            <Text className="text-orange-800 font-black text-xs">{item.points}</Text>
                        </Box>
                    </Box>
                ))}
            </Box>
        )}
      </Box>
    </Page>
  );
};

export default RankingPage;

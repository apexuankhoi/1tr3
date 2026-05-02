import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { adminService, shopService } from '@/services/api';

export default function AdminShopPage() {
  const t = useGameStore((state) => state.t);
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res: any = await shopService.getShopItems();
      setProducts(res || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
        <Text size="xLarge" className="font-bold text-green-800 mb-6">
          {t('admin.manage_shop')}
        </Text>

        <Button className="w-full bg-green-600 text-white py-3 mb-6">
          {t('admin.add_product')}
        </Button>

        {loading && <Text>{t('common.loading')}</Text>}

        <Box className="space-y-4">
          {products.length === 0 && !loading && (
            <Text className="text-gray-400 text-center py-8">
              {t('admin.no_products')}
            </Text>
          )}

          {products.map((product: any) => (
            <Box key={product.id} className="p-4 border border-gray-200 rounded-lg">
              <Text size="small" className="font-semibold">{product.name}</Text>
              <Text size="xSmall" className="text-gray-600">{product.price} xu</Text>
              <Box className="flex gap-2 mt-2">
                <Button className="flex-1 bg-blue-500 text-white py-2 text-sm">
                  {t('common.edit')}
                </Button>
                <Button className="flex-1 bg-red-500 text-white py-2 text-sm">
                  {t('common.delete')}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Page>
  );
}

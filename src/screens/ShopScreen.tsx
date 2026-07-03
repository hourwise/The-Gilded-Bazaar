import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import Wallet from '../components/Wallet';
import { useCharacterStats } from '../hooks/useCharacterStats';
import { getShopkeeperImage } from '../lib/shopkeeperImages';
import { authService } from '../services/authService';
import { shopService } from '../services/shopService';
import { purchaseService } from '../services/purchaseService';
import colours from '../theme/colours';

interface ShopItem {
  id: string; // shop_inventory id
  item_id: string;
  name: string;
  description: string;
  current_price_copper: number;
  quantity: number;
}

interface ShopData {
  id: string;
  name: string;
  description: string;
  shopkeeper_name: string | null;
  shopkeeper_race: string | null;
  items: ShopItem[];
}

const ShopScreen = ({ navigation }: any) => {
  const { gold, silver, copper, loading: statsLoading } = useCharacterStats();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inCampaign, setInCampaign] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const fetchShopAndItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { user } = await authService.getUser();
      if (!user) throw new Error("No user session found");

      // 1. Get the player's campaign and active shop
      const { data: campaignShop, error: campaignError } = await shopService.getPlayerCampaignAndShop(user.id);

      if (campaignError) throw campaignError;

      if (!campaignShop || !campaignShop.inCampaign) {
        setInCampaign(false);
        setLoading(false);
        return;
      }

      setInCampaign(true);

      if (!campaignShop.shop) {
        setError("No active shops in this campaign.");
        setLoading(false);
        return;
      }

      // 2. Get shop with items
      const { data: shop, error: shopError } = await shopService.getShopWithItems(campaignShop.shop.id);

      if (shopError) throw shopError;
      if (!shop) {
        setError("No active shops in this campaign.");
        setLoading(false);
        return;
      }

      setShopData(shop);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load shop.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchShopAndItems();
    });
    return unsubscribe;
  }, [navigation, fetchShopAndItems]);

  const handleBuy = async (item: ShopItem) => {
    const totalCopper = gold * 10000 + silver * 100 + copper;
    if (totalCopper < item.current_price_copper) {
      Alert.alert("Insufficient Funds", "You don't have enough gold for this item!");
      return;
    }

    try {
      setBuyingId(item.id);

      // Use secure RPC function - no client-side gold deduction!
      const { data, error } = await purchaseService.requestPurchase(item.id, 1);

      if (error) throw error;

      Alert.alert(
        data?.status === 'completed' ? "Success!" : "Request Sent",
        data?.message || "Your purchase has been processed."
      );

      fetchShopAndItems();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Purchase failed.");
    } finally {
      setBuyingId(null);
    }
  };

  const renderItem = ({ item }: { item: ShopItem }) => (
    <Card style={styles.itemCard}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.description}</Paragraph>
        <View style={styles.cardFooter}>
      <Text style={styles.itemCost}>{Math.floor(item.current_price_copper / 10000)} GP</Text>
          <Button
            mode="contained"
            compact
            onPress={() => handleBuy(item)}
            loading={buyingId === item.id}
            disabled={!!buyingId}
          >
            {item.quantity === 0 ? "Out of Stock" : "Buy"}
          </Button>
        </View>
        {item.quantity !== -1 && (
          <Text style={styles.stockText}>Stock: {item.quantity}</Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.overlay}>
        {!statsLoading && <Wallet gold={gold} silver={silver} copper={copper} />}

        {loading ? (
          <ActivityIndicator size="large" color="#ffd700" style={{ marginTop: 40 }} />
        ) : !inCampaign ? (
          <View style={styles.emptyContainer}>
            <Title style={styles.emptyTitle}>Not in a Campaign</Title>
            <Paragraph style={styles.emptyPara}>Join a campaign to browse local shops and spend your hard-earned gold!</Paragraph>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('JoinCampaign')}
              style={styles.actionButton}
            >
              Join Campaign
            </Button>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button onPress={fetchShopAndItems} textColor="#ffd700">Retry</Button>
          </View>
        ) : (
          <>
            {/* Navigation bar: Chronicle + Backpack */}
            <View style={styles.navBar}>
              <Button
                mode="text"
                icon="book-open-page-variant-outline"
                onPress={() => navigation.navigate('CampaignFeed')}
                textColor={colours.brightGold}
                compact
              >
                Chronicle
              </Button>
              <Button
                mode="text"
                icon="bag-personal-outline"
                onPress={() => navigation.navigate('Backpack', {})}
                textColor={colours.brightGold}
                compact
              >
                Backpack
              </Button>
            </View>

            <View style={styles.shopHeader}>
              <Image
                source={getShopkeeperImage(shopData?.shopkeeper_race)}
                style={styles.shopkeeperPortrait}
                resizeMode="contain"
              />
              <View style={styles.shopHeaderText}>
                <Title style={styles.shopName}>{shopData?.name}</Title>
                {shopData?.shopkeeper_name ? (
                  <Paragraph style={styles.shopkeeperName}>
                    Proprietor: {shopData.shopkeeper_name}
                  </Paragraph>
                ) : null}
                <Paragraph style={styles.shopDesc}>{shopData?.description}</Paragraph>
              </View>
            </View>

            <FlatList
              data={shopData?.items}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.list}
              ListHeaderComponent={<Title style={styles.inventoryTitle}>Available Wares</Title>}
              onRefresh={fetchShopAndItems}
              refreshing={loading}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1c1c1c' },
  overlay: { flex: 1, padding: 16 },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: 'rgba(46, 8, 84, 0.8)',
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 12,
  },
  shopkeeperPortrait: {
    width: 70,
    height: 100,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
  },
  shopHeaderText: { flex: 1 },
  shopName: { color: '#ffd700' },
  shopkeeperName: { color: '#aaa', fontSize: 13, marginTop: 2 },
  shopDesc: { color: '#f5f5dc', marginTop: 4 },
  inventoryTitle: { color: '#ffd700', marginBottom: 8, paddingLeft: 8 },
  list: { flex: 1 },
  itemCard: { marginBottom: 12, backgroundColor: 'rgba(255, 255, 220, 0.9)' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  itemCost: { fontWeight: 'bold', color: '#2e0854', fontSize: 18 },
  stockText: { fontSize: 12, color: '#666', marginTop: 4 },
  errorText: { color: '#ff8a80', textAlign: 'center', fontSize: 16, marginBottom: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { color: '#ffd700', fontSize: 24, marginBottom: 10 },
  emptyPara: { color: '#f5f5dc', textAlign: 'center', marginBottom: 20 },
  actionButton: { width: '100%' }
});

export default ShopScreen;

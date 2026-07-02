import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Clipboard,
  Modal,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  Chip,
  ActivityIndicator,
  Switch,
  Divider,
} from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';
import { SHOPKEEPER_RACES, getShopkeeperImage } from '../lib/shopkeeperImages';
import { Image } from 'react-native';

interface Campaign {
  id: string;
  name: string;
  join_code: string;
}

interface Player {
  id: string;
  display_name: string | null;
  race: string | null;
  gold: number;
  silver: number;
  copper: number;
}

interface Shop {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean | null;
  shopkeeper_name: string | null;
  shopkeeper_race: string | null;
}

const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

const DMDashboardScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);

  // Create-campaign form
  const [campaignName, setCampaignName] = useState('');
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  // Create-shop modal
  const [shopModalVisible, setShopModalVisible] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopDesc, setShopDesc] = useState('');
  const [shopkeeperName, setShopkeeperName] = useState('');
  const [shopkeeperRace, setShopkeeperRace] = useState('human');
  const [creatingShop, setCreatingShop] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('id, name, join_code')
      .eq('dm_id', user.id)
      .maybeSingle();

    if (campaignData) {
      setCampaign(campaignData);

      const { data: memberData } = await supabase
        .from('campaign_members')
        .select('profiles(id, display_name, race, gold, silver, copper)')
        .eq('campaign_id', campaignData.id);

      if (memberData) {
        setPlayers(
          memberData
            .map((m: any) => m.profiles)
            .filter(Boolean) as Player[]
        );
      }

      const { data: shopData } = await supabase
        .from('shops')
        .select('id, name, description, is_active, shopkeeper_name, shopkeeper_race')
        .eq('campaign_id', campaignData.id)
        .order('created_at');

      if (shopData) setShops(shopData);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) return;
    setCreatingCampaign(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreatingCampaign(false); return; }

    // Generate a unique join code
    let code = generateCode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from('campaigns')
        .select('id')
        .eq('join_code', code)
        .maybeSingle();
      if (!existing) break;
      code = generateCode();
    }

    const { error } = await supabase
      .from('campaigns')
      .insert({ name: campaignName.trim(), join_code: code, dm_id: user.id });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setCampaignName('');
      await loadData();
    }
    setCreatingCampaign(false);
  };

  const handleCreateShop = async () => {
    if (!shopName.trim() || !campaign) return;
    setCreatingShop(true);

    const { error } = await supabase
      .from('shops')
      .insert({
        campaign_id: campaign.id,
        name: shopName.trim(),
        description: shopDesc.trim() || null,
        shopkeeper_name: shopkeeperName.trim() || 'The Merchant',
        shopkeeper_race: shopkeeperRace,
        is_active: true,
      });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setShopName('');
      setShopDesc('');
      setShopkeeperName('');
      setShopkeeperRace('human');
      setShopModalVisible(false);
      await loadData();
    }
    setCreatingShop(false);
  };

  const toggleShopActive = async (shop: Shop) => {
    await supabase
      .from('shops')
      .update({ is_active: !shop.is_active })
      .eq('id', shop.id);
    setShops(prev =>
      prev.map(s => s.id === shop.id ? { ...s, is_active: !s.is_active } : s)
    );
  };

  const copyCode = () => {
    if (!campaign) return;
    Clipboard.setString(campaign.join_code);
    Alert.alert('Copied!', `Code "${campaign.join_code}" is ready to share.`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── The Realm (Campaign) ── */}
      <Text style={styles.sectionTitle}>⚔️  The Realm</Text>

      {!campaign ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>
              No campaign yet. Give it a name and we'll generate a join code for your players.
            </Text>
            <TextInput
              label="Campaign Name"
              value={campaignName}
              onChangeText={setCampaignName}
              mode="outlined"
              style={styles.input}
              placeholder="The Lost Mines of Phandelver"
            />
            <Button
              mode="contained"
              onPress={handleCreateCampaign}
              loading={creatingCampaign}
              disabled={!campaignName.trim() || creatingCampaign}
            >
              Create Campaign
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <Text style={styles.label}>Player Join Code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.code}>{campaign.join_code}</Text>
              <Button mode="outlined" compact onPress={copyCode} textColor="#ffd700">
                Copy
              </Button>
            </View>
            <Text style={styles.memberCount}>
              {players.length} {players.length === 1 ? 'adventurer' : 'adventurers'} at the table
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* ── Party Members ── */}
      {campaign && players.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🎲  Party Members</Text>
          {players.map(player => (
            <Card key={player.id} style={styles.playerCard}>
              <Card.Content style={styles.playerRow}>
                <View>
                  <Text style={styles.playerName}>{player.display_name ?? 'Unknown Hero'}</Text>
                  <Text style={styles.playerRace}>{player.race ?? '—'}</Text>
                </View>
                <View style={styles.playerWallet}>
                  <Text style={styles.gpText}>{player.gold ?? 0} GP</Text>
                  <Text style={styles.spText}>{player.silver ?? 0} SP</Text>
                  <Text style={styles.cpText}>{player.copper ?? 0} CP</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
          {players.length === 0 && (
            <Text style={styles.emptyHint}>No players have joined yet.</Text>
          )}
        </>
      )}

      {/* ── Shopfronts ── */}
      {campaign && (
        <>
          <Text style={styles.sectionTitle}>🏪  Your Shopfronts</Text>

          {shops.length === 0 && (
            <Text style={styles.emptyHint}>No shops yet. Open one below.</Text>
          )}

          {shops.map(shop => (
            <Card key={shop.id} style={styles.card}>
              <Card.Content>
                <View style={styles.shopHeader}>
                  <Image
                    source={getShopkeeperImage(shop.shopkeeper_race)}
                    style={styles.shopkeeperThumb}
                  />
                  <View style={styles.shopInfo}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <Text style={styles.shopKeeperLabel}>
                      {shop.shopkeeper_name} · {
                        SHOPKEEPER_RACES.find(r => r.slug === shop.shopkeeper_race)?.label
                        ?? shop.shopkeeper_race
                      }
                    </Text>
                    {shop.description ? (
                      <Text style={styles.shopDesc}>{shop.description}</Text>
                    ) : null}
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.shopActions}>
                  <View style={styles.activeToggle}>
                    <Text style={styles.label}>
                      {shop.is_active ? 'Open' : 'Closed'}
                    </Text>
                    <Switch
                      value={!!shop.is_active}
                      onValueChange={() => toggleShopActive(shop)}
                      color="#ffd700"
                    />
                  </View>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() =>
                      navigation.navigate('ManageShop', {
                        shopId: shop.id,
                        shopName: shop.name,
                      })
                    }
                    textColor="#ffd700"
                  >
                    Manage Inventory
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}

          <Button
            mode="contained"
            icon="store-plus"
            onPress={() => setShopModalVisible(true)}
            style={styles.addShopButton}
          >
            Open a New Shop
          </Button>
        </>
      )}

      <View style={{ height: 40 }} />

      {/* ── Create Shop Modal ── */}
      <Modal
        visible={shopModalVisible}
        animationType="slide"
        onRequestClose={() => setShopModalVisible(false)}
      >
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>New Shopfront</Text>

          <TextInput
            label="Shop Name"
            value={shopName}
            onChangeText={setShopName}
            mode="outlined"
            style={styles.input}
            placeholder="The Rusty Anchor Apothecary"
          />
          <TextInput
            label="Description (optional)"
            value={shopDesc}
            onChangeText={setShopDesc}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
          <TextInput
            label="Shopkeeper Name"
            value={shopkeeperName}
            onChangeText={setShopkeeperName}
            mode="outlined"
            style={styles.input}
            placeholder="Grix the Merchant"
          />

          <Text style={[styles.label, { marginBottom: 8 }]}>Shopkeeper Race</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.raceScroll}>
            {SHOPKEEPER_RACES.map(race => (
              <Chip
                key={race.slug}
                selected={shopkeeperRace === race.slug}
                onPress={() => setShopkeeperRace(race.slug)}
                style={[
                  styles.raceChip,
                  shopkeeperRace === race.slug && styles.raceChipSelected,
                ]}
                textStyle={{ fontSize: 12 }}
              >
                {race.label}
              </Chip>
            ))}
          </ScrollView>

          {/* Preview */}
          <Image
            source={getShopkeeperImage(shopkeeperRace)}
            style={styles.racePreview}
            resizeMode="contain"
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShopModalVisible(false)}
              textColor="#aaa"
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateShop}
              loading={creatingShop}
              disabled={!shopName.trim() || creatingShop}
              style={{ flex: 1 }}
            >
              Open Shop
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c' },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1c1c' },

  sectionTitle: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },

  card: { backgroundColor: '#2a2a2a', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  label: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  input: { marginBottom: 12 },

  campaignName: { color: '#f5f5dc', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  code: { color: '#ffd700', fontSize: 32, fontWeight: 'bold', letterSpacing: 4, flex: 1 },
  memberCount: { color: '#aaa', fontSize: 13 },

  playerCard: { backgroundColor: '#2a2a2a', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerName: { color: '#f5f5dc', fontSize: 16, fontWeight: '600' },
  playerRace: { color: '#888', fontSize: 13, marginTop: 2 },
  playerWallet: { alignItems: 'flex-end' },
  gpText: { color: '#ffd700', fontWeight: 'bold', fontSize: 14 },
  spText: { color: '#c0c0c0', fontSize: 12 },
  cpText: { color: '#cd7f32', fontSize: 12 },

  shopHeader: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  shopkeeperThumb: { width: 60, height: 80, borderRadius: 6, backgroundColor: '#333' },
  shopInfo: { flex: 1, justifyContent: 'center' },
  shopName: { color: '#f5f5dc', fontSize: 18, fontWeight: 'bold' },
  shopKeeperLabel: { color: '#888', fontSize: 13, marginTop: 2 },
  shopDesc: { color: '#aaa', fontSize: 13, marginTop: 4 },
  divider: { backgroundColor: 'rgba(255,215,0,0.2)', marginVertical: 10 },
  shopActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  emptyHint: { color: '#666', fontStyle: 'italic', textAlign: 'center', marginBottom: 12 },
  addShopButton: { marginTop: 8 },

  modal: { flex: 1, backgroundColor: '#1c1c1c' },
  modalContent: { padding: 24, paddingTop: 48 },
  modalTitle: { color: '#ffd700', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  raceScroll: { marginBottom: 16 },
  raceChip: { marginRight: 8, backgroundColor: '#333' },
  raceChipSelected: { backgroundColor: '#2e0854' },
  racePreview: { width: '100%', height: 180, marginBottom: 24, borderRadius: 8 },
  modalButtons: { flexDirection: 'row' },
});

export default DMDashboardScreen;

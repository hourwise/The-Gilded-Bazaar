import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  Chip,
  ActivityIndicator,
  IconButton,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

interface InventoryItem {
  inventory_id: string;
  item_id: string;
  name: string;
  description: string | null;
  rarity: string | null;
  current_price: number;
  quantity: number;
}

interface LibraryItem {
  id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  rarity: string | null;
  category: string | null;
}

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];
const CATEGORIES = ['Weapon', 'Armour', 'Potion', 'Scroll', 'Tool', 'Food & Drink', 'Misc'];
const RARITY_COLOURS: Record<string, string> = {
  Common: '#aaa',
  Uncommon: '#57ab5a',
  Rare: '#4d82d6',
  'Very Rare': '#9f6ef5',
  Legendary: '#ffa94d',
};

const ManageShopScreen = ({ route, navigation }: any) => {
  const { shopId, shopName } = route.params as { shopId: string; shopName: string };

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'hidden' | 'create' | 'library'>('hidden');

  // Create new item form
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemRarity, setItemRarity] = useState('Common');
  const [itemCategory, setItemCategory] = useState('Misc');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('-1');
  const [saving, setSaving] = useState(false);

  // Library search
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [addingFromLib, setAddingFromLib] = useState<string | null>(null);
  const [libPriceOverride, setLibPriceOverride] = useState('');
  const [libQty, setLibQty] = useState('-1');
  const [selectedLibItem, setSelectedLibItem] = useState<LibraryItem | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shop_inventory')
      .select(`
        id,
        item_id,
        current_price,
        quantity,
        items_library (name, description, rarity)
      `)
      .eq('shop_id', shopId)
      .order('updated_at');

    if (error) {
      console.error(error.message);
    } else {
      setInventory(
        (data ?? []).map((row: any) => ({
          inventory_id: row.id,
          item_id: row.item_id,
          name: row.items_library.name,
          description: row.items_library.description,
          rarity: row.items_library.rarity,
          current_price: row.current_price,
          quantity: row.quantity,
        }))
      );
    }
    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const searchLibrary = useCallback(async (query: string) => {
    setLibraryLoading(true);
    const q = supabase
      .from('items_library')
      .select('id, name, description, base_price, rarity, category')
      .order('name')
      .limit(40);

    if (query.trim()) {
      q.ilike('name', `%${query.trim()}%`);
    }

    const { data } = await q;
    setLibraryItems(data ?? []);
    setLibraryLoading(false);
  }, []);

  useEffect(() => {
    if (modalMode === 'library') {
      searchLibrary(librarySearch);
    }
  }, [modalMode, librarySearch, searchLibrary]);

  const handleCreateItem = async () => {
    if (!itemName.trim() || !itemPrice.trim()) return;
    setSaving(true);

    // 1. Insert into items_library
    const { data: newItem, error: libError } = await supabase
      .from('items_library')
      .insert({
        name: itemName.trim(),
        description: itemDesc.trim() || null,
        rarity: itemRarity,
        category: itemCategory,
        base_price: parseInt(itemPrice, 10) || 0,
        is_homebrew: true,
      })
      .select('id')
      .single();

    if (libError) {
      Alert.alert('Error', libError.message);
      setSaving(false);
      return;
    }

    // 2. Add to shop_inventory
    const { error: invError } = await supabase
      .from('shop_inventory')
      .insert({
        shop_id: shopId,
        item_id: newItem.id,
        current_price: parseInt(itemPrice, 10) || 0,
        quantity: parseInt(itemQty, 10) || -1,
      });

    if (invError) {
      Alert.alert('Error', invError.message);
    } else {
      setItemName('');
      setItemDesc('');
      setItemRarity('Common');
      setItemCategory('Misc');
      setItemPrice('');
      setItemQty('-1');
      setModalMode('hidden');
      await loadInventory();
    }
    setSaving(false);
  };

  const handleAddFromLibrary = async (libItem: LibraryItem) => {
    setSelectedLibItem(libItem);
    setLibPriceOverride(String(libItem.base_price ?? 0));
    setLibQty('-1');
  };

  const confirmAddFromLibrary = async () => {
    if (!selectedLibItem) return;
    setAddingFromLib(selectedLibItem.id);

    const { error } = await supabase
      .from('shop_inventory')
      .insert({
        shop_id: shopId,
        item_id: selectedLibItem.id,
        current_price: parseInt(libPriceOverride, 10) || 0,
        quantity: parseInt(libQty, 10) || -1,
      });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSelectedLibItem(null);
      setModalMode('hidden');
      await loadInventory();
    }
    setAddingFromLib(null);
  };

  const handleRemoveItem = (item: InventoryItem) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from the shop?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('shop_inventory')
              .delete()
              .eq('id', item.inventory_id);
            await loadInventory();
          },
        },
      ]
    );
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <Card style={styles.itemCard}>
      <Card.Content style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.itemMeta}>
            {item.rarity && (
              <Chip
                compact
                style={[styles.rarityChip, { borderColor: RARITY_COLOURS[item.rarity] ?? '#aaa' }]}
                textStyle={{ color: RARITY_COLOURS[item.rarity] ?? '#aaa', fontSize: 11 }}
              >
                {item.rarity}
              </Chip>
            )}
            <Text style={styles.itemQtyText}>
              {item.quantity === -1 ? '∞ stock' : `${item.quantity} left`}
            </Text>
          </View>
        </View>
        <View style={styles.itemPriceCol}>
          <Text style={styles.itemPrice}>{item.current_price} GP</Text>
          <IconButton
            icon="trash-can-outline"
            iconColor="#ff8a80"
            size={20}
            onPress={() => handleRemoveItem(item)}
            style={styles.removeBtn}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ffd700" />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.shopTitle}>{shopName}</Text>
            <Text style={styles.itemCount}>{inventory.length} items in stock</Text>
          </View>

          <FlatList
            data={inventory}
            renderItem={renderInventoryItem}
            keyExtractor={item => item.inventory_id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyHint}>
                This shop has no stock yet. Add items below.
              </Text>
            }
          />

          <View style={styles.actionBar}>
            <Button
              mode="contained"
              icon="plus-circle"
              onPress={() => setModalMode('create')}
              style={{ flex: 1, marginRight: 6 }}
            >
              Create Item
            </Button>
            <Button
              mode="outlined"
              icon="magnify"
              onPress={() => setModalMode('library')}
              textColor="#ffd700"
              style={{ flex: 1 }}
            >
              From Library
            </Button>
          </View>
        </>
      )}

      {/* ── Create New Item Modal ── */}
      <Modal
        visible={modalMode === 'create'}
        animationType="slide"
        onRequestClose={() => setModalMode('hidden')}
      >
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Item</Text>

          <TextInput label="Item Name" value={itemName} onChangeText={setItemName} mode="outlined" style={styles.input} placeholder="Potion of Healing" />
          <TextInput label="Description" value={itemDesc} onChangeText={setItemDesc} mode="outlined" style={styles.input} multiline numberOfLines={3} />

          <Text style={styles.fieldLabel}>Rarity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {RARITIES.map(r => (
              <Chip
                key={r}
                selected={itemRarity === r}
                onPress={() => setItemRarity(r)}
                style={[styles.optionChip, itemRarity === r && { backgroundColor: '#2e0854' }]}
                textStyle={{ color: RARITY_COLOURS[r], fontSize: 12 }}
              >
                {r}
              </Chip>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {CATEGORIES.map(c => (
              <Chip
                key={c}
                selected={itemCategory === c}
                onPress={() => setItemCategory(c)}
                style={[styles.optionChip, itemCategory === c && { backgroundColor: '#2e0854' }]}
                textStyle={{ fontSize: 12 }}
              >
                {c}
              </Chip>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <TextInput
              label="Price (GP)"
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
            />
            <TextInput
              label="Qty (-1 = ∞)"
              value={itemQty}
              onChangeText={setItemQty}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
            />
          </View>

          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setModalMode('hidden')} textColor="#aaa" style={{ flex: 1, marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateItem}
              loading={saving}
              disabled={!itemName.trim() || !itemPrice.trim() || saving}
              style={{ flex: 1 }}
            >
              Add to Shop
            </Button>
          </View>
        </ScrollView>
      </Modal>

      {/* ── Library Search Modal ── */}
      <Modal
        visible={modalMode === 'library'}
        animationType="slide"
        onRequestClose={() => { setModalMode('hidden'); setSelectedLibItem(null); }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Item Library</Text>
            <TextInput
              label="Search items…"
              value={librarySearch}
              onChangeText={setLibrarySearch}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
              style={styles.input}
            />
          </View>

          {selectedLibItem ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.fieldLabel}>Adding: {selectedLibItem.name}</Text>
              <View style={styles.row}>
                <TextInput
                  label="Price (GP)"
                  value={libPriceOverride}
                  onChangeText={setLibPriceOverride}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                />
                <TextInput
                  label="Qty (-1 = ∞)"
                  value={libQty}
                  onChangeText={setLibQty}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, { flex: 1 }]}
                />
              </View>
              <View style={styles.modalButtons}>
                <Button mode="outlined" onPress={() => setSelectedLibItem(null)} textColor="#aaa" style={{ flex: 1, marginRight: 8 }}>
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={confirmAddFromLibrary}
                  loading={!!addingFromLib}
                  style={{ flex: 1 }}
                >
                  Add to Shop
                </Button>
              </View>
            </ScrollView>
          ) : libraryLoading ? (
            <ActivityIndicator size="large" color="#ffd700" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={libraryItems}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              ListEmptyComponent={
                <Text style={styles.emptyHint}>
                  No items found. Create custom items using the "Create Item" button.
                </Text>
              }
              renderItem={({ item }) => (
                <Card style={styles.libCard}>
                  <Card.Content style={styles.libRow}>
                    <View style={styles.libInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.rarity && (
                        <Text style={[styles.itemQtyText, { color: RARITY_COLOURS[item.rarity] ?? '#aaa' }]}>
                          {item.rarity} · {item.category ?? 'Misc'}
                        </Text>
                      )}
                    </View>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleAddFromLibrary(item)}
                      textColor="#ffd700"
                    >
                      {item.base_price ?? 0} GP
                    </Button>
                  </Card.Content>
                </Card>
              )}
            />
          )}

          <View style={styles.actionBar}>
            <Button mode="text" onPress={() => { setModalMode('hidden'); setSelectedLibItem(null); }} textColor="#aaa">
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,215,0,0.2)' },
  shopTitle: { color: '#ffd700', fontSize: 20, fontWeight: 'bold' },
  itemCount: { color: '#888', fontSize: 13, marginTop: 2 },

  list: { padding: 16, paddingBottom: 100 },
  itemCard: { backgroundColor: '#2a2a2a', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { flex: 1, paddingRight: 8 },
  itemName: { color: '#f5f5dc', fontSize: 15, fontWeight: '600' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  rarityChip: { height: 22, backgroundColor: 'transparent', borderWidth: 1 },
  itemQtyText: { color: '#888', fontSize: 12 },
  itemPriceCol: { alignItems: 'center' },
  itemPrice: { color: '#ffd700', fontWeight: 'bold', fontSize: 15 },
  removeBtn: { margin: 0 },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1c1c1c',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,215,0,0.2)',
  },

  emptyHint: { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 40, padding: 16 },

  modal: { flex: 1, backgroundColor: '#1c1c1c' },
  modalContent: { padding: 24, paddingTop: 48 },
  modalTitle: { color: '#ffd700', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { marginBottom: 12 },
  fieldLabel: { color: '#aaa', fontSize: 13, marginBottom: 8 },
  row: { flexDirection: 'row' },
  optionChip: { marginRight: 8, backgroundColor: '#333' },
  modalButtons: { flexDirection: 'row', marginTop: 8 },

  libCard: { backgroundColor: '#2a2a2a', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  libRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  libInfo: { flex: 1, paddingRight: 8 },
});

export default ManageShopScreen;

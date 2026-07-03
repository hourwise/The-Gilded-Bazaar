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
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabaseClient';
import { shopService } from '../services/shopService';
import colours from '../theme/colours';
import spacing from '../theme/spacing';

// ── Types ──

interface InventoryItem {
  inventory_id: string;
  item_id: string;
  name: string;
  description: string | null;
  rarity: string | null;
  category: string | null;
  current_price_copper: number;
  quantity: number;
  is_visible: boolean;
}

interface LibraryItem {
  id: string;
  name: string;
  description: string | null;
  base_price_copper: number;
  rarity: string | null;
  category: string | null;
  is_homebrew: boolean;
}

// ── Constants ──

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];
const CATEGORIES = ['Weapon', 'Armor', 'Potion', 'Scroll', 'Wand', 'Ring', 'Wondrous', 'Tool', 'Gear', 'Consumable', 'Misc'];

const RARITY_COLOURS: Record<string, string> = {
  Common: colours.silver,
  Uncommon: colours.successGreen,
  Rare: '#4d82d6',
  'Very Rare': colours.royalPurple,
  Legendary: colours.brightGold,
};

const CATEGORY_ICONS: Record<string, string> = {
  weapon: 'sword-cross',
  armor: 'shield',
  potion: 'bottle-tonic',
  scroll: 'script-text-outline',
  wand: 'magic-staff',
  ring: 'ring',
  wondrous: 'star-four-points',
  tool: 'tools',
  gear: 'bag-personal',
  consumable: 'bottle-tonic-plus',
  misc: 'package-variant-closed',
};

// ── Helpers ──

function copperToGp(copper: number): number {
  return Math.floor(copper / 10000);
}

function gpToCopper(gp: number): number {
  return Math.round(gp * 10000);
}

function formatPriceGp(copper: number): string {
  const gp = Math.floor(copper / 10000);
  const sp = Math.floor((copper % 10000) / 100);
  const cp = copper % 100;
  if (gp > 0 && sp === 0 && cp === 0) return `${gp} GP`;
  if (gp > 0) return `${gp} GP ${sp} SP`;
  if (sp > 0) return `${sp} SP ${cp} CP`;
  return `${cp} CP`;
}

function getCategoryIcon(category: string | null): string {
  if (!category) return CATEGORY_ICONS.misc;
  return CATEGORY_ICONS[category.toLowerCase().trim()] ?? CATEGORY_ICONS.misc;
}

// ── Component ──

const ManageShopScreen = ({ route, navigation }: any) => {
  const { shopId, shopName } = route.params as { shopId: string; shopName: string };

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'hidden' | 'create' | 'library' | 'edit'>('hidden');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Create form
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemRarity, setItemRarity] = useState('Common');
  const [itemCategory, setItemCategory] = useState('Misc');
  const [itemPriceGp, setItemPriceGp] = useState('');
  const [itemQty, setItemQty] = useState('-1');
  const [saving, setSaving] = useState(false);

  // Edit form
  const [editPriceGp, setEditPriceGp] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editVisible, setEditVisible] = useState(true);

  // Library search
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [addingFromLib, setAddingFromLib] = useState<string | null>(null);
  const [libPriceGp, setLibPriceGp] = useState('');
  const [libQty, setLibQty] = useState('-1');
  const [selectedLibItem, setSelectedLibItem] = useState<LibraryItem | null>(null);

  // ── Data Loading ──

  const loadInventory = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shop_inventory')
      .select(`
        id,
        item_id,
        current_price_copper,
        quantity,
        is_visible,
        items_library (name, description, rarity, category)
      `)
      .eq('shop_id', shopId)
      .order('is_visible', { ascending: false })
      .order('updated_at');

    if (error) {
      console.error('Load inventory error:', error.message);
    } else {
      setInventory(
        (data ?? []).map((row: any) => ({
          inventory_id: row.id,
          item_id: row.item_id,
          name: row.items_library?.name ?? 'Unknown Item',
          description: row.items_library?.description ?? null,
          rarity: row.items_library?.rarity ?? null,
          category: row.items_library?.category ?? null,
          current_price_copper: row.current_price_copper,
          quantity: row.quantity,
          is_visible: row.is_visible ?? true,
        }))
      );
    }
    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // ── Library Search ──

  const searchLibrary = useCallback(async (query: string) => {
    setLibraryLoading(true);
    const q = supabase
      .from('items_library')
      .select('id, name, description, base_price_copper, rarity, category, is_homebrew')
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

  // ── Create Item ──

  const handleCreateItem = async () => {
    if (!itemName.trim() || !itemPriceGp.trim()) return;
    setSaving(true);

    const priceCopper = gpToCopper(parseFloat(itemPriceGp));

    // 1. Insert into items_library
    const { data: newItem, error: libError } = await supabase
      .from('items_library')
      .insert({
        name: itemName.trim(),
        description: itemDesc.trim() || null,
        rarity: itemRarity,
        category: itemCategory,
        base_price_copper: priceCopper,
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
    const { error: invError } = await shopService.addInventoryItem({
      shop_id: shopId,
      item_id: newItem.id,
      current_price_copper: priceCopper,
      quantity: parseInt(itemQty, 10) || -1,
    });

    if (invError) {
      Alert.alert('Error', invError.message);
    } else {
      resetCreateForm();
      setModalMode('hidden');
      await loadInventory();
    }
    setSaving(false);
  };

  const resetCreateForm = () => {
    setItemName('');
    setItemDesc('');
    setItemRarity('Common');
    setItemCategory('Misc');
    setItemPriceGp('');
    setItemQty('-1');
  };

  // ── Library Add ──

  const handleAddFromLibrary = (libItem: LibraryItem) => {
    setSelectedLibItem(libItem);
    setLibPriceGp(String(copperToGp(libItem.base_price_copper)));
    setLibQty('-1');
  };

  const confirmAddFromLibrary = async () => {
    if (!selectedLibItem) return;
    setAddingFromLib(selectedLibItem.id);

    const priceCopper = gpToCopper(parseFloat(libPriceGp) || 0);

    const { error } = await shopService.addInventoryItem({
      shop_id: shopId,
      item_id: selectedLibItem.id,
      current_price_copper: priceCopper,
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

  // ── Edit Item ──

  const openEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setEditPriceGp(String(copperToGp(item.current_price_copper)));
    setEditQty(String(item.quantity));
    setEditVisible(item.is_visible);
    setModalMode('edit');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSaving(true);

    const priceCopper = gpToCopper(parseFloat(editPriceGp) || 0);

    const { error } = await shopService.updateInventoryItem(editingItem.inventory_id, {
      current_price_copper: priceCopper,
      quantity: parseInt(editQty, 10) || -1,
      is_visible: editVisible,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEditingItem(null);
      setModalMode('hidden');
      await loadInventory();
    }
    setSaving(false);
  };

  // ── Remove Item ──

  const handleRemoveItem = (item: InventoryItem) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from the shop? This does not delete it from the item library.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await shopService.deleteInventoryItem(item.inventory_id);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              await loadInventory();
            }
          },
        },
      ]
    );
  };

  // ── Toggle Visibility ──

  const toggleVisibility = async (item: InventoryItem) => {
    const { error } = await shopService.updateInventoryItem(item.inventory_id, {
      is_visible: !item.is_visible,
    });
    if (!error) {
      setInventory(prev =>
        prev.map(i => i.inventory_id === item.inventory_id
          ? { ...i, is_visible: !i.is_visible }
          : i
        )
      );
    }
  };

  // ── Render: Inventory Item ──

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    const rarityColor = RARITY_COLOURS[item.rarity ?? ''] ?? colours.silver;
    const catIcon = getCategoryIcon(item.category);

    return (
      <Card
        style={[
          styles.itemCard,
          !item.is_visible && styles.itemHidden,
        ]}
      >
        <Card.Content>
          <View style={styles.itemRow}>
            {/* Icon + info */}
            <View style={styles.itemLeft}>
              <MaterialCommunityIcons
                name={catIcon}
                size={22}
                color={item.is_visible ? rarityColor : colours.text.muted}
                style={styles.itemIcon}
              />
              <View style={styles.itemInfo}>
                <View style={styles.itemNameRow}>
                  <Text style={[styles.itemName, !item.is_visible && styles.textMuted]}>
                    {item.name}
                  </Text>
                  {!item.is_visible && (
                    <Chip compact style={styles.hiddenChip} textStyle={styles.hiddenChipText}>
                      Hidden
                    </Chip>
                  )}
                </View>
                <View style={styles.itemMeta}>
                  {item.rarity && (
                    <Chip
                      compact
                      style={[styles.rarityChip, { borderColor: rarityColor }]}
                      textStyle={{ color: rarityColor, fontSize: 11 }}
                    >
                      {item.rarity}
                    </Chip>
                  )}
                  {item.category && (
                    <Text style={styles.categoryText}>{item.category}</Text>
                  )}
                  <Text style={[styles.itemQtyText, item.quantity <= 0 && item.quantity !== -1 && styles.outOfStock]}>
                    {item.quantity === -1 ? '∞' : item.quantity === 0 ? '0 left' : `${item.quantity} left`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price + actions */}
            <View style={styles.itemActions}>
              <Text style={[styles.itemPrice, !item.is_visible && styles.textMuted]}>
                {formatPriceGp(item.current_price_copper)}
              </Text>
              <View style={styles.actionIcons}>
                <IconButton
                  icon={item.is_visible ? 'eye' : 'eye-off'}
                  iconColor={item.is_visible ? colours.brightGold : colours.text.muted}
                  size={18}
                  onPress={() => toggleVisibility(item)}
                  style={styles.actionBtn}
                />
                <IconButton
                  icon="pencil"
                  iconColor={colours.silver}
                  size={18}
                  onPress={() => openEditItem(item)}
                  style={styles.actionBtn}
                />
                <IconButton
                  icon="trash-can-outline"
                  iconColor={colours.errorRed}
                  size={18}
                  onPress={() => handleRemoveItem(item)}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // ── Main Render ──

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colours.brightGold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.shopTitle}>{shopName}</Text>
        <Text style={styles.itemCount}>
          {inventory.filter(i => i.is_visible).length} visible · {inventory.length} total items
        </Text>
      </View>

      {/* Inventory List */}
      <FlatList
        data={inventory}
        renderItem={renderInventoryItem}
        keyExtractor={item => item.inventory_id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="store-off-outline" size={48} color={colours.text.muted} />
            <Text style={styles.emptyTitle}>Empty Shopfront</Text>
            <Text style={styles.emptyHint}>
              This shop has no inventory yet. Add items using the buttons below.
            </Text>
          </View>
        }
      />

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <Button
          mode="contained"
          icon="plus-circle"
          onPress={() => { resetCreateForm(); setModalMode('create'); }}
          style={styles.actionBtnPrimary}
        >
          Create Item
        </Button>
        <Button
          mode="outlined"
          icon="bookshelf"
          onPress={() => { setLibrarySearch(''); setSelectedLibItem(null); setModalMode('library'); }}
          textColor={colours.brightGold}
          style={styles.actionBtnSecondary}
        >
          From Library
        </Button>
      </View>

      {/* ══════════════════════════════════════════
          CREATE ITEM MODAL
          ══════════════════════════════════════════ */}
      <Modal
        visible={modalMode === 'create'}
        animationType="slide"
        onRequestClose={() => setModalMode('hidden')}
      >
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Craft a New Item</Text>
          <Text style={styles.modalSubtitle}>
            Items you create here are saved to the item library for reuse across shops.
          </Text>

          <TextInput
            label="Item Name"
            value={itemName}
            onChangeText={setItemName}
            mode="outlined"
            style={styles.input}
            placeholder="Potion of Healing"
            placeholderTextColor={colours.text.muted}
          />
          <TextInput
            label="Description"
            value={itemDesc}
            onChangeText={setItemDesc}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="A ruby draught in a wax-sealed vial..."
            placeholderTextColor={colours.text.muted}
          />

          <Text style={styles.fieldLabel}>Rarity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {RARITIES.map(r => (
              <Chip
                key={r}
                selected={itemRarity === r}
                onPress={() => setItemRarity(r)}
                style={[
                  styles.optionChip,
                  itemRarity === r && { backgroundColor: colours.nightPurple, borderColor: RARITY_COLOURS[r] },
                ]}
                textStyle={{
                  color: itemRarity === r ? RARITY_COLOURS[r] : colours.text.secondary,
                  fontSize: 12,
                }}
              >
                {r}
              </Chip>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {CATEGORIES.map(c => (
              <Chip
                key={c}
                selected={itemCategory === c}
                onPress={() => setItemCategory(c)}
                style={[
                  styles.optionChip,
                  itemCategory === c && { backgroundColor: colours.nightPurple, borderColor: colours.brightGold },
                ]}
                textStyle={{
                  color: itemCategory === c ? colours.brightGold : colours.text.secondary,
                  fontSize: 12,
                }}
              >
                {c}
              </Chip>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              label="Price (GP)"
              value={itemPriceGp}
              onChangeText={setItemPriceGp}
              keyboardType="decimal-pad"
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              placeholder="50"
              placeholderTextColor={colours.text.muted}
            />
            <TextInput
              label="Quantity"
              value={itemQty}
              onChangeText={setItemQty}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              placeholder="-1"
              placeholderTextColor={colours.text.muted}
            />
          </View>
          <Text style={styles.inputHint}>Quantity: -1 = unlimited stock, 0 = hidden from players</Text>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setModalMode('hidden')}
              textColor={colours.text.secondary}
              style={styles.modalBtnHalf}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateItem}
              loading={saving}
              disabled={!itemName.trim() || !itemPriceGp.trim() || saving}
              style={styles.modalBtnHalf}
            >
              Add to Shop
            </Button>
          </View>
        </ScrollView>
      </Modal>

      {/* ══════════════════════════════════════════
          EDIT ITEM MODAL
          ══════════════════════════════════════════ */}
      <Modal
        visible={modalMode === 'edit'}
        animationType="slide"
        onRequestClose={() => { setModalMode('hidden'); setEditingItem(null); }}
      >
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Item</Text>
          {editingItem && (
            <>
              <Text style={styles.editItemName}>{editingItem.name}</Text>
              {editingItem.rarity && (
                <Chip compact style={[styles.rarityChip, { borderColor: RARITY_COLOURS[editingItem.rarity] ?? colours.silver, alignSelf: 'flex-start', marginBottom: 16 }]}
                  textStyle={{ color: RARITY_COLOURS[editingItem.rarity] ?? colours.silver }}>
                  {editingItem.rarity}
                </Chip>
              )}

              <View style={styles.inputRow}>
                <TextInput
                  label="Price (GP)"
                  value={editPriceGp}
                  onChangeText={setEditPriceGp}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
                <TextInput
                  label="Quantity"
                  value={editQty}
                  onChangeText={setEditQty}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>
              <Text style={styles.inputHint}>Quantity: -1 = unlimited, 0 = out of stock</Text>

              <View style={styles.visibilityToggle}>
                <Text style={styles.fieldLabel}>Visible to Players</Text>
                <View style={styles.visibilityBtns}>
                  <Chip
                    selected={editVisible}
                    onPress={() => setEditVisible(true)}
                    style={[styles.visChip, editVisible && { backgroundColor: colours.nightPurple, borderColor: colours.successGreen }]}
                    textStyle={{ color: editVisible ? colours.successGreen : colours.text.secondary }}
                    icon="eye"
                  >
                    Visible
                  </Chip>
                  <Chip
                    selected={!editVisible}
                    onPress={() => setEditVisible(false)}
                    style={[styles.visChip, !editVisible && { backgroundColor: colours.nightPurple, borderColor: colours.text.muted }]}
                    textStyle={{ color: !editVisible ? colours.text.muted : colours.text.secondary }}
                    icon="eye-off"
                  >
                    Hidden
                  </Chip>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => { setModalMode('hidden'); setEditingItem(null); }}
                  textColor={colours.text.secondary}
                  style={styles.modalBtnHalf}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveEdit}
                  loading={saving}
                  disabled={!editPriceGp.trim() || saving}
                  style={styles.modalBtnHalf}
                >
                  Save Changes
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </Modal>

      {/* ══════════════════════════════════════════
          LIBRARY SEARCH MODAL
          ══════════════════════════════════════════ */}
      <Modal
        visible={modalMode === 'library'}
        animationType="slide"
        onRequestClose={() => { setModalMode('hidden'); setSelectedLibItem(null); }}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Item Library</Text>
            <Text style={styles.modalSubtitle}>
              Browse existing items or search by name.
            </Text>
            <TextInput
              label="Search items…"
              value={librarySearch}
              onChangeText={setLibrarySearch}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
              style={styles.input}
              placeholder="Potion, Sword, Ring..."
              placeholderTextColor={colours.text.muted}
            />
          </View>

          {selectedLibItem ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.libDetailCard}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(selectedLibItem.category)}
                  size={28}
                  color={RARITY_COLOURS[selectedLibItem.rarity ?? ''] ?? colours.silver}
                />
                <Text style={styles.libDetailName}>{selectedLibItem.name}</Text>
                {selectedLibItem.rarity && (
                  <Chip compact style={[styles.rarityChip, { borderColor: RARITY_COLOURS[selectedLibItem.rarity] ?? colours.silver }]}
                    textStyle={{ color: RARITY_COLOURS[selectedLibItem.rarity] ?? colours.silver }}>
                    {selectedLibItem.rarity}
                  </Chip>
                )}
                {selectedLibItem.description && (
                  <Text style={styles.libDetailDesc}>{selectedLibItem.description}</Text>
                )}
                <Text style={styles.libDetailPrice}>
                  Library base price: {formatPriceGp(selectedLibItem.base_price_copper)}
                </Text>
                {selectedLibItem.is_homebrew && (
                  <Chip compact style={styles.homebrewChip} textStyle={styles.homebrewChipText}>
                    Homebrew
                  </Chip>
                )}
              </View>

              <Text style={styles.fieldLabel}>Set shop price and quantity:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  label="Price (GP)"
                  value={libPriceGp}
                  onChangeText={setLibPriceGp}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
                <TextInput
                  label="Quantity"
                  value={libQty}
                  onChangeText={setLibQty}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>
              <Text style={styles.inputHint}>Set your own price — can differ from the library base price.</Text>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setSelectedLibItem(null)}
                  textColor={colours.text.secondary}
                  style={styles.modalBtnHalf}
                >
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={confirmAddFromLibrary}
                  loading={!!addingFromLib}
                  style={styles.modalBtnHalf}
                >
                  Add to Shop
                </Button>
              </View>
            </ScrollView>
          ) : libraryLoading ? (
            <ActivityIndicator size="large" color={colours.brightGold} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={libraryItems}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 120 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="bookshelf" size={40} color={colours.text.muted} />
                  <Text style={styles.emptyHint}>
                    {librarySearch.trim()
                      ? 'No items match your search.'
                      : 'No items in the library yet. Create custom items!'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const rColor = RARITY_COLOURS[item.rarity ?? ''] ?? colours.silver;
                return (
                  <Card style={styles.libCard} onPress={() => handleAddFromLibrary(item)}>
                    <Card.Content style={styles.libRow}>
                      <View style={styles.libIconCol}>
                        <MaterialCommunityIcons
                          name={getCategoryIcon(item.category)}
                          size={24}
                          color={rColor}
                        />
                      </View>
                      <View style={styles.libInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.libMeta}>
                          {item.rarity && (
                            <Text style={[styles.libRarityText, { color: rColor }]}>
                              {item.rarity}
                            </Text>
                          )}
                          {item.category && (
                            <Text style={styles.libCatText}>· {item.category}</Text>
                          )}
                          {item.is_homebrew && (
                            <Text style={styles.libHbText}>· homebrew</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.libPriceCol}>
                        <MaterialCommunityIcons name="circle" color={colours.brightGold} size={10} />
                        <Text style={styles.libPriceText}>{formatPriceGp(item.base_price_copper)}</Text>
                      </View>
                    </Card.Content>
                  </Card>
                );
              }}
            />
          )}

          <View style={styles.actionBar}>
            <Button
              mode="text"
              onPress={() => { setModalMode('hidden'); setSelectedLibItem(null); }}
              textColor={colours.text.secondary}
            >
              Close Library
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Styles ──

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colours.charcoal },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colours.charcoal },

  // Header
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colours.card.darkBorder,
  },
  shopTitle: { color: colours.brightGold, fontSize: 20, fontWeight: 'bold' },
  itemCount: { color: colours.text.muted, fontSize: 13, marginTop: 2 },

  // List
  list: { padding: spacing.sm, paddingBottom: 100 },
  itemCard: {
    backgroundColor: colours.card.dark,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colours.card.darkBorder,
    borderRadius: spacing.card.borderRadius,
  },
  itemHidden: {
    opacity: 0.6,
    borderColor: 'rgba(255,215,0,0.05)',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemIcon: {
    marginRight: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemName: {
    color: colours.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  textMuted: { color: colours.text.muted },
  hiddenChip: {
    height: 20,
    backgroundColor: 'rgba(192,192,192,0.15)',
  },
  hiddenChipText: { fontSize: 10, color: colours.text.muted },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  rarityChip: {
    height: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  categoryText: { color: colours.text.muted, fontSize: 11 },
  itemQtyText: { color: colours.text.muted, fontSize: 12 },
  outOfStock: { color: colours.errorRed },

  // Item actions
  itemActions: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemPrice: {
    color: colours.brightGold,
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -4,
  },
  actionBtn: {
    margin: 0,
  },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colours.charcoal,
    borderTopWidth: 1,
    borderTopColor: colours.card.darkBorder,
    gap: 8,
  },
  actionBtnPrimary: {
    flex: 1,
  },
  actionBtnSecondary: {
    flex: 1,
    borderColor: colours.brightGold,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    color: colours.brightGold,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  emptyHint: {
    color: colours.text.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },

  // Modal
  modal: { flex: 1, backgroundColor: colours.charcoal },
  modalHeader: { padding: spacing.lg, paddingTop: 48 },
  modalContent: { padding: spacing.lg, paddingTop: 48, paddingBottom: 100 },
  modalTitle: {
    color: colours.brightGold,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    color: colours.text.secondary,
    fontSize: 13,
    marginBottom: spacing.lg,
    lineHeight: 19,
  },
  input: { marginBottom: spacing.sm },
  inputHint: {
    color: colours.text.muted,
    fontSize: 11,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: { flex: 1 },
  fieldLabel: {
    color: colours.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  chipRow: { marginBottom: spacing.md },
  optionChip: {
    marginRight: spacing.xs,
    backgroundColor: colours.inkBlack,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: 8,
  },
  modalBtnHalf: { flex: 1 },
  divider: { marginVertical: spacing.md, backgroundColor: colours.card.darkBorder },

  // Edit
  editItemName: {
    color: colours.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  visibilityToggle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  visibilityBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  visChip: {
    backgroundColor: colours.inkBlack,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },

  // Library
  libCard: {
    backgroundColor: colours.card.dark,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colours.card.darkBorder,
    borderRadius: spacing.card.borderRadius,
  },
  libRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  libIconCol: {
    width: 36,
    alignItems: 'center',
  },
  libInfo: {
    flex: 1,
  },
  libMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  libRarityText: { fontSize: 11, fontWeight: '600' },
  libCatText: { fontSize: 11, color: colours.text.muted },
  libHbText: { fontSize: 10, color: colours.royalPurple, fontStyle: 'italic' },
  libPriceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  libPriceText: {
    color: colours.brightGold,
    fontSize: 13,
    fontWeight: '600',
  },

  // Library detail
  libDetailCard: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colours.card.dark,
    borderRadius: spacing.card.borderRadius,
    borderWidth: 1,
    borderColor: colours.card.darkBorder,
    marginBottom: spacing.lg,
    gap: 6,
  },
  libDetailName: {
    color: colours.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  libDetailDesc: {
    color: colours.text.secondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  libDetailPrice: {
    color: colours.text.gold,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  homebrewChip: {
    height: 22,
    backgroundColor: 'rgba(75,22,120,0.4)',
    borderWidth: 1,
    borderColor: colours.royalPurple,
  },
  homebrewChipText: {
    fontSize: 10,
    color: colours.royalPurple,
  },
});

export default ManageShopScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, Card, Title, Paragraph, Surface, Chip, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { backpackService, BackpackItem } from '../services/backpackService';
import colours from '../theme/colours';
import spacing from '../theme/spacing';

const RARITY_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  common: { color: '#9e9e9e', icon: 'circle-small', label: 'Common' },
  uncommon: { color: colours.successGreen, icon: 'circle-medium', label: 'Uncommon' },
  rare: { color: '#2196F3', icon: 'star-four-points', label: 'Rare' },
  'very rare': { color: colours.royalPurple, icon: 'star', label: 'Very Rare' },
  legendary: { color: colours.brightGold, icon: 'star-circle', label: 'Legendary' },
  artifact: { color: '#FF5722', icon: 'crown', label: 'Artifact' },
};

const DEFAULT_RARITY = { color: colours.silver, icon: 'help-circle-outline', label: 'Unknown' };

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

function getCategoryIcon(category: string | null): string {
  if (!category) return CATEGORY_ICONS.misc;
  const key = category.toLowerCase().trim();
  return CATEGORY_ICONS[key] ?? CATEGORY_ICONS.misc;
}

function getRarityConfig(rarity: string | null) {
  if (!rarity) return DEFAULT_RARITY;
  const key = rarity.toLowerCase().trim();
  return RARITY_CONFIG[key] ?? DEFAULT_RARITY;
}

function formatPrice(copper: number): string {
  const gp = Math.floor(copper / 10000);
  const sp = Math.floor((copper % 10000) / 100);
  const cp = copper % 100;
  const parts: string[] = [];
  if (gp > 0) parts.push(`${gp} GP`);
  if (sp > 0) parts.push(`${sp} SP`);
  if (cp > 0 || parts.length === 0) parts.push(`${cp} CP`);
  return parts.join(' ');
}

function groupByCategory(items: BackpackItem[]): Map<string, BackpackItem[]> {
  const groups = new Map<string, BackpackItem[]>();
  for (const item of items) {
    const cat = (item.category || 'misc').toLowerCase().trim();
    const existing = groups.get(cat) || [];
    existing.push(item);
    groups.set(cat, existing);
  }
  return groups;
}

function formatCategoryLabel(category: string): string {
  return category
    .split(/[\s_-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface BackpackScreenProps {
  navigation: any;
  route?: { params?: { characterId?: string } };
}

const BackpackScreen: React.FC<BackpackScreenProps> = ({ navigation, route }) => {
  const [items, setItems] = useState<BackpackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState<string | null>(null);
  const [totalValueCopper, setTotalValueCopper] = useState(0);

  const characterId = route?.params?.characterId;

  const fetchBackpack = useCallback(async () => {
    try {
      setError(null);

      let data: BackpackItem[] | null = null;
      let charName: string | null = null;

      if (characterId) {
        // DM viewing a specific character's backpack
        const result = await backpackService.getBackpackForCharacter(characterId);
        data = result.data;
        if (result.error) throw result.error;
      } else {
        // Player viewing their own backpack
        const result = await backpackService.getMyBackpack();
        data = result.data;
        charName = result.character?.character_name ?? null;
        if (result.error) throw result.error;
      }

      const backpackItems = data || [];
      setItems(backpackItems);
      if (charName) setCharacterName(charName);

      // Calculate estimated total value
      const total = backpackItems.reduce((sum, item) => {
        return sum + item.base_price_copper * item.quantity;
      }, 0);
      setTotalValueCopper(total);

    } catch (e: any) {
      console.error('Error fetching backpack:', e);
      setError(e.message || 'Failed to load backpack.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [characterId]);

  useEffect(() => {
    fetchBackpack();
  }, [fetchBackpack]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchBackpack);
    return unsubscribe;
  }, [navigation, fetchBackpack]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBackpack();
  }, [fetchBackpack]);

  const renderItem = ({ item }: { item: BackpackItem }) => {
    const rarityConfig = getRarityConfig(item.rarity);
    const catIcon = getCategoryIcon(item.category);

    return (
      <Card style={styles.itemCard}>
        <Card.Content>
          <View style={styles.itemHeader}>
            <Surface style={[styles.iconSurface, { borderColor: rarityConfig.color }]}>
              <MaterialCommunityIcons name={catIcon} size={22} color={rarityConfig.color} />
            </Surface>
            <View style={styles.itemTitleArea}>
              <View style={styles.itemNameRow}>
                <Title style={styles.itemName}>{item.item_name}</Title>
                {item.quantity > 1 && (
                  <Chip
                    style={[styles.quantityChip, { borderColor: colours.brightGold }]}
                    textStyle={styles.quantityText}
                    compact
                  >
                    x{item.quantity}
                  </Chip>
                )}
              </View>
              {item.rarity && (
                <View style={styles.rarityRow}>
                  <MaterialCommunityIcons
                    name={rarityConfig.icon}
                    size={14}
                    color={rarityConfig.color}
                  />
                  <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>
                    {rarityConfig.label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {item.item_description ? (
            <Paragraph style={styles.itemDesc} numberOfLines={3}>
              {item.item_description}
            </Paragraph>
          ) : null}

          <View style={styles.itemFooter}>
            <Text style={styles.priceLabel}>
              Est. Value: {formatPrice(item.base_price_copper)}
              {item.quantity > 1 ? ` each` : ''}
            </Text>
            {item.source && (
              <Text style={styles.sourceLabel}>Source: {item.source}</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderSectionHeader = (category: string) => (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons
        name={getCategoryIcon(category)}
        size={18}
        color={colours.brightGold}
      />
      <Text style={styles.sectionTitle}>{formatCategoryLabel(category)}</Text>
    </View>
  );

  // Build grouped sections for FlatList
  const groupedEntries = React.useMemo(() => {
    const groups = groupByCategory(items);
    const entries: Array<{ type: 'header'; category: string } | { type: 'item'; item: BackpackItem }> = [];

    for (const [category, categoryItems] of groups) {
      entries.push({ type: 'header', category });
      for (const item of categoryItems) {
        entries.push({ type: 'item', item });
      }
    }
    return entries;
  }, [items]);

  // Loading state
  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colours.brightGold} />
        <Text style={styles.loadingText}>Opening your backpack...</Text>
      </View>
    );
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="bag-personal-off" size={64} color={colours.text.muted} />
        <Title style={styles.emptyTitle}>Cannot Open Backpack</Title>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={fetchBackpack} textColor={colours.brightGold}>
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Summary bar */}
      {items.length > 0 && (
        <Surface style={styles.summaryBar}>
          <View style={styles.summaryLeft}>
            <MaterialCommunityIcons name="bag-personal" size={20} color={colours.brightGold} />
            <Text style={styles.summaryText}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
              {characterName ? ` · ${characterName}` : ''}
            </Text>
          </View>
          <Text style={styles.summaryValue}>
            {formatPrice(totalValueCopper)}
          </Text>
        </Surface>
      )}

      <FlatList
        data={groupedEntries}
        renderItem={({ item: entry }) => {
          if (entry.type === 'header') {
            return renderSectionHeader(entry.category);
          }
          return renderItem({ item: entry.item });
        }}
        keyExtractor={(entry, index) =>
          entry.type === 'header' ? `h-${entry.category}` : `i-${entry.item.id}`
        }
        contentContainerStyle={[
          styles.listContent,
          groupedEntries.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bag-personal-outline" size={64} color={colours.text.muted} />
            <Title style={styles.emptyTitle}>Your Backpack is Empty</Title>
            <Paragraph style={styles.emptyPara}>
              Visit a shop to purchase items or ask your DM to grant you equipment.{'\n\n'}
              Items you buy or receive will appear here.
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CampaignHome')}
              style={styles.shopButton}
            >
              Browse Shops
            </Button>
          </View>
        }
        onRefresh={handleRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colours.charcoal,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colours.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colours.text.secondary,
    marginTop: spacing.md,
    fontSize: 15,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colours.nightPurple,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    color: colours.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    color: colours.brightGold,
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  listEmpty: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.screen.padding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    color: colours.brightGold,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemCard: {
    marginHorizontal: spacing.screen.padding,
    marginVertical: spacing.xs,
    backgroundColor: colours.card.dark,
    borderWidth: 1,
    borderColor: colours.card.darkBorder,
    borderRadius: spacing.card.borderRadius,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconSurface: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 16, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  itemTitleArea: {
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
    fontSize: 16,
    lineHeight: 22,
  },
  quantityChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    height: 24,
  },
  quantityText: {
    color: colours.brightGold,
    fontSize: 11,
    fontWeight: '700',
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rarityLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDesc: {
    color: colours.text.secondary,
    fontSize: 13,
    marginTop: spacing.sm,
    lineHeight: 19,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.08)',
  },
  priceLabel: {
    color: colours.text.gold,
    fontSize: 12,
    fontWeight: '500',
  },
  sourceLabel: {
    color: colours.text.muted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colours.charcoal,
  },
  emptyTitle: {
    color: colours.brightGold,
    fontSize: 22,
    marginTop: spacing.md,
  },
  emptyPara: {
    color: colours.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    maxWidth: 300,
  },
  shopButton: {
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 280,
  },
  errorText: {
    color: colours.errorRed,
    textAlign: 'center',
    fontSize: 16,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});

export default BackpackScreen;

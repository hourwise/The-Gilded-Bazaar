import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colours from '../../theme/colours';
import spacing from '../../theme/spacing';
import { CampaignFeed } from '../../services/feedService';

type EntryTypeIconMap = {
  [key: string]: { icon: string; color: string; label: string };
};

const ENTRY_TYPE_CONFIG: EntryTypeIconMap = {
  campaign_created: { icon: 'campfire', color: '#FF8C00', label: 'Campaign Founded' },
  player_joined: { icon: 'account-plus', color: colours.successGreen, label: 'New Adventurer' },
  purchase_requested: { icon: 'cart-outline', color: colours.silver, label: 'Purchase Request' },
  purchase_approved: { icon: 'check-circle', color: colours.successGreen, label: 'Purchase Approved' },
  purchase_rejected: { icon: 'close-circle', color: colours.errorRed, label: 'Purchase Denied' },
  shop_created: { icon: 'store', color: colours.brightGold, label: 'New Shop' },
  item_added: { icon: 'package-variant-closed', color: colours.copper, label: 'New Wares' },
  dm_announcement: { icon: 'bullhorn', color: colours.royalPurple, label: 'Town Crier' },
  dm_whisper: { icon: 'message-text', color: colours.nightPurple, label: 'Whisper' },
  downtime_completed: { icon: 'clock-check', color: colours.gildedGold, label: 'Task Complete' },
  downtime_started: { icon: 'clock-outline', color: colours.silver, label: 'Task Started' },
  settlement_event: { icon: 'city', color: colours.brightGold, label: 'Town Event' },
  economy_update: { icon: 'scale-balance', color: colours.gildedGold, label: 'Ledger Entry' },
  ai_generation: { icon: 'robot', color: colours.royalPurple, label: 'Bazaar Scribe' },
};

const DEFAULT_CONFIG = { icon: 'newspaper-variant-outline', color: colours.silver, label: 'Chronicle' };

function getEntryConfig(entryType: string) {
  return ENTRY_TYPE_CONFIG[entryType] || DEFAULT_CONFIG;
}

function formatTimestamp(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

interface FeedEntryCardProps {
  entry: CampaignFeed;
  isDM?: boolean;
}

const FeedEntryCard: React.FC<FeedEntryCardProps> = ({ entry, isDM = false }) => {
  const config = getEntryConfig(entry.entry_type);
  const isDMOnly = entry.visibility === 'dm_only';
  const isPrivate = entry.visibility === 'private';
  const timestamp = formatTimestamp(entry.created_at);

  return (
    <Card
      style={[
        styles.card,
        isDMOnly && styles.dmOnlyCard,
        isPrivate && styles.privateCard,
      ]}
    >
      <Card.Content style={styles.content}>
        {/* Icon column */}
        <Surface style={[styles.iconContainer, { borderColor: config.color }]}>
          <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
        </Surface>

        {/* Body column */}
        <View style={styles.body}>
          {/* Visibility badge */}
          <View style={styles.headerRow}>
            <Text style={[styles.entryTypeLabel, { color: config.color }]}>
              {config.label}
            </Text>
            {isDMOnly && (
              <View style={styles.dmBadge}>
                <MaterialCommunityIcons name="shield-crown" size={12} color={colours.brightGold} />
                <Text style={styles.dmBadgeText}>DM</Text>
              </View>
            )}
            {isPrivate && (
              <View style={styles.privateBadge}>
                <MaterialCommunityIcons name="eye-off" size={12} color={colours.silver} />
                <Text style={styles.privateBadgeText}>Private</Text>
              </View>
            )}
            {timestamp ? (
              <Text style={styles.timestamp}>{timestamp}</Text>
            ) : null}
          </View>

          {/* Title */}
          <Text style={styles.title}>{entry.title}</Text>

          {/* Body */}
          {entry.body ? (
            <Text style={styles.bodyText} numberOfLines={4}>
              {entry.body}
            </Text>
          ) : null}

          {/* Metadata preview for certain entry types */}
          {entry.metadata && typeof entry.metadata === 'object' && entry.metadata.item_name ? (
            <Text style={styles.metadataItem}>
              🗡️ {entry.metadata.item_name as string}
              {entry.metadata.price_copper ? ` — ${Math.floor((entry.metadata.price_copper as number) / 10000)} GP` : ''}
            </Text>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screen.padding,
    marginVertical: spacing.xs,
    backgroundColor: colours.card.dark,
    borderWidth: 1,
    borderColor: colours.card.darkBorder,
    borderRadius: spacing.card.borderRadius,
  },
  dmOnlyCard: {
    backgroundColor: '#1a0a2e',
    borderColor: 'rgba(75, 22, 120, 0.4)',
  },
  privateCard: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(192, 192, 192, 0.15)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 16, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  entryTypeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 22, 120, 0.5)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    gap: 2,
  },
  dmBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colours.brightGold,
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192, 192, 192, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    gap: 2,
  },
  privateBadgeText: {
    fontSize: 10,
    color: colours.silver,
  },
  timestamp: {
    fontSize: 11,
    color: colours.text.muted,
    marginLeft: 'auto',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colours.text.primary,
    marginTop: 2,
  },
  bodyText: {
    fontSize: 13,
    color: colours.text.secondary,
    marginTop: 4,
    lineHeight: 19,
  },
  metadataItem: {
    fontSize: 12,
    color: colours.text.gold,
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default FeedEntryCard;

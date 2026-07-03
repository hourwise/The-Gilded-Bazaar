import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, Title, Paragraph, Button } from 'react-native-paper';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { feedService, CampaignFeed } from '../services/feedService';
import { campaignService } from '../services/campaignService';
import FeedEntryCard from '../components/feed/FeedEntryCard';
import colours from '../theme/colours';
import spacing from '../theme/spacing';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CampaignFeedScreenProps {
  navigation: any;
  isDM?: boolean;
}

const CampaignFeedScreen: React.FC<CampaignFeedScreenProps> = ({ navigation, isDM = false }) => {
  const [feedEntries, setFeedEntries] = useState<CampaignFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [inCampaign, setInCampaign] = useState(false);

  // Fetch campaign and feed data
  const fetchFeed = useCallback(async () => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user session');

      // Get the user's campaign
      const { data: memberships, error: memberError } = await supabase
        .from('campaign_members')
        .select('campaign_id, campaigns(id, name), role')
        .eq('profile_id', user.id)
        .limit(1)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!memberships?.campaign_id) {
        setInCampaign(false);
        setLoading(false);
        return;
      }

      setCampaignId(memberships.campaign_id);
      setInCampaign(true);

      // Fetch feed entries
      const { data, error: feedError } = await feedService.getFeedForCampaign(memberships.campaign_id);

      if (feedError) throw feedError;
      setFeedEntries(data || []);

    } catch (e: any) {
      console.error('Error fetching feed:', e);
      setError(e.message || 'Failed to load chronicle.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Realtime subscription
  useEffect(() => {
    if (!campaignId) return;

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel(`feed-${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'campaign_feed',
            filter: `campaign_id=eq.${campaignId}`,
          },
          (payload) => {
            setFeedEntries((prev) => [payload.new as CampaignFeed, ...prev]);
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [campaignId]);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeed();
  }, [fetchFeed]);

  // Focus listener to refresh
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFeed();
    });
    return unsubscribe;
  }, [navigation, fetchFeed]);

  const renderItem = ({ item }: { item: CampaignFeed }) => (
    <FeedEntryCard entry={item} isDM={isDM} />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="book-open-page-variant-outline" size={64} color={colours.text.muted} />
        <Title style={styles.emptyTitle}>The Chronicle is Empty</Title>
        <Paragraph style={styles.emptyPara}>
          No events have been recorded yet.{'\n'}
          As you explore shops, make purchases, and adventure, the chronicle will fill with tales of your journey.
        </Paragraph>
      </View>
    );
  };

  // Loading state
  if (loading && feedEntries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colours.brightGold} />
        <Text style={styles.loadingText}>Unfurling the Chronicle...</Text>
      </View>
    );
  }

  // Not in campaign
  if (!inCampaign) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="campfire" size={64} color={colours.text.muted} />
        <Title style={styles.emptyTitle}>No Campaign Found</Title>
        <Paragraph style={styles.emptyPara}>
          Join or create a campaign to view its chronicle.
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('JoinCampaign')}
          style={styles.actionButton}
        >
          Join Campaign
        </Button>
      </View>
    );
  }

  // Error state
  if (error && feedEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colours.errorRed} />
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={fetchFeed} textColor={colours.brightGold}>
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={feedEntries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          feedEntries.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
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
  listContent: {
    paddingVertical: spacing.sm,
  },
  listEmpty: {
    flex: 1,
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
  },
  actionButton: {
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

export default CampaignFeedScreen;

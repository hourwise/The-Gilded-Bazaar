import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Card, Button, TextInput, useTheme } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

interface PurchaseRequestWithDetails {
  id: string;
  campaign_id: string;
  character_id: string;
  shop_inventory_id: string;
  quantity: number;
  price_copper: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_by: string;
  player_characters?: {
    id: string;
    character_name: string;
    gold: number;
    silver: number;
    copper: number;
  };
  shop_inventory?: {
    id: string;
    current_price_copper: number;
    items_library?: {
      name: string;
    };
    shops?: {
      id: string;
      name: string;
    };
  };
}

const PurchaseApprovalScreen = ({ route }: any) => {
  const [purchases, setPurchases] = useState<PurchaseRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const theme = useTheme();

  const campaignId = route.params?.campaignId;

  const fetchPendingPurchases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          player_characters(character_name),
          shop_inventory(
            *,
            items_library(name),
            shops(name)
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPurchases();
  }, [campaignId]);

  const handleApprove = async (purchaseId: string) => {
    try {
      const { data, error } = await supabase.rpc('approve_purchase', {
        p_purchase_request_id: purchaseId,
      });
      if (error) throw error;
      Alert.alert('Success', data?.message || 'Purchase approved');
      fetchPendingPurchases();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleReject = async (purchaseId: string) => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason.');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('reject_purchase', {
        p_purchase_request_id: purchaseId,
        p_reason: rejectReason.trim(),
      });
      if (error) throw error;
      Alert.alert('Rejected', data?.message || 'Purchase rejected');
      setRejectingId(null);
      setRejectReason('');
      fetchPendingPurchases();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const renderItem = ({ item }: { item: PurchaseRequestWithDetails }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{item.player_characters?.character_name || 'Unknown Character'}</Text>
        <Text variant="bodyMedium">Item: {item.shop_inventory?.items_library?.name || 'Unknown Item'}</Text>
        <Text variant="bodySmall">Quantity: {item.quantity}</Text>
        <Text variant="bodySmall">Total: {item.price_copper / 10000} GP</Text>
        <Text variant="bodySmall" style={{ color: '#aaa', marginBottom: 8 }}>
          Shop: {item.shop_inventory?.shops?.name || 'Unknown Shop'}
        </Text>

        {rejectingId === item.id ? (
          <View style={styles.rejectContainer}>
            <TextInput
              label="Rejection reason"
              value={rejectReason}
              onChangeText={setRejectReason}
              mode="outlined"
              style={styles.rejectInput}
              placeholder="Required"
            />
            <View style={styles.rejectButtonRow}>
              <Button mode="outlined" onPress={() => { setRejectingId(null); setRejectReason(''); }}>
                Cancel
              </Button>
              <Button mode="contained" onPress={() => handleReject(item.id)}>
                Confirm Reject
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={() => handleApprove(item.id)} style={styles.approveButton}>
              Approve
            </Button>
            <Button mode="outlined" onPress={() => setRejectingId(item.id)} style={styles.rejectButton}>
              Reject
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={purchases}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending purchase requests.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1c1c' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#2a2a2a', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  approveButton: { flex: 1, marginRight: 8 },
  rejectButton: { flex: 1, marginLeft: 8 },
  rejectContainer: { marginTop: 12 },
  rejectInput: { marginBottom: 8 },
  rejectButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 40, fontSize: 16 },
});

export default PurchaseApprovalScreen;
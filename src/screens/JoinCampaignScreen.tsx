import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';
import { campaignService } from '../services/campaignService';

const JoinCampaignScreen = ({ navigation, route }: any) => {
  const [joinCode, setJoinCode] = useState(route.params?.code || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const theme = useTheme();

  const handleJoin = async () => {
    if (joinCode.length !== 6) {
      setErrorMsg('Please enter a 6-digit campaign code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('You must be logged in to join a campaign.');
        setLoading(false);
        return;
      }

      // Get user's first character to link to campaign
      const { data: characters } = await supabase
        .from('player_characters')
        .select('id')
        .eq('profile_id', user.id)
        .limit(1);

      const characterId = characters?.[0]?.id;

      const { data, error } = await campaignService.joinCampaign(joinCode.toUpperCase(), characterId);

      if (error) {
        setErrorMsg(error.message || 'Failed to join campaign.');
      } else {
        navigation.replace('Shop');
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.title, { color: '#FFD700' }]}>
        Join a Campaign
      </Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code provided by your Dungeon Master to start shopping.
      </Text>

      {errorMsg && (
        <Text style={styles.errorText}>{errorMsg}</Text>
      )}

      <TextInput
        label="Campaign Code"
        value={joinCode}
        onChangeText={(text) => setJoinCode(text.toUpperCase())}
        mode="outlined"
        maxLength={6}
        autoCapitalize="characters"
        style={styles.input}
        placeholder="ABCDEF"
      />

      <Button
        mode="contained"
        onPress={handleJoin}
        loading={loading}
        disabled={loading || joinCode.length !== 6}
        style={styles.button}
      >
        Enter Campaign
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        textColor="#FFD700"
      >
        Cancel
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: '#f5f5dc',
    marginBottom: 32,
    opacity: 0.8,
  },
  input: {
    marginBottom: 20,
    fontSize: 24,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 8,
    marginBottom: 10,
  },
  errorText: {
    color: '#ff8a80',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default JoinCampaignScreen;
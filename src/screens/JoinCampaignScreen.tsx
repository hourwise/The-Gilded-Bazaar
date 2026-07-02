import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

const JoinCampaignScreen = ({ navigation }: any) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleJoin = async () => {
    if (joinCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-digit campaign code.");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // 1. Find the campaign by code
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('join_code', joinCode.toUpperCase())
        .single();

      if (campaignError || !campaign) {
        throw new Error("Campaign not found. Double check the code!");
      }

      // 2. Add player to campaign_members
      const { error: joinError } = await supabase
        .from('campaign_members')
        .insert({
          campaign_id: campaign.id,
          player_id: user.id
        });

      if (joinError) {
        if (joinError.code === '23505') {
          throw new Error("You are already a member of this campaign!");
        }
        throw joinError;
      }

      Alert.alert("Success!", `You have joined ${campaign.name}.`);
      navigation.navigate('Shop'); // Go to the shop now that we have a campaign

    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.gold }]}>
        Join a Campaign
      </Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code provided by your Dungeon Master to start shopping.
      </Text>

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
        textColor={theme.colors.gold}
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
});

export default JoinCampaignScreen;

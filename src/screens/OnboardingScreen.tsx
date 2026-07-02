import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Button,
  TextInput,
  Text,
  Menu,
  useTheme,
} from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

const dndRaces = [
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
  'Dragonborn',
];

const OnboardingScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [displayName, setDisplayName] = useState('');
  const [race, setRace] = useState<string | null>(null);
  const [charismaModifier, setCharismaModifier] = useState('');
  const [persuasionProficiency, setPersuasionProficiency] = useState('');
  const [gold, setGold] = useState('0');
  const [silver, setSilver] = useState('0');
  const [copper, setCopper] = useState('0');
  const [characterName, setCharacterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const theme = useTheme();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const selectRace = (selectedRace: string) => {
    setRace(selectedRace);
    closeMenu();
  };

  const handleSubmit = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No user found');
      setLoading(false);
      return;
    }

    try {
      // Create profile (no is_dm here - roles are per campaign)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Create first character
      const { error: charError } = await supabase
        .from('player_characters')
        .insert({
          profile_id: user.id,
          character_name: characterName || displayName,
          ancestry: race,
          charisma_modifier: parseInt(charismaModifier, 10) || 0,
          persuasion_proficiency: parseInt(persuasionProficiency, 10) || 0,
          gold: parseInt(gold, 10) || 0,
          silver: parseInt(silver, 10) || 0,
          copper: parseInt(copper, 10) || 0,
        });

      if (charError) throw charError;

      console.log('Profile and character created successfully!');
      onComplete?.();
    } catch (e: any) {
      console.error('Error saving profile:', e.message);
      Alert.alert('Error', 'Error saving profile: ' + e.message);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={[styles.title, { color: '#FFD700' }]}>
        Character Details
      </Text>

      <TextInput
        label="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Character Name"
        value={characterName}
        onChangeText={setCharacterName}
        mode="outlined"
        style={styles.input}
      />

      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <Button
            onPress={openMenu}
            mode="outlined"
            icon="chevron-down"
            style={styles.input}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}>
            {race || 'Select a Race'}
          </Button>
        }>
        {dndRaces.map((r) => (
          <Menu.Item key={r} onPress={() => selectRace(r)} title={r} />
        ))}
      </Menu>

      <TextInput
        label="Charisma Modifier (e.g. 3)"
        value={charismaModifier}
        onChangeText={setCharismaModifier}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Persuasion Proficiency (e.g. 2)"
        value={persuasionProficiency}
        onChangeText={setPersuasionProficiency}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      <Text variant="titleMedium" style={{ color: '#FFD700', marginBottom: 10 }}>Starting Wealth</Text>
      <View style={styles.wealthContainer}>
        <TextInput
          label="Gold"
          value={gold}
          onChangeText={setGold}
          keyboardType="numeric"
          mode="outlined"
          style={[styles.input, { flex: 1, marginRight: 4 }]}
        />
        <TextInput
          label="Silver"
          value={silver}
          onChangeText={setSilver}
          keyboardType="numeric"
          mode="outlined"
          style={[styles.input, { flex: 1, marginHorizontal: 4 }]}
        />
        <TextInput
          label="Copper"
          value={copper}
          onChangeText={setCopper}
          keyboardType="numeric"
          mode="outlined"
          style={[styles.input, { flex: 1, marginLeft: 4 }]}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={!displayName || !characterName || loading}
        loading={loading}
        style={styles.button}>
        Enter The Realm
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  wealthContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    height: 50,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between'
  },
  buttonLabel: {
    textAlign: 'left',
    flex: 1,
  }
});

export default OnboardingScreen;
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Button,
  TextInput,
  Text,
  Menu,
  Switch,
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

const OnboardingScreen = ({ onComplete }: { onComplete?: (isDm: boolean) => void }) => {
  const [displayName, setDisplayName] = useState('');
  const [race, setRace] = useState<string | null>(null);
  const [charismaModifier, setCharismaModifier] = useState('');
  const [persuasionProficiency, setPersuasionProficiency] = useState('');
  const [gold, setGold] = useState('0');
  const [silver, setSilver] = useState('0');
  const [copper, setCopper] = useState('0');
  const [isDm, setIsDm] = useState(false);
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

    // Prepare data based on the schema
    const profileData = {
      id: user.id,
      display_name: displayName,
      race: race,
      charisma_modifier: parseInt(charismaModifier, 10) || 0,
      persuasion_proficiency: parseInt(persuasionProficiency, 10) || 0,
      gold: parseInt(gold, 10) || 0,
      silver: parseInt(silver, 10) || 0,
      copper: parseInt(copper, 10) || 0,
      is_dm: isDm,
      updated_at: new Date().toISOString(),
    };

    // Use .upsert() - it updates if it exists, creates if not.
    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (error) {
      console.error('Error saving profile:', error.message);
      alert('Error saving profile: ' + error.message);
    } else {
      console.log('Profile saved successfully!');
      onComplete?.(isDm);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.gold }]}>
        Character Details
      </Text>

      <TextInput
        label="Character Name"
        value={displayName}
        onChangeText={setDisplayName}
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

      <Text variant="titleMedium" style={{ color: theme.colors.gold, marginBottom: 10 }}>Starting Wealth</Text>
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

      {/* DM toggle */}
      <View style={styles.dmToggleRow}>
        <View style={styles.dmToggleText}>
          <Text variant="titleSmall" style={{ color: theme.colors.gold }}>
            I am the Dungeon Master
          </Text>
          <Text style={styles.dmToggleHint}>
            Enables the Merchant Prince console for managing shops and campaigns.
          </Text>
        </View>
        <Switch value={isDm} onValueChange={setIsDm} color={theme.colors.gold} />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={!displayName || loading}
        loading={loading}
        style={styles.button}>
        {isDm ? 'Open the Bazaar' : 'Enter The Realm'}
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
  dmToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(46,8,84,0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    padding: 12,
    marginBottom: 16,
  },
  dmToggleText: {
    flex: 1,
    paddingRight: 12,
  },
  dmToggleHint: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
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

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import {
  MD3DarkTheme as DefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabaseClient';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ShopScreen from './src/screens/ShopScreen';
import JoinCampaignScreen from './src/screens/JoinCampaignScreen';
import DMDashboardScreen from './src/screens/DMDashboardScreen';
import ManageShopScreen from './src/screens/ManageShopScreen';

const highFantasyTheme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2e0854',
    accent: '#ffd700',
    background: '#1c1c1c',
    surface: '#2e0854',
    text: '#f5f5dc',
    onSurface: '#f5f5dc',
    onPrimary: '#ffd700',
    gold: '#ffd700',
  },
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isDm, setIsDm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else {
        setHasProfile(false);
        setIsDm(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('race, is_dm')
      .eq('id', userId)
      .single();

    if (data?.race) {
      setHasProfile(true);
      setIsDm(data.is_dm ?? false);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: '#1c1c1c', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  return (
    <PaperProvider theme={highFantasyTheme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#2e0854" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#2e0854' },
              headerTintColor: '#ffd700',
              headerBackTitle: 'Back',
            }}
          >
            {!session ? (
              // ── Not logged in ──────────────────────────────────────
              <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'The Gilded Bazaar' }} />

            ) : !hasProfile ? (
              // ── Logged in, no character yet ────────────────────────
              <Stack.Screen name="Onboarding" options={{ title: 'Character Setup' }}>
                {props => (
                  <OnboardingScreen
                    {...props}
                    onComplete={(newIsDm: boolean) => {
                      setHasProfile(true);
                      setIsDm(newIsDm);
                    }}
                  />
                )}
              </Stack.Screen>

            ) : isDm ? (
              // ── Dungeon Master screens ─────────────────────────────
              <>
                <Stack.Screen
                  name="DMDashboard"
                  component={DMDashboardScreen}
                  options={{ title: 'Merchant Prince' }}
                />
                <Stack.Screen
                  name="ManageShop"
                  component={ManageShopScreen}
                  options={({ route }: any) => ({ title: route.params?.shopName ?? 'Manage Shop' })}
                />
              </>

            ) : (
              // ── Player screens ─────────────────────────────────────
              <>
                <Stack.Screen
                  name="Shop"
                  component={ShopScreen}
                  options={{ title: 'The Local Market' }}
                />
                <Stack.Screen
                  name="JoinCampaign"
                  component={JoinCampaignScreen}
                  options={{ title: 'Join a Campaign' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

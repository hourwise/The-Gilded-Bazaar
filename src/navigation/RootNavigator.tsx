import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

import paperTheme from '../theme/paperTheme';
import colours from '../theme/colours';
import { RootStackParamList, DMStackParamList, PlayerStackParamList, AuthStackParamList } from './types';

// Auth screens
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// DM screens
import DMDashboardScreen from '../screens/DMDashboardScreen';
import ManageShopScreen from '../screens/ManageShopScreen';
import PurchaseApprovalScreen from '../screens/PurchaseApprovalScreen';

// Player screens
import ShopScreen from '../screens/ShopScreen';
import JoinCampaignScreen from '../screens/JoinCampaignScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const DMStack = createNativeStackNavigator<DMStackParamList>();
const PlayerStack = createNativeStackNavigator<PlayerStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={AuthScreen} />
    </AuthStack.Navigator>
  );
}

function DMNavigator() {
  return (
    <DMStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colours.nightPurple },
        headerTintColor: colours.brightGold,
        headerBackTitle: 'Back',
      }}
    >
      <DMStack.Screen
        name="DMDashboard"
        component={DMDashboardScreen}
        options={{ title: 'Merchant Prince' }}
      />
      <DMStack.Screen
        name="PurchaseApprovals"
        component={PurchaseApprovalScreen}
        options={{ title: 'Purchase Approvals' }}
      />
      <DMStack.Screen
        name="ManageShop"
        component={ManageShopScreen}
        options={({ route }: any) => ({ title: route.params?.shopName ?? 'Manage Shop' })}
      />
    </DMStack.Navigator>
  );
}

function PlayerNavigator() {
  return (
    <PlayerStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colours.nightPurple },
        headerTintColor: colours.brightGold,
        headerBackTitle: 'Back',
      }}
    >
      <PlayerStack.Screen
        name="CampaignHome"
        component={ShopScreen}
        options={{ title: 'The Local Market' }}
      />
      <PlayerStack.Screen
        name="Shop"
        component={ShopScreen}
        options={{ title: 'The Local Market' }}
      />
      <PlayerStack.Screen
        name="JoinCampaign"
        component={JoinCampaignScreen}
        options={{ title: 'Join a Campaign' }}
      />
    </PlayerStack.Navigator>
  );
}

export default function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isDm, setIsDm] = useState(false);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else {
        setLoading(false);
        setInitialising(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else {
        setHasProfile(false);
        setIsDm(false);
        setLoading(false);
        setInitialising(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkProfile(userId: string) {
    try {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setHasProfile(!!profile);

      // Check if user is a DM in any campaign
      const { data: memberships } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('profile_id', userId)
        .in('role', ['owner_dm', 'co_dm'])
        .limit(1);

      setIsDm(!!memberships && memberships.length > 0);
    } catch (e) {
      setHasProfile(false);
      setIsDm(false);
    } finally {
      setLoading(false);
      setInitialising(false);
    }
  }

  if (initialising || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colours.brightGold} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={colours.nightPurple} />
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {!session ? (
              <RootStack.Screen name="Auth" component={AuthNavigator} />
            ) : !hasProfile ? (
              <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : isDm ? (
              <RootStack.Screen name="Main" component={DMNavigator} />
            ) : (
              <RootStack.Screen name="Main" component={PlayerNavigator} />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colours.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
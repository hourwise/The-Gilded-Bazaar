import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type MainStackParamList = {
  DMHome: undefined;
  PlayerHome: undefined;
  ManageShop: { shopId: string; shopName: string };
  PurchaseApprovals: undefined;
  Backpack: { characterId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type DMStackParamList = {
  DMDashboard: undefined;
  CreateShop: undefined;
  ManageShop: { shopId: string; shopName: string };
  PurchaseApprovals: { campaignId: string };
  CampaignFeed: undefined;
  Backpack: { characterId: string };
};

export type PlayerStackParamList = {
  CampaignHome: undefined;
  Shop: { shopId?: string };
  JoinCampaign: undefined;
  Backpack: { characterId: string };
  CampaignFeed: undefined;
};

export type AppNavigationProp = NativeStackScreenProps<RootStackParamList>['navigation'];

export type AuthScreenProps = NativeStackScreenProps<AuthStackParamList>;
export type DMStackScreenProps<T extends keyof DMStackParamList> = NativeStackScreenProps<DMStackParamList, T>;
export type PlayerStackScreenProps<T extends keyof PlayerStackParamList> = NativeStackScreenProps<PlayerStackParamList, T>;
export type MainStackScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<MainStackParamList, T>;
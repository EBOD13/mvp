import { PostResponse } from '../types/feed';

export type RootStackParamList = {
  LoginScreen: undefined;
  SignUpScreen: undefined;
  HomeFeedScreen: undefined;
  DiscoverScreen: undefined;
  MessagesScreen: undefined;
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  OtherUserScreen: { userId: string };
  CreatePostScreen: { post?: PostResponse } | undefined;
  CreatePassionScreen: undefined;
  // Phase 2 additions
  PassionsListScreen: undefined;
  PassionDetailScreen: { passionId: string };
  PhriendsListScreen: undefined;
  SettingsScreen: undefined;
};

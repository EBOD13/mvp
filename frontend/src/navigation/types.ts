import { PostResponse } from '../types/feed';

export type RootStackParamList = {
  // Auth
  LoginScreen: undefined;
  SignUpScreen: undefined;
  // Main
  HomeFeedScreen: undefined;
  DiscoverScreen: undefined;
  MessagesScreen: undefined;
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  SettingsScreen: undefined;
  // Passions
  PassionsListScreen: { userId?: string; username?: string; title?: string } | undefined;
  PassionDetailScreen: { passionId: string };
  CreatePassionScreen: undefined;
  // Social
  PhriendsListScreen: undefined;
  OtherUserScreen: { userId: string };
  // Posts
  CreatePostScreen: { post?: PostResponse } | undefined;
  // Messages (new)
  DmConversationScreen: { otherUserId: string; otherUsername: string };
};
import { PostResponse } from '../types/feed';

export type RootStackParamList = {
  LoginScreen: undefined;
  SignUpScreen: undefined;
  HomeFeedScreen: undefined;
  DiscoverScreen: undefined;
  MessagesScreen: undefined;
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  PassionsListScreen: { userId?: string; username?: string; title?: string } | undefined;
  SettingsScreen: undefined;
  PhriendsListScreen: undefined;
  PassionDetailScreen: { passionId: string };
  OtherUserScreen: { userId: string };
  CreatePostScreen: { post?: PostResponse } | undefined;
  CreatePassionScreen: undefined;
};
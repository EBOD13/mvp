import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  Check,
  MessageCircle,
  UserMinus,
  UserPlus,
  UserX,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { getUserProfile, UserProfile } from '../../api/userApi';
import { phriendApi, PhriendshipStatus } from '../../api/phriendApi';
import { passionApi, PassionListItem } from '../../api/passionApi';
import { postApi } from '../../api/postApi';
import { PostResponse } from '../../types/feed';
import { Avatar } from '../../components/common/Avatar';
import PostCard from '../../components/cards/PostCard';
import CommentSheet from '../../components/common/CommentSheet';

type NavProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'OtherUserScreen'>;

const ACCENT_COLORS = [
  '#8C6AD9', '#5B8DEF', '#E26D6D', '#48A6A7',
  '#E59D5C', '#6D9F71', '#D4848A', '#7B8FA1',
];
const accentColor = (id: string) => {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return ACCENT_COLORS[n % ACCENT_COLORS.length];
};

const StatPill: React.FC<{ label: string; value: number | string }> = ({ label, value }) => {
  const { colors, fontSizes, fontWeights, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: spacing['4'] }}>
      <Text style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary }}>
        {value}
      </Text>
      <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
};

const PassionChip: React.FC<{ item: PassionListItem; onPress: () => void }> = ({ item, onPress }) => {
  const { colors, spacing, fontSizes, radii } = useTheme();
  const color = accentColor(item.id);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color + '18',
        borderRadius: radii.full,
        paddingHorizontal: spacing['3'],
        paddingVertical: spacing['2'],
        borderWidth: 1,
        borderColor: color + '44',
        marginRight: spacing['2'],
        marginBottom: spacing['2'],
      }}
    >
      <View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: color, marginRight: spacing['2'],
      }} />
      <Text style={{ fontSize: fontSizes.sm, color, fontWeight: '600' }} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const OtherUserScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { userId } = route.params;
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [phriendStatus, setPhriendStatus] = useState<PhriendshipStatus>('none');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [passions, setPassions] = useState<PassionListItem[]>([]);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const color = profile ? accentColor(userId) : colors.primary;

  const load = useCallback(async () => {
    try {
      const [profileData, statusData, passionsData, postsData] = await Promise.all([
        getUserProfile(userId),
        phriendApi.getStatus(userId),
        passionApi.getUserPassions(userId),
        postApi.getUserPosts(userId, 0, 20),
      ]);
      setProfile(profileData);
      setPhriendStatus(statusData.data.status);
      setRequestId(statusData.data.request_id);
      setPassions(Array.isArray(passionsData.data) ? passionsData.data : []);
      setPosts(Array.isArray(postsData.data) ? postsData.data : []);
    } catch {
      // profile load failure — back out gracefully
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      await phriendApi.sendRequest(userId);
      setPhriendStatus('pending_sent');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Could not send request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    Alert.alert('Cancel Request', 'Withdraw your phriend request?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Withdraw', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          try {
            await phriendApi.cancelRequest(userId);
            setPhriendStatus('none');
            setRequestId(null);
          } catch { /* ignore */ } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleAccept = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await phriendApi.acceptRequest(requestId);
      setPhriendStatus('accepted');
      setRequestId(null);
      setProfile(prev => prev ? { ...prev, phriends_count: prev.phriends_count + 1 } : prev);
    } catch { /* ignore */ } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await phriendApi.declineRequest(requestId);
      setPhriendStatus('none');
      setRequestId(null);
    } catch { /* ignore */ } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePhriend = () => {
    Alert.alert('Remove Phriend', `Remove ${profile?.display_name ?? 'this user'} from your phriends?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          try {
            await phriendApi.removePhriend(userId);
            setPhriendStatus('none');
            setProfile(prev => prev ? { ...prev, phriends_count: Math.max(0, prev.phriends_count - 1) } : prev);
          } catch { /* ignore */ } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count + 1, is_liked: true } : p));
    try { await postApi.likePost(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count - 1, is_liked: false } : p));
    }
  };

  const handleUnlike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count - 1, is_liked: false } : p));
    try { await postApi.unlikePost(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count + 1, is_liked: true } : p));
    }
  };

  const handleSave = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: true } : p));
    try { await postApi.savePost(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: false } : p));
    }
  };

  const handleUnsave = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: false } : p));
    try { await postApi.unsavePost(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: true } : p));
    }
  };

  // ── Action buttons ────────────────────────────────────────────────────────

  const renderActionButtons = () => {
    const btnBase = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: radii.lg,
      paddingVertical: spacing['3'],
      paddingHorizontal: spacing['4'],
      gap: spacing['2'],
    };

    const messageBtn = (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('DmConversationScreen', {
          otherUserId: userId,
          otherUsername: profile?.username ?? '',
        })}
        style={[btnBase, {
          flex: 1,
          backgroundColor: phriendStatus === 'accepted' ? colors.primary : colors.surface,
          borderWidth: 1.5,
          borderColor: phriendStatus === 'accepted' ? colors.primary : colors.border,
        }]}
      >
        <MessageCircle size={16} color={phriendStatus === 'accepted' ? colors.textInverse : colors.textPrimary} />
        <Text style={{
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.semibold,
          color: phriendStatus === 'accepted' ? colors.textInverse : colors.textPrimary,
        }}>Message</Text>
      </TouchableOpacity>
    );

    if (phriendStatus === 'accepted') {
      return (
        <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRemovePhriend}
            disabled={actionLoading}
            style={[btnBase, {
              flex: 1,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.border,
            }]}
          >
            {actionLoading
              ? <ActivityIndicator size="small" color={colors.textPrimary} />
              : <>
                  <Check size={16} color={colors.success ?? '#4CAF50'} />
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
                    Phriends
                  </Text>
                </>
            }
          </TouchableOpacity>
          {messageBtn}
        </View>
      );
    }

    if (phriendStatus === 'pending_sent') {
      return (
        <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCancelRequest}
            disabled={actionLoading}
            style={[btnBase, {
              flex: 1,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.border,
            }]}
          >
            {actionLoading
              ? <ActivityIndicator size="small" color={colors.textSecondary} />
              : <>
                  <UserX size={16} color={colors.textSecondary} />
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSecondary }}>
                    Request Sent
                  </Text>
                </>
            }
          </TouchableOpacity>
          {messageBtn}
        </View>
      );
    }

    if (phriendStatus === 'pending_received') {
      return (
        <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAccept}
            disabled={actionLoading}
            style={[btnBase, {
              flex: 1,
              backgroundColor: colors.primary,
            }]}
          >
            {actionLoading
              ? <ActivityIndicator size="small" color={colors.textInverse} />
              : <>
                  <Check size={16} color={colors.textInverse} />
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textInverse }}>
                    Accept
                  </Text>
                </>
            }
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDecline}
            disabled={actionLoading}
            style={[btnBase, {
              flex: 1,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.border,
            }]}
          >
            <UserMinus size={16} color={colors.textSecondary} />
            <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSecondary }}>
              Decline
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 'none'
    return (
      <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSendRequest}
          disabled={actionLoading}
          style={[btnBase, { flex: 1, backgroundColor: colors.primary }]}
        >
          {actionLoading
            ? <ActivityIndicator size="small" color={colors.textInverse} />
            : <>
                <UserPlus size={16} color={colors.textInverse} />
                <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textInverse }}>
                  Add Phriend
                </Text>
              </>
          }
        </TouchableOpacity>
        {messageBtn}
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['6'] }}>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing['3'] }}>
            User not found
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary, fontWeight: fontWeights.semibold }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = profile.display_name || profile.username;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Pressable
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          onPress={() => navigation.goBack()}
          style={{ marginRight: spacing['3'] }}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={{
          flex: 1,
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.bold,
          color: colors.textPrimary,
        }} numberOfLines={1}>
          @{profile.username}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['12'] }}>

        {/* ── Colored accent bar ── */}
        <View style={{ height: 4, backgroundColor: color + '55' }} />

        {/* ── Profile header ── */}
        <View style={{ paddingHorizontal: spacing['5'], paddingTop: spacing['5'], paddingBottom: spacing['4'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing['4'] }}>
            {/* Avatar */}
            <View style={{ marginRight: spacing['4'] }}>
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2.5, borderColor: color }}
                />
              ) : (
                <View style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: color + '22',
                  borderWidth: 2.5, borderColor: color,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: fontSizes['3xl'], fontWeight: fontWeights.bold, color }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {profile.is_verified && (
                <View style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: colors.primary,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: colors.background,
                }}>
                  <Check size={12} color={colors.textInverse} />
                </View>
              )}
            </View>

            {/* Stats */}
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingTop: spacing['2'] }}>
              <StatPill label="Passions" value={passions.length} />
              <View style={{ width: 1, height: 40, backgroundColor: colors.border, alignSelf: 'center' }} />
              <StatPill label="Phriends" value={profile.phriends_count} />
            </View>
          </View>

          {/* Name + bio */}
          <Text style={{
            fontSize: fontSizes.xl,
            fontWeight: fontWeights.bold,
            color: colors.textPrimary,
            marginBottom: 2,
          }}>
            {displayName}
          </Text>
          {!!profile.bio && (
            <Text style={{
              fontSize: fontSizes.sm,
              color: colors.textSecondary,
              lineHeight: fontSizes.sm * 1.6,
              marginTop: spacing['1'],
              marginBottom: spacing['2'],
            }}>
              {profile.bio}
            </Text>
          )}

          {/* Member since */}
          <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing['4'] }}>
            Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </Text>

          {/* Action buttons */}
          {renderActionButtons()}
        </View>

        {/* ── Passions ── */}
        {passions.length > 0 && (
          <View style={{
            marginHorizontal: spacing['4'],
            marginBottom: spacing['5'],
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing['4'],
          }}>
            <Text style={{
              fontSize: fontSizes.xs,
              fontWeight: fontWeights.semibold,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: spacing['3'],
            }}>
              Passions  ·  {passions.length}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {passions.map(p => (
                <PassionChip
                  key={p.id}
                  item={p}
                  onPress={() => navigation.navigate('PassionDetailScreen', { passionId: p.id })}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Posts ── */}
        <View style={{ paddingHorizontal: spacing['4'] }}>
          <Text style={{
            fontSize: fontSizes.xs,
            fontWeight: fontWeights.semibold,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: spacing['3'],
          }}>
            Posts{posts.length > 0 ? `  ·  ${posts.length}` : ''}
          </Text>

          {posts.length === 0 ? (
            <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>
              No posts yet.
            </Text>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onUnlike={() => handleUnlike(post.id)}
                onSave={() => handleSave(post.id)}
                onUnsave={() => handleUnsave(post.id)}
                onCommentPress={() => setCommentPostId(post.id)}
                onAuthorPress={() => {}}
              />
            ))
          )}
        </View>
      </ScrollView>

      {commentPostId !== null && (
        <CommentSheet
          postId={commentPostId}
          visible
          onClose={() => setCommentPostId(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default OtherUserScreen;

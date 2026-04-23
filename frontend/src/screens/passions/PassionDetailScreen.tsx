import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Hash, MapPin, Plus, Users, X } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Passion, SubchannelListItem, passionApi } from '../../api/passionApi';

type PassionDetailRoute = RouteProp<RootStackParamList, 'PassionDetailScreen'>;
type NavProp = StackNavigationProp<RootStackParamList>;

// ── Create-channel sheet ───────────────────────────────────────────────────────

const CreateSubchannelSheet: React.FC<{
  visible: boolean;
  passionId: string;
  passionName: string;
  onClose: () => void;
  onCreate: (sc: SubchannelListItem) => void;
}> = ({ visible, passionId, passionName, onClose, onCreate }) => {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setDescription('');
      setError('');
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Channel name is required.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await passionApi.createSubchannel(passionId, trimmed, description.trim() || undefined);
      onCreate(res.data);
      onClose();
    } catch {
      setError('Failed to create channel. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const preview = name.trim()
    ? `#${name.trim().toLowerCase().replace(/\s+/g, '-')}`
    : '#channel-name';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Scrim */}
        <TouchableOpacity
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' } as any}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii['2xl'],
            borderTopRightRadius: radii['2xl'],
            paddingHorizontal: spacing['5'],
            paddingTop: spacing['4'],
            paddingBottom: spacing['8'],
            transform: [{ translateY: slideAnim }],
            ...shadows.lg,
          }}
        >
          {/* Drag handle */}
          <View style={{
            width: 40, height: 4, borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: 'center', marginBottom: spacing['4'],
          }} />

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['5'] }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary }}>
                New Channel
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 }}>
                in {passionName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: spacing['1'] }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Preview badge */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primarySubtle,
            borderRadius: radii.lg,
            paddingHorizontal: spacing['3'],
            paddingVertical: spacing['2'],
            marginBottom: spacing['4'],
            alignSelf: 'flex-start',
          }}>
            <Hash size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.primary }}>
              {preview.slice(1)}
            </Text>
          </View>

          {/* Name input */}
          <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSecondary, marginBottom: spacing['2'], textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Channel Name
          </Text>
          <TextInput
            value={name}
            onChangeText={t => { setName(t); setError(''); }}
            placeholder="e.g. book-of-the-month"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.xl,
              paddingHorizontal: spacing['4'],
              paddingVertical: spacing['3'],
              fontSize: fontSizes.md,
              color: colors.textPrimary,
              borderWidth: 1,
              borderColor: error ? colors.error : colors.border,
              marginBottom: spacing['3'],
            }}
          />

          {/* Description input */}
          <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSecondary, marginBottom: spacing['2'], textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Description <Text style={{ fontWeight: fontWeights.regular, textTransform: 'none' }}>(optional)</Text>
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What's this channel about?"
            placeholderTextColor={colors.textSecondary}
            multiline
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.xl,
              paddingHorizontal: spacing['4'],
              paddingVertical: spacing['3'],
              fontSize: fontSizes.md,
              color: colors.textPrimary,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: spacing['4'],
              minHeight: 72,
              textAlignVertical: 'top',
            }}
          />

          {!!error && (
            <Text style={{ fontSize: fontSizes.sm, color: colors.error, marginBottom: spacing['3'] }}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading || !name.trim()}
            style={{
              backgroundColor: name.trim() ? colors.primary : colors.border,
              borderRadius: radii.xl,
              paddingVertical: spacing['4'],
              alignItems: 'center',
            }}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.textInverse} />
              : <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.textInverse }}>
                  Create Channel
                </Text>
            }
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCreatedDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

const EventCard: React.FC<{ title: string; date: string; location: string }> = ({ title, date, location }) => {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing['4'],
      marginBottom: spacing['3'],
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing['2'] }}>
        {title}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['1'] }}>
        <Calendar size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
        <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>{date}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MapPin size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
        <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>{location}</Text>
      </View>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const PassionDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<PassionDetailRoute>();
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();

  const [passion, setPassion] = useState<Passion | null>(null);
  const [myRole, setMyRole] = useState<string>('not_member');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Channels
  const [subchannels, setSubchannels] = useState<SubchannelListItem[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const isOrganizer = myRole === 'organizer' || myRole === 'admin';
  const isMember = passion?.membershipStatus === 'member';

  const loadPassion = useCallback(async () => {
    setLoading(true);
    try {
      const [supabaseResult, detailResult] = await Promise.all([
        passionApi.getPassionById(route.params.passionId),
        passionApi.getPassionDetail(route.params.passionId).catch(() => null),
      ]);
      setPassion(supabaseResult);
      if (detailResult?.data?.my_role) {
        setMyRole(detailResult.data.my_role);
      } else if (supabaseResult?.membershipStatus === 'member') {
        setMyRole('member');
      }
    } finally {
      setLoading(false);
    }
  }, [route.params.passionId]);

  const loadSubchannels = useCallback(async () => {
    setChannelsLoading(true);
    try {
      const res = await passionApi.getSubchannels(route.params.passionId);
      setSubchannels(res.data);
    } catch {
      // silent — channels section just stays empty
    } finally {
      setChannelsLoading(false);
    }
  }, [route.params.passionId]);

  useEffect(() => {
    loadPassion();
  }, [loadPassion]);

  // Load channels once we know the user is a member
  useEffect(() => {
    if (isMember) loadSubchannels();
  }, [isMember, loadSubchannels]);

  const handlePrimaryAction = useCallback(async () => {
    if (!passion || actionLoading) return;
    setActionLoading(true);
    try {
      let result = null;
      if (passion.membershipStatus === 'not_member' && passion.joinType === 'open') {
        result = await passionApi.joinPassion(passion.id);
      } else if (passion.membershipStatus === 'not_member' && passion.joinType === 'request') {
        result = await passionApi.requestJoin(passion.id);
      }
      if (result) setPassion(result.data as unknown as Passion);
    } finally {
      setActionLoading(false);
    }
  }, [passion, actionLoading]);

  const buttonConfig = useMemo(() => {
    if (!passion) return { label: '', disabled: true, bg: colors.border, textColor: colors.textSecondary };
    if (passion.membershipStatus === 'member')  return { label: 'Joined ✓', disabled: true, bg: colors.surface, textColor: colors.textSecondary };
    if (passion.membershipStatus === 'pending') return { label: 'Request Sent', disabled: true, bg: colors.surface, textColor: colors.textSecondary };
    if (passion.joinType === 'request') return { label: 'Request to Join', disabled: false, bg: colors.primary, textColor: colors.textInverse };
    return { label: 'Join', disabled: false, bg: colors.primary, textColor: colors.textInverse };
  }, [passion, colors]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!passion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, padding: spacing['6'], justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing['3'] }}>
            Passion not found
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: fontSizes.md, color: colors.primary, fontWeight: fontWeights.semibold }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['10'] }} showsVerticalScrollIndicator={false}>

        {/* Back button */}
        <View style={{ paddingHorizontal: spacing['5'], paddingTop: spacing['3'], paddingBottom: spacing['4'] }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}
          >
            <ArrowLeft size={18} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: fontSizes.md, color: colors.primary, fontWeight: fontWeights.semibold }}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cover banner */}
        <ImageBackground
          source={passion.coverUrl ? { uri: passion.coverUrl } : undefined}
          style={{
            height: 180,
            backgroundColor: passion.coverColor,
            marginHorizontal: spacing['5'],
            borderRadius: radii.xl,
            marginBottom: spacing['5'],
            overflow: 'hidden',
          }}
          imageStyle={{ borderRadius: radii.xl }}
        />

        <View style={{ paddingHorizontal: spacing['5'] }}>
          {/* Title + meta */}
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing['3'] }}>
            {passion.name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'], marginBottom: spacing['3'], flexWrap: 'wrap' }}>
            <View style={{
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['1'],
              borderRadius: radii.full,
              backgroundColor: colors.primarySubtle,
            }}>
              <Text style={{ fontSize: fontSizes.sm, color: colors.primary, fontWeight: fontWeights.semibold }}>
                {passion.category}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>
                {passion.memberCount.toLocaleString()} members
              </Text>
            </View>
            <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>
              · Since {formatCreatedDate(passion.createdAt)}
            </Text>
          </View>

          {/* About */}
          <View style={{ marginBottom: spacing['6'] }}>
            <Text style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing['3'] }}>
              About
            </Text>
            <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary, lineHeight: 22 }}>
              {passion.description}
            </Text>
          </View>

          {/* ── Channels section — only for members ── */}
          {isMember && (
            <View style={{ marginBottom: spacing['6'] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['3'] }}>
                <Text style={{ flex: 1, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary }}>
                  Channels
                </Text>
                {isOrganizer && (
                  <TouchableOpacity
                    onPress={() => setShowCreateSheet(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.primarySubtle,
                      borderRadius: radii.full,
                      paddingHorizontal: spacing['3'],
                      paddingVertical: spacing['2'],
                      gap: 4,
                    }}
                    activeOpacity={0.8}
                  >
                    <Plus size={14} color={colors.primary} />
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.primary }}>
                      Add Channel
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {channelsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start' }} />
              ) : subchannels.length === 0 ? (
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.xl,
                  padding: spacing['4'],
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                }}>
                  <Hash size={24} color={colors.border} style={{ marginBottom: spacing['2'] }} />
                  <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center' }}>
                    {isOrganizer
                      ? 'No channels yet. Create the first one!'
                      : 'No channels yet.'}
                  </Text>
                  {isOrganizer && (
                    <TouchableOpacity
                      onPress={() => setShowCreateSheet(true)}
                      style={{ marginTop: spacing['3'] }}
                    >
                      <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.primary }}>
                        + Create a channel
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={{
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radii.xl,
                  overflow: 'hidden',
                  ...shadows.sm,
                }}>
                  {subchannels.map((sc, idx) => (
                    <TouchableOpacity
                      key={sc.id}
                      onPress={() => navigation.navigate('SubchannelScreen', {
                        subchannelId: sc.id,
                        subchannelName: sc.name,
                        passionName: passion.name,
                      })}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: spacing['4'],
                        paddingVertical: spacing['3'] + 2,
                        borderTopWidth: idx > 0 ? 1 : 0,
                        borderTopColor: colors.border,
                      }}
                    >
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: radii.lg,
                        backgroundColor: colors.primarySubtle,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: spacing['3'],
                      }}>
                        <Hash size={15} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
                          {sc.name}
                        </Text>
                        {sc.description ? (
                          <Text numberOfLines={1} style={{ fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 1 }}>
                            {sc.description}
                          </Text>
                        ) : null}
                      </View>
                      <ArrowLeft size={16} color={colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Events */}
          <View style={{ marginBottom: spacing['6'] }}>
            <Text style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing['3'] }}>
              Upcoming Events
            </Text>
            {passion.upcomingEvents.length > 0
              ? passion.upcomingEvents.map(e => (
                  <EventCard key={e.id} title={e.title} date={e.date} location={e.location} />
                ))
              : <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary }}>
                  No upcoming events right now.
                </Text>
            }
          </View>

          {/* Join / status button */}
          <TouchableOpacity
            activeOpacity={buttonConfig.disabled ? 1 : 0.85}
            disabled={buttonConfig.disabled || actionLoading}
            onPress={handlePrimaryAction}
            style={{
              backgroundColor: buttonConfig.bg,
              borderRadius: radii.xl,
              paddingVertical: spacing['4'],
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: buttonConfig.disabled ? 1 : 0,
              borderColor: colors.border,
              marginBottom: spacing['6'],
            }}
          >
            {actionLoading
              ? <ActivityIndicator color={buttonConfig.textColor} />
              : <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: buttonConfig.textColor }}>
                  {buttonConfig.label}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create subchannel sheet */}
      <CreateSubchannelSheet
        visible={showCreateSheet}
        passionId={route.params.passionId}
        passionName={passion.name}
        onClose={() => setShowCreateSheet(false)}
        onCreate={sc => setSubchannels(prev => [...prev, sc].sort((a, b) => a.name.localeCompare(b.name)))}
      />
    </SafeAreaView>
  );
};

export default PassionDetailScreen;

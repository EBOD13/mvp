import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Passion, passionApi } from '../../api/passionApi';

type PassionDetailRoute = RouteProp<RootStackParamList, 'PassionDetailScreen'>;

const formatCreatedDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
};

const EventCard: React.FC<{
  title: string;
  date: string;
  location: string;
}> = ({ title, date, location }) => {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface ?? '#FFFFFF',
        borderRadius: radii?.lg ?? 16,
        padding: spacing['4'],
        marginBottom: spacing['3'],
        borderWidth: 1,
        borderColor: colors.border ?? '#E5E7EB',
      }}
    >
      <Text
        style={{
          fontSize: fontSizes.md,
          fontWeight: fontWeights.semibold,
          color: colors.textPrimary,
          marginBottom: spacing['2'],
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: fontSizes.sm,
          color: colors.textSecondary,
          marginBottom: spacing['1'],
        }}
      >
        🗓 {date}
      </Text>
      <Text
        style={{
          fontSize: fontSizes.sm,
          color: colors.textSecondary,
        }}
      >
        📍 {location}
      </Text>
    </View>
  );
};

const PassionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PassionDetailRoute>();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const [passion, setPassion] = useState<Passion | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPassion = useCallback(async () => {
    setLoading(true);
    try {
      const result = await passionApi.getPassionById(route.params.passionId);
      setPassion(result);
    } finally {
      setLoading(false);
    }
  }, [route.params.passionId]);

  useEffect(() => {
    loadPassion();
  }, [loadPassion]);

  const handlePrimaryAction = useCallback(async () => {
    if (!passion || actionLoading) return;

    setActionLoading(true);
    try {
      let updated: Passion | null = null;

      if (passion.membershipStatus === 'not_member' && passion.joinType === 'open') {
        updated = await passionApi.joinPassion(passion.id);
      }

      if (passion.membershipStatus === 'not_member' && passion.joinType === 'request') {
        updated = await passionApi.requestJoin(passion.id);
      }

      if (updated) {
        setPassion(updated);
      }
    } finally {
      setActionLoading(false);
    }
  }, [passion, actionLoading]);

  const buttonConfig = useMemo(() => {
    if (!passion) {
      return {
        label: '',
        disabled: true,
        backgroundColor: colors.card ?? '#E5E7EB',
        textColor: colors.textSecondary,
      };
    }

    if (passion.membershipStatus === 'member') {
      return {
        label: 'Joined ✓',
        disabled: true,
        backgroundColor: colors.card ?? '#E5E7EB',
        textColor: colors.textSecondary,
      };
    }

    if (passion.membershipStatus === 'pending') {
      return {
        label: 'Request Sent',
        disabled: true,
        backgroundColor: colors.card ?? '#E5E7EB',
        textColor: colors.textSecondary,
      };
    }

    if (passion.joinType === 'request') {
      return {
        label: 'Request to Join',
        disabled: false,
        backgroundColor: colors.primary,
        textColor: '#FFFFFF',
      };
    }

    return {
      label: 'Join',
      disabled: false,
      backgroundColor: colors.primary,
      textColor: '#FFFFFF',
    };
  }, [passion, colors.card, colors.primary, colors.textSecondary]);

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
        <View
          style={{
            flex: 1,
            padding: spacing['6'],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: fontSizes.xl,
              fontWeight: fontWeights.bold,
              color: colors.textPrimary,
              marginBottom: spacing['3'],
            }}
          >
            Passion not found
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              style={{
                fontSize: fontSizes.md,
                color: colors.primary,
                fontWeight: fontWeights.semibold,
              }}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['8'] }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: spacing['5'],
            paddingTop: spacing['3'],
            paddingBottom: spacing['4'],
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text
              style={{
                fontSize: fontSizes.md,
                color: colors.primary,
                fontWeight: fontWeights.semibold,
              }}
            >
              ← Back
            </Text>
          </TouchableOpacity>
        </View>

        <ImageBackground
          source={
            passion.coverUrl
              ? { uri: passion.coverUrl }
              : undefined
          }
          style={{
            height: 180,
            backgroundColor: passion.coverColor,
            marginHorizontal: spacing['5'],
            borderRadius: radii?.xl ?? 20,
            marginBottom: spacing['5'],
            overflow: 'hidden',
          }}
          imageStyle={{
            borderRadius: radii?.xl ?? 20,
          }}
        />

        <View style={{ paddingHorizontal: spacing['5'] }}>
          <Text
            style={{
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.textPrimary,
              marginBottom: spacing['3'],
            }}
          >
            {passion.name}
          </Text>

          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['1'],
              borderRadius: 999,
              backgroundColor: colors.card ?? '#F3F4F6',
              marginBottom: spacing['3'],
            }}
          >
            <Text
              style={{
                fontSize: fontSizes.sm,
                color: colors.textSecondary,
                fontWeight: fontWeights.medium,
              }}
            >
              {passion.category}
            </Text>
          </View>

          <Text
            style={{
              fontSize: fontSizes.sm,
              color: colors.textSecondary,
              marginBottom: spacing['2'],
            }}
          >
            Created: {formatCreatedDate(passion.createdAt)}
          </Text>

          <Text
            style={{
              fontSize: fontSizes.md,
              color: colors.textPrimary,
              marginBottom: spacing['6'],
            }}
          >
            👥 {passion.memberCount.toLocaleString()} active members
          </Text>

          <View style={{ marginBottom: spacing['6'] }}>
            <Text
              style={{
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                color: colors.textPrimary,
                marginBottom: spacing['3'],
              }}
            >
              About
            </Text>

            <Text
              style={{
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 22,
              }}
            >
              {passion.description}
            </Text>
          </View>

          <View style={{ marginBottom: spacing['6'] }}>
            <Text
              style={{
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                color: colors.textPrimary,
                marginBottom: spacing['3'],
              }}
            >
              Upcoming Events
            </Text>

            {passion.upcomingEvents.length > 0 ? (
              passion.upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  date={event.date}
                  location={event.location}
                />
              ))
            ) : (
              <Text
                style={{
                  fontSize: fontSizes.md,
                  color: colors.textSecondary,
                }}
              >
                No upcoming events right now.
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={buttonConfig.disabled ? 1 : 0.85}
            disabled={buttonConfig.disabled || actionLoading}
            onPress={handlePrimaryAction}
            style={{
              backgroundColor: buttonConfig.backgroundColor,
              borderRadius: radii?.xl ?? 18,
              paddingVertical: spacing['4'],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing['6'],
            }}
          >
            {actionLoading ? (
              <ActivityIndicator color={buttonConfig.textColor} />
            ) : (
              <Text
                style={{
                  fontSize: fontSizes.md,
                  fontWeight: fontWeights.bold,
                  color: buttonConfig.textColor,
                }}
              >
                {buttonConfig.label}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PassionDetailScreen;
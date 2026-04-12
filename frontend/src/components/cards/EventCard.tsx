// src/components/cards/EventCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

// ---------------------------------------------------------------------------
// Hardcoded dummy data — no props or API calls needed yet
// ---------------------------------------------------------------------------
const event = {
  title: 'Downtown Photo Walk',
  passionName: 'Urban Photography',
  date: 'Saturday, March 28',
  time: '10:00 AM',
  location: 'Central Park South Entrance',
  attendeeCount: 34,
  isRsvped: false,
};

// ---------------------------------------------------------------------------
// EventCard
// ---------------------------------------------------------------------------
const EventCard: React.FC = () => {
  const { colors, spacing, fontSizes, fontWeights, lineHeights, radii, shadows } = useTheme();

  const s = {
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      marginHorizontal: spacing['4'],
      marginVertical: spacing['2'],
      padding: spacing['4'],
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.md,
    },
    badge: {
      alignSelf: 'flex-start' as const,
      backgroundColor: colors.primarySubtle,
      borderRadius: radii.full,
      paddingHorizontal: spacing['3'],
      paddingVertical: spacing['1'],
      marginBottom: spacing['2'],
    },
    badgeText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      letterSpacing: 0.3,
    },
    title: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: colors.textPrimary,
      lineHeight: fontSizes['2xl'] * lineHeights.tight,
      marginBottom: spacing['3'],
    },
    metaSection: {
      gap: spacing['2'],
      marginBottom: spacing['4'],
    },
    metaRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing['2'],
    },
    metaIcon: {
      fontSize: fontSizes.md,
      width: 20,
      textAlign: 'center' as const,
    },
    metaText: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
      color: colors.textSecondary,
      flex: 1,
    },
    metaTimeSep: {
      color: colors.textDisabled,
    },
    footer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing['3'],
    },
    attendeeRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing['1'],
    },
    attendeeIcon: {
      fontSize: fontSizes.md,
    },
    attendeeCount: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.textSecondary,
    },
    rsvpButton: {
      backgroundColor: colors.primary,
      borderRadius: radii.full,
      paddingHorizontal: spacing['6'],
      paddingVertical: spacing['2'],
    },
    rsvpButtonDone: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rsvpButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.textInverse,
      letterSpacing: 0.3,
    },
    rsvpButtonTextDone: {
      color: colors.textSecondary,
    },
  };

  return (
    <View style={s.card}>
      {/* ── Passion badge ───────────────────────────────────────────────── */}
      <View style={s.badge}>
        <Text style={s.badgeText}># {event.passionName}</Text>
      </View>

      {/* ── Event title ─────────────────────────────────────────────────── */}
      <Text style={s.title}>{event.title}</Text>

      {/* ── Meta rows: date/time + location ─────────────────────────────── */}
      <View style={s.metaSection}>
        <View style={s.metaRow}>
          <Text style={s.metaIcon}>📅</Text>
          <Text style={s.metaText}>
            {event.date}
            <Text style={s.metaTimeSep}>  ·  </Text>
            {event.time}
          </Text>
        </View>

        <View style={s.metaRow}>
          <Text style={s.metaIcon}>📍</Text>
          <Text style={s.metaText}>{event.location}</Text>
        </View>
      </View>

      {/* ── Footer: attendee count + RSVP button ────────────────────────── */}
      <View style={s.footer}>
        <View style={s.attendeeRow}>
          <Text style={s.attendeeIcon}>🙋</Text>
          <Text style={s.attendeeCount}>{event.attendeeCount} going</Text>
        </View>

        <TouchableOpacity
          onPress={() => {}}
          style={[s.rsvpButton, event.isRsvped && s.rsvpButtonDone]}
          activeOpacity={0.75}
        >
          <Text style={[s.rsvpButtonText, event.isRsvped && s.rsvpButtonTextDone]}>
            {event.isRsvped ? 'Going ✓' : 'RSVP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventCard;

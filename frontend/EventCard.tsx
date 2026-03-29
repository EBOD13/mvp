// src/components/cards/EventCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography, radii, shadows } from '../../theme';

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
  return (
    <View style={styles.card}>
      {/* ── Passion badge ───────────────────────────────────────────────── */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}># {event.passionName}</Text>
      </View>

      {/* ── Event title ─────────────────────────────────────────────────── */}
      <Text style={styles.title}>{event.title}</Text>

      {/* ── Meta rows: date/time + location ─────────────────────────────── */}
      <View style={styles.metaSection}>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>
            {event.date}
            <Text style={styles.metaTimeSep}>  ·  </Text>
            {event.time}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText}>{event.location}</Text>
        </View>
      </View>

      {/* ── Footer: attendee count + RSVP button ────────────────────────── */}
      <View style={styles.footer}>
        <View style={styles.attendeeRow}>
          <Text style={styles.attendeeIcon}>🙋</Text>
          <Text style={styles.attendeeCount}>{event.attendeeCount} going</Text>
        </View>

        <TouchableOpacity
          onPress={() => {}}
          style={[
            styles.rsvpButton,
            event.isRsvped && styles.rsvpButtonDone,
          ]}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.rsvpButtonText,
              event.isRsvped && styles.rsvpButtonTextDone,
            ]}
          >
            {event.isRsvped ? 'Going ✓' : 'RSVP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles — all values from theme tokens
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },

  // Passion badge
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.badgeBg,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.badgeText,
    letterSpacing: 0.3,
  },

  // Title
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },

  // Meta rows
  metaSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaIcon: {
    fontSize: typography.size.base,
    width: 20,
    textAlign: 'center',
  },
  metaText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    flex: 1,
  },
  metaTimeSep: {
    color: colors.textTertiary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  attendeeIcon: {
    fontSize: typography.size.base,
  },
  attendeeCount: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },

  // RSVP button
  rsvpButton: {
    backgroundColor: colors.buttonRsvp,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  rsvpButtonDone: {
    backgroundColor: colors.buttonRsvped,
  },
  rsvpButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textOnPrimary,
    letterSpacing: 0.3,
  },
  rsvpButtonTextDone: {
    color: colors.buttonJoinedText,
  },
});

export default EventCard;
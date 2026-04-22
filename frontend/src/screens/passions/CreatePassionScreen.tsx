import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft, Globe, Lock, Unlock, Users } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { passionApi } from '../../api/passionApi';

type Nav = StackNavigationProp<RootStackParamList, 'CreatePassionScreen'>;

const CATEGORIES = [
  'Music', 'Sports', 'Art & Design', 'Technology', 'Gaming',
  'Food & Drink', 'Travel', 'Books', 'Film & TV', 'Fashion',
  'Fitness', 'Photography', 'Science', 'Business', 'Other',
];

const COVER_COLORS = [
  '#8C6AD9', '#5B8DEF', '#E26D6D', '#48A6A7',
  '#E59D5C', '#6D9F71', '#D4848A', '#7B8FA1',
  '#C07BC0', '#5BA5A5',
];

const CreatePassionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('');
  const [visibility,  setVisibility]  = useState<'public' | 'private'>('public');
  const [joinType,    setJoinType]    = useState<'open' | 'request'>('open');
  const [coverColor,  setCoverColor]  = useState(COVER_COLORS[0]);
  const [submitting,  setSubmitting]  = useState(false);

  const canSubmit = name.trim().length > 0 && category.length > 0 && !submitting;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await passionApi.createPassion({
        name: name.trim(),
        description: description.trim(),
        category,
        visibility,
        join_type: joinType,
        cover_url: null,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to create passion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const label = (text: string) => (
    <Text style={{
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing['2'],
    }}>
      {text}
    </Text>
  );

  const fieldStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Header ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
            New Passion
          </Text>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={!canSubmit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {submitting
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={{
                  fontSize: fontSizes.md,
                  fontWeight: fontWeights.semibold,
                  color: canSubmit ? colors.primary : colors.textDisabled,
                }}>
                  Create
                </Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: spacing['5'], gap: spacing['5'] }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Cover color preview ── */}
          <View style={{
            height: 120,
            borderRadius: radii.lg,
            backgroundColor: coverColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing['1'],
          }}>
            <Users size={40} color="rgba(255,255,255,0.7)" />
            {name.trim() ? (
              <Text style={{
                color: '#fff',
                fontWeight: fontWeights.bold,
                fontSize: fontSizes.lg,
                marginTop: spacing['2'],
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                {name.trim()}
              </Text>
            ) : null}
          </View>

          {/* ── Color picker ── */}
          <View>
            {label('Cover Color')}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
              {COVER_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setCoverColor(color)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: color,
                    borderWidth: coverColor === color ? 3 : 0,
                    borderColor: colors.textPrimary,
                  }}
                />
              ))}
            </View>
          </View>

          {/* ── Name ── */}
          <View>
            {label('Passion Name *')}
            <TextInput
              style={fieldStyle}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Jazz Lovers, Trail Runners…"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="words"
              maxLength={80}
              returnKeyType="next"
            />
            <Text style={{ fontSize: fontSizes.xs, color: colors.textDisabled, marginTop: spacing['1'], textAlign: 'right' }}>
              {name.length}/80
            </Text>
          </View>

          {/* ── Description ── */}
          <View>
            {label('Description')}
            <TextInput
              style={[fieldStyle, { minHeight: 90, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="What is this passion about?"
              placeholderTextColor={colors.textDisabled}
              multiline
              maxLength={400}
            />
            <Text style={{ fontSize: fontSizes.xs, color: colors.textDisabled, marginTop: spacing['1'], textAlign: 'right' }}>
              {description.length}/400
            </Text>
          </View>

          {/* ── Category ── */}
          <View>
            {label('Category *')}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
              {CATEGORIES.map(cat => {
                const active = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      paddingHorizontal: spacing['3'],
                      paddingVertical: spacing['2'],
                      borderRadius: radii.full,
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: active ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={{
                      fontSize: fontSizes.sm,
                      fontWeight: active ? fontWeights.semibold : fontWeights.regular,
                      color: active ? '#fff' : colors.textSecondary,
                    }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Visibility ── */}
          <View>
            {label('Visibility')}
            <View style={{
              flexDirection: 'row',
              backgroundColor: colors.surface,
              borderRadius: radii.full,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 3,
            }}>
              {([
                { value: 'public',  Icon: Globe,  text: 'Public'  },
                { value: 'private', Icon: Lock,   text: 'Private' },
              ] as const).map(({ value, Icon, text }) => {
                const active = visibility === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setVisibility(value)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing['1'],
                      paddingVertical: spacing['2'],
                      borderRadius: radii.full,
                      backgroundColor: active ? colors.primary : 'transparent',
                    }}
                  >
                    <Icon size={14} color={active ? '#fff' : colors.textSecondary} />
                    <Text style={{
                      fontSize: fontSizes.sm,
                      fontWeight: fontWeights.medium,
                      color: active ? '#fff' : colors.textSecondary,
                    }}>
                      {text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{ fontSize: fontSizes.xs, color: colors.textDisabled, marginTop: spacing['1'] }}>
              {visibility === 'public' ? 'Anyone can find and view this passion.' : 'Only members can see this passion.'}
            </Text>
          </View>

          {/* ── Join type ── */}
          <View>
            {label('Who Can Join')}
            <View style={{
              flexDirection: 'row',
              backgroundColor: colors.surface,
              borderRadius: radii.full,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 3,
            }}>
              {([
                { value: 'open',    Icon: Unlock, text: 'Open'    },
                { value: 'request', Icon: Users,  text: 'Request' },
              ] as const).map(({ value, Icon, text }) => {
                const active = joinType === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setJoinType(value)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing['1'],
                      paddingVertical: spacing['2'],
                      borderRadius: radii.full,
                      backgroundColor: active ? colors.primary : 'transparent',
                    }}
                  >
                    <Icon size={14} color={active ? '#fff' : colors.textSecondary} />
                    <Text style={{
                      fontSize: fontSizes.sm,
                      fontWeight: fontWeights.medium,
                      color: active ? '#fff' : colors.textSecondary,
                    }}>
                      {text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{ fontSize: fontSizes.xs, color: colors.textDisabled, marginTop: spacing['1'] }}>
              {joinType === 'open'
                ? 'Anyone can join immediately.'
                : 'Members must be approved before joining.'}
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePassionScreen;

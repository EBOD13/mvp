import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { NAV_HEIGHT } from './BottomNavBar';

export type FloatingActionButtonProps = {
  visible: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
};

type NavProp = StackNavigationProp<RootStackParamList>;

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  visible,
  onClose,
  position = 'right',
}) => {
  const navigation = useNavigation<NavProp>();
  const { colors, spacing, radii, shadows, textVariants } = useTheme();

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const option1Anim = useRef(new Animated.Value(0)).current;
  const option2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.stagger(80, [
          Animated.spring(option1Anim, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(option2Anim, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(option1Anim,    { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(option2Anim,    { toValue: 0, duration: 110, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, overlayOpacity, option1Anim, option2Anim]);

  const makeOptionStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  });

  const optionButtonStyle = {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const horizontalStyle = position === 'right'
    ? { right: spacing['5'] }
    : { left: spacing['5'] };

  return (
    <View
      style={[StyleSheet.absoluteFillObject, { zIndex: 100 }]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      {/* Semi-transparent overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'rgba(0,0,0,0.45)', opacity: overlayOpacity },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Options — expand upward above the nav bar */}
      <View
        style={[
          {
            position: 'absolute',
            bottom: NAV_HEIGHT + spacing['3'],
            gap: spacing['3'],
            alignItems: position === 'right' ? 'flex-end' : 'flex-start',
          },
          horizontalStyle,
        ]}
        pointerEvents="box-none"
      >
        {/* New Group (top) */}
        <Animated.View style={makeOptionStyle(option2Anim)}>
          <TouchableOpacity
            style={[optionButtonStyle, shadows.md]}
            onPress={() => {
              onClose();
              navigation.navigate('CreatePassionScreen');
            }}
            activeOpacity={0.85}
          >
            <Text style={[textVariants.button, { color: colors.textInverse }]}>
              New Group
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* New Post (bottom, closer to nav) */}
        <Animated.View style={makeOptionStyle(option1Anim)}>
          <TouchableOpacity
            style={[optionButtonStyle, shadows.md]}
            onPress={() => {
              onClose();
              navigation.navigate('CreatePostScreen');
            }}
            activeOpacity={0.85}
          >
            <Text style={[textVariants.button, { color: colors.textInverse }]}>
              New Post
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default FloatingActionButton;

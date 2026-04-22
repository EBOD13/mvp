import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { WholeFruitSVG, CutFruitSVG } from './PassionFruitSVGs';

// ─────────────────────────────────────────────────────────────────────────────
// Animated PassionFruitLike
// Press to like → squish → slash sweeps across → cut fruit springs in
// ─────────────────────────────────────────────────────────────────────────────
interface PassionFruitLikeProps {
  liked: boolean;
  onPress: () => void;
  size?: number;
}

const PassionFruitLike: React.FC<PassionFruitLikeProps> = ({
  liked,
  onPress,
  size = 24,
}) => {
  const likeAnim      = useRef(new Animated.Value(liked ? 1 : 0)).current;
  const slashProgress = useRef(new Animated.Value(0)).current;
  const scaleAnim     = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      likeAnim.setValue(liked ? 1 : 0);
      return;
    }

    if (liked) {
      slashProgress.setValue(0);
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.72, duration: 90, useNativeDriver: true }),
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1.22, friction: 5, tension: 160, useNativeDriver: true }),
          Animated.timing(slashProgress, { toValue: 1, duration: 230, useNativeDriver: true }),
          Animated.timing(likeAnim, { toValue: 1, duration: 210, delay: 90, useNativeDriver: true }),
        ]),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 280, useNativeDriver: true }),
      ]).start(() => slashProgress.setValue(0));
    } else {
      Animated.parallel([
        Animated.timing(likeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [liked]); // eslint-disable-line react-hooks/exhaustive-deps

  const wholeOpacity = likeAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 0, 0] });
  const cutOpacity   = likeAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });
  const cutScale     = likeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  const slashTranslateX = slashProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 2, size * 2],
  });
  const slashOpacity = slashProgress.interpolate({
    inputRange: [0, 0.05, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Pressable onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
          {/* Whole fruit */}
          <Animated.View style={{ position: 'absolute', width: size, height: size, opacity: wholeOpacity }}>
            <WholeFruitSVG size={size} />
          </Animated.View>

          {/* Cut fruit */}
          <Animated.View
            style={{ position: 'absolute', width: size, height: size, opacity: cutOpacity, transform: [{ scale: cutScale }] }}
          >
            <CutFruitSVG size={size} />
          </Animated.View>

          {/* Slash line sweeping left → right */}
          <Animated.View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: slashOpacity, transform: [{ translateX: slashTranslateX }] }}
            pointerEvents="none"
          >
            <View style={{ position: 'absolute', top: size / 2 - 2, left: -size, width: size * 3, height: 4, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 2, transform: [{ rotate: '35deg' }] }} />
            <View style={{ position: 'absolute', top: size / 2 + 3, left: -size, width: size * 3, height: 2, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 1, transform: [{ rotate: '35deg' }] }} />
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default PassionFruitLike;

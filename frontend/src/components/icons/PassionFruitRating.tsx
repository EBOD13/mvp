import React from 'react';
import { View, Pressable } from 'react-native';
import { WholeFruitSVG, CutFruitSVG } from './PassionFruitSVGs';

interface PassionFruitRatingProps {
  value: number;                      // 0–5; 0 = nothing selected
  onChange?: (rating: number) => void; // omit for display-only (read-only)
  size?: number;                       // icon size in px, default 26
  gap?: number;                        // gap between fruits, default 6
}

const PassionFruitRating: React.FC<PassionFruitRatingProps> = ({
  value,
  onChange,
  size = 26,
  gap = 6,
}) => {
  const readonly = onChange === undefined;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;

        if (readonly) {
          return (
            <View key={n} style={{ opacity: filled ? 1 : 0.25 }}>
              {filled ? <CutFruitSVG size={size} /> : <WholeFruitSVG size={size} />}
            </View>
          );
        }

        return (
          <Pressable
            key={n}
            onPress={() => {
              // Tapping the already-selected last fruit clears the rating
              onChange(n === value ? 0 : n);
            }}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : filled ? 1 : 0.35 })}
          >
            {filled ? <CutFruitSVG size={size} /> : <WholeFruitSVG size={size} />}
          </Pressable>
        );
      })}
    </View>
  );
};

export default PassionFruitRating;

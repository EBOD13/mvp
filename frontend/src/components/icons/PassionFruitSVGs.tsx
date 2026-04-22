import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export const SEED_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// ── Whole (uncut) passion fruit ───────────────────────────────────────────────
export const WholeFruitSVG: React.FC<{ size: number; gray?: boolean }> = ({ size, gray }) => {
  if (gray) {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Circle cx="16" cy="17" r="13.5" fill="none" stroke="#AAAAAA" strokeWidth="2" />
        <Path d="M16 5 Q17.5 2.5 19.5 3.5 Q18.5 5.5 16 5.5 Z" fill="none" stroke="#AAAAAA" strokeWidth="1.2" strokeLinejoin="round" />
        <Path d="M15.5 5.5 L15.5 8.5" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx="16" cy="17" r="13.5" fill="#8B1A6E" />
      <Circle cx="16" cy="17" r="13.5" fill="none" stroke="#6A1254" strokeWidth="1.5" />
      <Ellipse
        cx="10.5" cy="11.5" rx="4.2" ry="2.6"
        fill="rgba(255,255,255,0.22)"
        transform="rotate(-35, 10.5, 11.5)"
      />
      <Circle cx="20" cy="10" r="1.2" fill="rgba(255,255,255,0.12)" />
      <Path d="M16 5 Q17.5 2.5 19.5 3.5 Q18.5 5.5 16 5.5 Z" fill="#3D7A2C" />
      <Path d="M15.5 5.5 L15.5 8.5" stroke="#3D7A2C" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
};

// ── Cut (cross-section) passion fruit ────────────────────────────────────────
export const CutFruitSVG: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="15.5" fill="#8B1A6E" />
    <Circle cx="16" cy="16" r="13" fill="#C94E78" />
    <Circle cx="16" cy="16" r="11" fill="#F0DEB8" />
    <Circle cx="16" cy="16" r="9" fill="#F5C030" />
    {SEED_ANGLES.map((angle) => {
      const rad = (angle * Math.PI) / 180;
      const cx = parseFloat((16 + 5.8 * Math.cos(rad)).toFixed(2));
      const cy = parseFloat((16 + 5.8 * Math.sin(rad)).toFixed(2));
      return (
        <G key={angle}>
          <Ellipse
            cx={cx} cy={cy} rx="2" ry="2.8"
            fill="#E07A2E"
            transform={`rotate(${angle + 90}, ${cx}, ${cy})`}
          />
          <Circle cx={cx} cy={cy} r="0.85" fill="#3A5E1F" />
        </G>
      );
    })}
    <Circle cx="16" cy="16" r="1.3" fill="#E07A2E" />
  </Svg>
);

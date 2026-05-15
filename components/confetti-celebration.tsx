import React, { useEffect, useState } from 'react';
import { View, Animated, Easing } from 'react-native';

interface ConfettiPieceProps {
  delay: number;
  duration: number;
  colors: string[];
}

function ConfettiPiece({ delay, duration, colors }: ConfettiPieceProps) {
  const animatedValue = new Animated.Value(0);
  const color = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * 200 - 100;
  const randomRotation = Math.random() * 720;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 600],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, randomX],
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${randomRotation}deg`],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        transform: [
          { translateY },
          { translateX },
          { rotate },
        ],
        opacity,
      }}
    />
  );
}

interface ConfettiCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

/**
 * Confetti celebration animation component.
 * Displays falling confetti pieces when triggered.
 */
export function ConfettiCelebration({ isVisible, onComplete }: ConfettiCelebrationProps) {
  const [pieces, setPieces] = useState<number[]>([]);

  const colors = ['#1A6B5A', '#3ECFA0', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6'];
  const duration = 2500;

  useEffect(() => {
    if (isVisible) {
      // Create 30 confetti pieces
      setPieces(Array.from({ length: 30 }, (_, i) => i));

      // Call onComplete after animation finishes
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration + 500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible && pieces.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 999,
        overflow: 'hidden',
      }}
    >
      {pieces.map((i) => (
        <ConfettiPiece
          key={i}
          delay={Math.random() * 200}
          duration={duration}
          colors={colors}
        />
      ))}
    </View>
  );
}

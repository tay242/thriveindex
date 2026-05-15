import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

interface ConfettiCelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

/**
 * Confetti celebration animation component.
 * Displays a celebratory confetti animation when triggered.
 */
export function ConfettiCelebration({ isVisible, onComplete }: ConfettiCelebrationProps) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isVisible && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [isVisible]);

  if (!isVisible) {
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
      }}
    >
      <LottieView
        ref={lottieRef}
        source={require('@/assets/animations/confetti.json')}
        autoPlay={false}
        loop={false}
        onAnimationFinish={onComplete}
        style={{ flex: 1 }}
      />
    </View>
  );
}

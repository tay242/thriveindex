import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface StreakCelebrationProps {
  visible: boolean;
  streak: number;
  onClose: () => void;
  colors: any;
}

export function StreakCelebration({ visible, streak, onClose, colors }: StreakCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const isMilestone = streak === 7 || streak === 30 || streak === 100;
  const milestoneMessages: Record<number, string> = {
    7: '🔥 One Week Strong!',
    30: '💪 One Month Unstoppable!',
    100: '👑 100 Days of Greatness!',
  };

  const message = milestoneMessages[streak] || `${streak} Day Streak!`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
        {/* Confetti effect (simulated with animated particles) */}
        {visible && <ConfettiEffect />}

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Trophy Icon */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol name="trophy.fill" size={60} color="#fff" />
          </View>

          {/* Message */}
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: colors.foreground }}>
              {message}
            </Text>
            <Text style={{ fontSize: 16, color: colors.muted, textAlign: 'center', maxWidth: 280 }}>
              {streak === 7 && 'You\'re building an incredible habit. Keep it up!'}
              {streak === 30 && 'A full month of consistency. You\'re unstoppable!'}
              {streak === 100 && 'Three months of dedication. You\'re a wellbeing champion!'}
              {![7, 30, 100].includes(streak) && `You've completed ${streak} days in a row. Amazing!`}
            </Text>
          </View>

          {/* Stats */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              width: 280,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 48, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>
              {streak}
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>Days in a row</Text>
          </View>

          {/* Close Button */}
          <Pressable
            style={({ pressed }) => [
              {
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.primary,
              },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onClose}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
              Keep Going 💪
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Simple confetti particle animation
function ConfettiEffect() {
  return (
    <View style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiParticle key={i} delay={i * 30} />
      ))}
    </View>
  );
}

function ConfettiParticle({ delay }: { delay: number }) {
  const posX = useRef(new Animated.Value(width / 2)).current;
  const posY = useRef(new Animated.Value(height / 2)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const randomX = Math.random() * 400 - 200;
    const randomY = Math.random() * 600;
    const duration = 2000 + Math.random() * 1000;

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(posX, {
          toValue: randomX,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(posY, {
          toValue: randomY,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: randomColor,
        transform: [{ translateX: posX }, { translateY: posY }],
        opacity,
      }}
    />
  );
}

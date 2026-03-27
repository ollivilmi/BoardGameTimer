import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircularTimer } from '@/components/CircularTimer';
import { BACKGROUND_COLORS } from '@/constants/timer-config';
import { useTimer } from '@/hooks/use-timer';

const STATUS_INDEX = { idle: 0, running: 1, low: 2, 'overtime-idle': 3, 'overtime-running': 4 } as const;
const BG_VALUES = [
  BACKGROUND_COLORS.idle,
  BACKGROUND_COLORS.running,
  BACKGROUND_COLORS.low,
  BACKGROUND_COLORS['overtime-idle'],
  BACKGROUND_COLORS['overtime-running'],
];

function formatTurnTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0
    ? `${m}:${String(sec).padStart(2, '0')}`
    : `0:${String(sec).padStart(2, '0')}`;
}

export default function TimerScreen() {
  const { totalSeconds: totalParam, incrementSeconds: incrementParam } =
    useLocalSearchParams<{ totalSeconds: string; incrementSeconds: string }>();

  const totalSeconds = parseInt(totalParam ?? '1200', 10);
  const incrementSeconds = parseInt(incrementParam ?? '0', 10);

  const { remainingSeconds, currentTurnElapsed, turnHistory, overtimeSeconds, status, handleScreenPress } = useTimer(
    totalSeconds,
    incrementSeconds,
  );

  const historyScrollRef = useRef<ScrollView>(null);

  // Auto-scroll history to end when a new turn is added
  useEffect(() => {
    if (turnHistory.length > 0) {
      historyScrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [turnHistory.length]);

  // Animated background color
  const bgProgress = useSharedValue(0);
  useEffect(() => {
    bgProgress.value = withTiming(STATUS_INDEX[status], { duration: 350 });
  }, [status]);

  const animatedBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(bgProgress.value, [0, 1, 2, 3, 4], BG_VALUES),
  }));

  function confirmExit() {
    Alert.alert(
      'Exit Timer',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.replace('/') },
      ],
    );
  }

  // Hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit();
      return true;
    });
    return () => sub.remove();
  }, []);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => handleScreenPress());

  const progress = totalSeconds > 0 ? Math.min(remainingSeconds / totalSeconds, 1) : 0;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedBg]}>
      <GestureDetector gesture={tapGesture}>
        <SafeAreaView style={styles.safe}>
          {/* Circle timer */}
          <View style={styles.timerArea}>
            <CircularTimer
              progress={progress}
              remainingSeconds={remainingSeconds}
              turnElapsedSeconds={currentTurnElapsed}
              overtimeSeconds={overtimeSeconds}
              status={status}
            />
          </View>

          {/* Turn history */}
          {turnHistory.length > 0 && (
            <View style={styles.historyWrap}>
              <Text style={styles.historyLabel}>Previous turns</Text>
              <ScrollView
                ref={historyScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.historyScroll}
              >
                {turnHistory.map((secs, i) => (
                  <View key={i} style={styles.turnChip}>
                    <Text style={styles.turnChipNum}>{i + 1}</Text>
                    <Text style={styles.turnChipTime}>{formatTurnTime(secs)}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </GestureDetector>

      {/* Exit button — outside GestureDetector */}
      <Pressable style={styles.exitButton} onPress={confirmExit} hitSlop={20}>
        <Text style={styles.exitText}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  timerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyWrap: {
    paddingBottom: 24,
    gap: 10,
  },
  historyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
  },
  historyScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  turnChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 56,
  },
  turnChipNum: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  turnChipTime: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    fontVariant: ['tabular-nums'],
  },
  exitButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
  },
  exitText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});

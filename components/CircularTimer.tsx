import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

import { PROGRESS_COLORS, TRACK_COLOR, type TimerStatus } from '@/constants/timer-config';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 130;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = (RADIUS + STROKE_WIDTH) * 2;

function formatTime(totalSec: number): string {
  const abs = Math.abs(totalSec);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return totalSec < 0 ? `-${formatted}` : formatted;
}

type Props = {
  progress: number;
  remainingSeconds: number;
  turnElapsedSeconds: number;
  overtimeSeconds: number;
  status: TimerStatus;
};

export function CircularTimer({ progress, remainingSeconds, turnElapsedSeconds, overtimeSeconds, status }: Props) {
  const offsetShared = useSharedValue(CIRCUMFERENCE * (1 - progress));

  useEffect(() => {
    offsetShared.value = withTiming(CIRCUMFERENCE * (1 - progress), { duration: 900 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offsetShared.value,
  }));

  const strokeColor = PROGRESS_COLORS[status];
  const isOvertime = status === 'overtime-idle' || status === 'overtime-running';

  return (
    <View style={styles.container}>
      <Svg width={SVG_SIZE} height={SVG_SIZE} style={{ transform: [{ scaleX: -1 }] }}>
        <Circle
          cx={SVG_SIZE / 2}
          cy={SVG_SIZE / 2}
          r={RADIUS}
          stroke={TRACK_COLOR}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <AnimatedCircle
          cx={SVG_SIZE / 2}
          cy={SVG_SIZE / 2}
          r={RADIUS}
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SVG_SIZE / 2}, ${SVG_SIZE / 2}`}
        />
      </Svg>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.labelsContainer}>
          {isOvertime ? (
            <>
              <Text style={styles.overtimeLabel}>OVERTIME</Text>
              <Text style={styles.overtimeTime}>{formatTime(overtimeSeconds)}</Text>
              {status === 'overtime-idle' && (
                <Text style={styles.tapHint}>tap to start</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.timeRemaining}>{formatTime(remainingSeconds)}</Text>
              {status !== 'idle' && (
                <Text style={styles.turnElapsed}>+{formatTime(turnElapsedSeconds)}</Text>
              )}
              {status === 'idle' && (
                <Text style={styles.tapHint}>tap to start turn</Text>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: SVG_SIZE,
    height: SVG_SIZE,
  },
  labelsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeRemaining: {
    fontSize: 64,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  turnElapsed: {
    fontSize: 22,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  tapHint: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
  overtimeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,120,120,0.75)',
    letterSpacing: 3,
  },
  overtimeTime: {
    fontSize: 64,
    fontWeight: '700',
    color: '#FF8080',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
});

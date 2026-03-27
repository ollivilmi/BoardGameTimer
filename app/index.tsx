import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HorizontalPicker } from '@/components/HorizontalPicker';
import { WheelPicker } from '@/components/WheelPicker';

export default function SetupScreen() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(20);
  const [increment, setIncrement] = useState(0);

  const totalSeconds = hours * 3600 + minutes * 60;
  const canStart = totalSeconds > 0;

  function startGame() {
    if (!canStart) return;
    router.push({
      pathname: '/timer',
      params: {
        totalSeconds: String(totalSeconds),
        incrementSeconds: String(increment),
      },
    });
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Title pinned to top */}
      <Text style={styles.title}>Board Game Timer</Text>

      {/* Pickers — vertically centered in remaining space */}
      <View style={styles.middle}>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Total Time</Text>
          <View style={styles.wheelRow}>
            <WheelPicker value={hours}   min={0} max={23} onChange={setHours}   label="Hours"   unit="hr" />
            <Text style={styles.colon}>:</Text>
            <WheelPicker value={minutes} min={0} max={59} onChange={setMinutes} label="Min"     unit="min" />
          </View>
          {!canStart && <Text style={styles.hint}>Set at least 1 minute</Text>}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Increment per Turn</Text>
          <HorizontalPicker
            value={increment}
            min={0}
            max={59}
            onChange={setIncrement}
            label=""
            unit="seconds added back after each turn"
          />
        </View>

      </View>

      {/* Start button pinned to bottom */}
      <Pressable
        style={[styles.startButton, !canStart && styles.startButtonDisabled]}
        onPress={startGame}
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colon: {
    fontSize: 36,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '200',
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  hint: {
    fontSize: 13,
    color: '#F5A623',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonDisabled: {
    opacity: 0.3,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },
});

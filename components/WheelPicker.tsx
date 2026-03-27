import { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const ITEM_H = 52;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  unit: string;
};

export function WheelPicker({ value, min, max, onChange, label, unit }: Props) {
  const data = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const initialOffset = (value - min) * ITEM_H;
  const momentumRef = useRef(false);
  const scrollAnim = useRef(new Animated.Value(initialOffset)).current;
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
    { useNativeDriver: true },
  );

  function commit(y: number) {
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(y / ITEM_H)));
    onChange(min + idx);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.pickerWrap}>
        <View style={styles.selectionHighlight} pointerEvents="none" />

        <Animated.ScrollView
          style={{ height: PICKER_H }}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_H}
          decelerationRate="fast"
          scrollEventThrottle={16}
          contentOffset={{ x: 0, y: initialOffset }}
          onScroll={onScroll}
          onScrollBeginDrag={() => { momentumRef.current = false; }}
          onMomentumScrollBegin={() => { momentumRef.current = true; }}
          onMomentumScrollEnd={e => commit(e.nativeEvent.contentOffset.y)}
          onScrollEndDrag={e => {
            const y = e.nativeEvent.contentOffset.y;
            setTimeout(() => {
              if (!momentumRef.current) commit(y);
            }, 50);
          }}
          contentContainerStyle={{ paddingVertical: PAD }}
        >
          {data.map((v, i) => {
            const opacity = scrollAnim.interpolate({
              inputRange: [
                (i - 2) * ITEM_H,
                (i - 1) * ITEM_H,
                i * ITEM_H,
                (i + 1) * ITEM_H,
                (i + 2) * ITEM_H,
              ],
              outputRange: [0.1, 0.35, 1.0, 0.35, 0.1],
              extrapolate: 'clamp',
            });
            const scale = scrollAnim.interpolate({
              inputRange: [(i - 1) * ITEM_H, i * ITEM_H, (i + 1) * ITEM_H],
              outputRange: [0.72, 1.0, 0.72],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View key={v} style={[styles.item, { opacity }]}>
                <Animated.Text style={[styles.itemText, { transform: [{ scale }] }]}>
                  {v}
                </Animated.Text>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      </View>

      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  pickerWrap: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_H * Math.floor(VISIBLE / 2),
    left: 8,
    right: 8,
    height: ITEM_H,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    zIndex: 1,
  },
  item: {
    height: ITEM_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.8,
  },
});

import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const ITEM_W = 58;
const PICKER_H = 84;
const SCREEN_PADDING = 56;

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  unit: string;
};

export function HorizontalPicker({ value, min, max, onChange, label, unit }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - SCREEN_PADDING;
  const padH = (containerWidth - ITEM_W) / 2;

  const data = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const initialOffset = (value - min) * ITEM_W;
  const momentumRef = useRef(false);
  const lastCommittedRef = useRef(value);
  const scrollAnim = useRef(new Animated.Value(initialOffset)).current;
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollAnim } } }],
    { useNativeDriver: true },
  );

  function commit(x: number) {
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(x / ITEM_W)));
    const next = min + idx;
    if (next !== lastCommittedRef.current) {
      lastCommittedRef.current = next;
      Haptics.selectionAsync();
    }
    onChange(next);
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.pickerWrap, { width: containerWidth }]}>
        <View
          style={[styles.selectionHighlight, { left: padH }]}
          pointerEvents="none"
        />

        <Animated.ScrollView
          horizontal
          style={{ height: PICKER_H }}
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_W}
          decelerationRate="fast"
          scrollEventThrottle={16}
          contentOffset={{ x: initialOffset, y: 0 }}
          onScroll={onScroll}
          onScrollBeginDrag={() => { momentumRef.current = false; }}
          onMomentumScrollBegin={() => { momentumRef.current = true; }}
          onMomentumScrollEnd={e => commit(e.nativeEvent.contentOffset.x)}
          onScrollEndDrag={e => {
            const x = e.nativeEvent.contentOffset.x;
            setTimeout(() => {
              if (!momentumRef.current) commit(x);
            }, 50);
          }}
          contentContainerStyle={{ paddingHorizontal: padH }}
        >
          {data.map((v, i) => {
            const opacity = scrollAnim.interpolate({
              inputRange: [
                (i - 2) * ITEM_W,
                (i - 1) * ITEM_W,
                i * ITEM_W,
                (i + 1) * ITEM_W,
                (i + 2) * ITEM_W,
              ],
              outputRange: [0.08, 0.32, 1.0, 0.32, 0.08],
              extrapolate: 'clamp',
            });
            const scale = scrollAnim.interpolate({
              inputRange: [(i - 1) * ITEM_W, i * ITEM_W, (i + 1) * ITEM_W],
              outputRange: [0.72, 1.0, 0.72],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View key={v} style={[styles.item, { opacity }]}>
                <Animated.Text style={[styles.itemText, { transform: [{ scale }] }]}>
                  {String(v).padStart(2, '0')}
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
  wrapper: {
    alignItems: 'center',
    gap: 6,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  pickerWrap: {
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    width: ITEM_W,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 1,
  },
  item: {
    width: ITEM_W,
    height: PICKER_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 32,
    fontWeight: '200',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  unit: {
    alignSelf: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.8,
  },
});

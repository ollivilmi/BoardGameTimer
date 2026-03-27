# Board Game Timer

A clean, single-screen turn timer built with Expo / React Native. Designed for board games where players need to track their remaining time per turn, with optional increment and a graceful overtime mode.

---

## Features

### Setup Screen
- **Hours + Minutes wheel pickers** — smooth, haptic-feedback scroll wheels with snap-to-item and zero-padded display
- **Increment picker** — adds seconds back to a player's clock after each turn ends (Fischer-style increment)
- **Start Game button** — disabled until at least 1 minute is configured

### Timer Screen
- **Circular progress ring** — animates the remaining time fraction; colour shifts as status changes
- **Tap-to-toggle** — tap anywhere on the screen to start / stop your turn; the entire screen is the button
- **Turn history** — a scrollable chip strip records every completed turn's duration at the bottom of the screen
- **Animated background** — the background colour transitions smoothly between statuses (idle → running → low → overtime)
- **Exit confirmation** — the ✕ button and Android hardware back both prompt before leaving

### Timer Modes

| Status | Trigger | Ring colour | Background |
|---|---|---|---|
| `idle` | App start / turn ended | Blue `#4A90D9` | Dark navy |
| `running` | Tap to start turn | Teal `#50E3C2` | Dark green |
| `low` | ≤ 20 s remaining | Amber `#F5A623` | Dark orange |
| `overtime-idle` | Clock hits 0:00 | Red `#D0021B` | Deep red |
| `overtime-running` | Tap after overtime starts | Bright red `#FF4444` | Brighter red |

### Increment Logic
- After each normal turn, `incrementSeconds` is added back to the clock
- The clock can exceed the original time limit (no cap) — e.g. a 20-minute game with a 10-second increment and a 5-second turn leaves the player with 20:05
- In overtime, increment reduces the overtime counter after each turn (minimum 0 — never goes positive)

### Overtime Mode
- When remaining time hits zero, overtime starts automatically — the turn is not ended
- The overtime counter counts upward in seconds
- Elapsed time for the turn continues accumulating (normal elapsed + overtime elapsed)
- Tapping ends the overtime turn and saves the full duration to turn history

### Audio & Haptics
- **Press sound** — plays on every turn start / stop
- **End sound** — plays when the clock reaches zero
- **Countdown ticks** — heartbeat sound fires every second during the last 10 seconds, with volume ramping from 10 % to 100 %
- **Haptics** — medium impact on turn start, light impact on turn end, error notification on overtime trigger; selection feedback on picker scroll

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Expo | ~54.0 | Build toolchain & native modules |
| Expo Router | ~6.0 | File-based navigation |
| React Native | 0.81 | Core UI |
| `expo-av` | ~16.0 | Audio playback |
| `expo-haptics` | ~15.0 | Haptic feedback |
| `react-native-reanimated` | ~4.1 | Animated background colour |
| `react-native-svg` | 15.12 | Circular progress ring |
| `react-native-gesture-handler` | ~2.28 | Tap gesture on full screen |
| `react-native-safe-area-context` | ~5.6 | Safe area insets |
| TypeScript | ~5.9 | Type safety |

---

## Project Structure

```
app/
  index.tsx            # Setup screen — time & increment pickers
  timer.tsx            # Timer screen — circular ring, history, controls

components/
  CircularTimer.tsx    # SVG progress ring + time labels
  WheelPicker.tsx      # Vertical scroll-wheel picker (hours, minutes)
  HorizontalPicker.tsx # Horizontal scroll-wheel picker (increment)

hooks/
  use-timer.ts         # All timer state: running, low, overtime, increment, history
  use-audio.ts         # Sound loading & playback via expo-av

constants/
  timer-config.ts      # Status types, background colours, ring colours, thresholds

assets/
  sounds/
    press.wav          # Turn start / stop click
    end.mp3            # Clock expiry chime
    heartbeat.wav      # 10-second countdown tick
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) or `npx expo`
- iOS Simulator / Android Emulator, or a physical device with [Expo Go](https://expo.dev/go)

### Install

```bash
npm install
```

### Run

```bash
# Start dev server (choose platform from the menu)
npx expo start

# Or target directly
npx expo start --ios
npx expo start --android
```

> Audio and haptics require a real device or a simulator with sound enabled; they are silently skipped if unavailable.

---

## Configuration

All timing thresholds and colours live in `constants/timer-config.ts`:

```ts
export const LOW_TIME_THRESHOLD_SECONDS = 20; // when the ring turns amber
```

Sound files are mapped in `hooks/use-audio.ts` — swap any `.wav` / `.mp3` in `assets/sounds/` and update the `require()` paths there.

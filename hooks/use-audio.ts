import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';

type SoundKey = 'press' | 'end';

const SOUND_SOURCES: Record<SoundKey, number> = {
  press: require('@/assets/sounds/press.wav'),
  end:   require('@/assets/sounds/end.mp3'),
};

// Countdown uses a dedicated source constant so fire-and-forget instances
// can require() the same asset without going through the preload map.
const COUNTDOWN_SOURCE: number = require('@/assets/sounds/heartbeat.wav');

export function useAudio() {
  const soundsRef = useRef<Partial<Record<SoundKey, Audio.Sound>>>({});

  useEffect(() => {
    let mounted = true;

    async function loadSounds() {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      } catch {
        // Audio mode setup failed — continue without it
      }

      for (const [key, source] of Object.entries(SOUND_SOURCES) as [SoundKey, number][]) {
        try {
          const { sound } = await Audio.Sound.createAsync(source);
          if (mounted) soundsRef.current[key] = sound;
        } catch {
          // Sound file missing or invalid — skip gracefully
        }
      }
    }

    loadSounds();

    return () => {
      mounted = false;
      for (const sound of Object.values(soundsRef.current)) {
        sound?.unloadAsync().catch(() => {});
      }
    };
  }, []);

  async function playSound(key: SoundKey, volume?: number) {
    const sound = soundsRef.current[key];
    if (!sound) return;
    try {
      if (volume !== undefined) {
        await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
      await sound.replayAsync();
    } catch {
      // Ignore playback errors
    }
  }

  // Fire-and-forget: create a fresh sound instance for each countdown tick.
  // Reusing a single instance with replayAsync() can silently fail on Android
  // when the previous play hasn't fully resolved yet.
  async function playCountdownSound(volume: number) {
    try {
      const { sound } = await Audio.Sound.createAsync(
        COUNTDOWN_SOURCE,
        { shouldPlay: true, volume: Math.max(0, Math.min(1, volume)) },
      );
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch {
      // Ignore playback errors
    }
  }

  return {
    playPress:     () => playSound('press'),
    playEnd:       () => playSound('end'),
    playCountdown: (volume: number) => playCountdownSound(volume),
  };
}

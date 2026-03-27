import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';

type SoundKey = 'press' | 'warningMinute' | 'warningLow' | 'end';

const SOUND_SOURCES: Record<SoundKey, number> = {
  press:          require('@/assets/sounds/press.wav'),
  warningMinute:  require('@/assets/sounds/warning-minute.mp3'),
  warningLow:     require('@/assets/sounds/warning-low.wav'),
  end:            require('@/assets/sounds/end.mp3'),
};

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

  async function playSound(key: SoundKey) {
    const sound = soundsRef.current[key];
    if (!sound) return;
    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Ignore playback errors
    }
  }

  return {
    playPress:         () => playSound('press'),
    playWarningMinute: () => playSound('warningMinute'),
    playWarningLow:    () => playSound('warningLow'),
    playEnd:           () => playSound('end'),
  };
}

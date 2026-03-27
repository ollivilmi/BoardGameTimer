import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

import { LOW_TIME_THRESHOLD_SECONDS, type TimerStatus } from '@/constants/timer-config';
import { useAudio } from '@/hooks/use-audio';

export function useTimer(totalSeconds: number, incrementSeconds: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [currentTurnElapsed, setCurrentTurnElapsed] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [turnHistory, setTurnHistory] = useState<number[]>([]);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const overtimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const turnStartRef = useRef<number>(0);
  const overtimeStartRef = useRef<number>(0);
  const overtimeBaseRef = useRef<number>(0); // accumulated overtime across stop/start cycles
  const lastMinuteWarningRef = useRef<number>(-1);
  const lowWarningFiredRef = useRef(false);
  const currentTurnElapsedRef = useRef(0);
  const audio = useAudio();

  const remainingRef = useRef(remainingSeconds);
  remainingRef.current = remainingSeconds;

  const statusRef = useRef(status);
  statusRef.current = status;

  function stopTicking() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startTicking() {
    turnStartRef.current = Date.now();
    lastMinuteWarningRef.current = 0;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartRef.current) / 1000);
      currentTurnElapsedRef.current = elapsed;
      setCurrentTurnElapsed(elapsed);

      const minutesPassed = Math.floor(elapsed / 60);
      if (minutesPassed > 0 && minutesPassed > lastMinuteWarningRef.current) {
        lastMinuteWarningRef.current = minutesPassed;
        audio.playWarningMinute();
      }

      setRemainingSeconds(prev => {
        const next = prev - 1;
        if (next <= 0) {
          stopTicking();
          setTurnHistory(prev => [...prev, currentTurnElapsedRef.current]);
          setStatus('overtime-idle');
          audio.playEnd();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return 0;
        }
        if (next <= LOW_TIME_THRESHOLD_SECONDS && !lowWarningFiredRef.current) {
          lowWarningFiredRef.current = true;
          setStatus('low');
          audio.playWarningLow();
        }
        return next;
      });
    }, 1000);
  }

  function stopOvertimeTicking() {
    if (overtimeIntervalRef.current !== null) {
      clearInterval(overtimeIntervalRef.current);
      overtimeIntervalRef.current = null;
      // Accumulate this session's elapsed time into the base
      overtimeBaseRef.current += Math.floor((Date.now() - overtimeStartRef.current) / 1000);
    }
  }

  function startOvertimeTicking() {
    overtimeStartRef.current = Date.now();
    overtimeIntervalRef.current = setInterval(() => {
      const sessionElapsed = Math.floor((Date.now() - overtimeStartRef.current) / 1000);
      setOvertimeSeconds(overtimeBaseRef.current + sessionElapsed);
    }, 1000);
  }

  const handleScreenPress = useCallback(() => {
    const current = statusRef.current;

    if (current === 'idle') {
      lowWarningFiredRef.current = remainingRef.current <= LOW_TIME_THRESHOLD_SECONDS;
      setCurrentTurnElapsed(0);
      setStatus(remainingRef.current <= LOW_TIME_THRESHOLD_SECONDS ? 'low' : 'running');
      startTicking();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      audio.playPress();

    } else if (current === 'running' || current === 'low') {
      stopTicking();
      setTurnHistory(prev => [...prev, currentTurnElapsedRef.current]);
      setRemainingSeconds(prev => {
        const clamped = Math.min(prev + incrementSeconds, totalSeconds);
        lowWarningFiredRef.current = clamped <= LOW_TIME_THRESHOLD_SECONDS;
        setStatus('idle');
        return clamped;
      });
      setCurrentTurnElapsed(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      audio.playPress();

    } else if (current === 'overtime-idle') {
      startOvertimeTicking();
      setStatus('overtime-running');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      audio.playPress();

    } else if (current === 'overtime-running') {
      const sessionElapsed = Math.floor((Date.now() - overtimeStartRef.current) / 1000);
      stopOvertimeTicking();
      setTurnHistory(prev => [...prev, sessionElapsed]);
      setStatus('overtime-idle');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      audio.playPress();
    }
  }, [audio, incrementSeconds, totalSeconds]);

  useEffect(() => {
    return () => {
      stopTicking();
      stopOvertimeTicking();
    };
  }, []);

  return {
    remainingSeconds,
    currentTurnElapsed,
    turnHistory,
    overtimeSeconds,
    status,
    handleScreenPress,
  };
}

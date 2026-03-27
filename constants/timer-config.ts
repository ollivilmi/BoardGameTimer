export const LOW_TIME_THRESHOLD_SECONDS = 20;

export type TimerStatus =
  | 'idle'
  | 'running'
  | 'low'
  | 'overtime-idle'
  | 'overtime-running';

// Background colors per status
export const BACKGROUND_COLORS: Record<TimerStatus, string> = {
  idle:              '#0D1B2A',
  running:           '#0A3D2B',
  low:               '#3D1A00',
  'overtime-idle':   '#4A0000',
  'overtime-running':'#7A0000',
};

// Progress ring stroke colors per status
export const PROGRESS_COLORS: Record<TimerStatus, string> = {
  idle:              '#4A90D9',
  running:           '#50E3C2',
  low:               '#F5A623',
  'overtime-idle':   '#D0021B',
  'overtime-running':'#FF4444',
};

// Track ring (background ring) color — always subtle
export const TRACK_COLOR = 'rgba(255,255,255,0.12)';

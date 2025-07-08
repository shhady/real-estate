export type AnimationType = 
  | 'panLeft' 
  | 'panRight' 
  | 'zoomIn' 
  | 'zoomOut' 
  | 'kenBurns' 
  | 'fadeIn'
  | 'fadeOut'
  | 'rotateCW'
  | 'rotateCCW'
  | 'pulse'
  | 'bounce'
  | 'slideUp'
  | 'slideDown'
  | 'blur'
  | 'unblur'
  | 'swing'
  | 'glitch'
  | 'wave'
  | 'squeeze'
  | 'flipH'
  | 'flipV'
  | 'heartbeat'
  | 'reveal'
  | 'drift'
  | 'static';

export interface SceneElement {
  type: 'image' | 'text';
  url?: string;
  text?: string;
  position: { x: number; y: number };
  animation?: AnimationType;
}

export interface Scene {
  duration: number;
  elements: SceneElement[];
}

export interface VideoConfig {
  duration: number;
  scenes: Scene[];
} 
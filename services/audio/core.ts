
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
const DEFAULT_VOLUME = 0.8;

export const getAudioContext = () => audioCtx;
export const getMasterGain = () => masterGain;

export const initAudio = () => {
  if (!audioCtx) {
    // Support for standard and webkit audio contexts
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = DEFAULT_VOLUME; 
        masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(e => console.warn("Audio resume failed", e));
  }
};

export const setVolume = (scale: number) => {
    if (!audioCtx) initAudio(); 
    if (masterGain && audioCtx) {
        const t = audioCtx.currentTime;
        masterGain.gain.cancelScheduledValues(t);
        masterGain.gain.setValueAtTime(masterGain.gain.value, t);
        masterGain.gain.linearRampToValueAtTime(scale * DEFAULT_VOLUME, t + 0.1);
    }
};

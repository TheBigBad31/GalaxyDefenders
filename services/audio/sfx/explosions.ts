
let lastExplosionTime = 0;
const noiseBufferCache = new WeakMap<AudioContext, AudioBuffer>();

const getNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    let buffer = noiseBufferCache.get(ctx);
    if (!buffer) {
        const bufferSize = Math.floor(ctx.sampleRate * 0.5);
        buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noiseBufferCache.set(ctx, buffer);
    }
    return buffer;
};

export const playExplosion = (ctx: AudioContext, dest: AudioNode) => {
    const t = ctx.currentTime;
    // Debounce slightly
    if (t - lastExplosionTime < 0.05) return; 
    lastExplosionTime = t;

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    noise.playbackRate.value = 0.9 + Math.random() * 0.2;
    const noiseGain = ctx.createGain();
    
    // REMOVED LowPass filter that was muffling the sound. 
    // Now raw noise for crisp arcade explosion.
    noise.connect(noiseGain);
    noiseGain.connect(dest);
    
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    noise.start(t);
};


export const playShoot = (ctx: AudioContext, dest: AudioNode) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);

    // Sawtooth cuts through better than square
    osc.type = 'sawtooth'; 
    osc.frequency.setValueAtTime(1200, t); // Higher pitch start
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);
    
    gain.gain.setValueAtTime(0.3, t);
    // Linear ramp prevents it from becoming silent too fast
    gain.gain.linearRampToValueAtTime(0, t + 0.15);

    osc.start(t);
    osc.stop(t + 0.15);
};

export const playBeam = (ctx: AudioContext, dest: AudioNode) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);

    // Activation sound - rising pitch for drone activation
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.3);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);
    
    osc.start(t);
    osc.stop(t + 0.3);
};

export const playBombWhistle = (ctx: AudioContext, dest: AudioNode) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    
    osc.type = 'square'; // More aggressive
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.8);
    
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.8);
    
    osc.start(t);
    osc.stop(t + 0.8);
};


export const playPowerUp = (ctx: AudioContext, dest: AudioNode) => {
    const now = ctx.currentTime;
    // Louder, clearer arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { 
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square'; // Square is retro and loud
        o.frequency.setValueAtTime(freq, now + i * 0.08);
        o.connect(g);
        g.connect(dest);
        
        g.gain.setValueAtTime(0.2, now + i * 0.08);
        g.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.1);
        
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.1);
    });
};

export const playGameOver = (ctx: AudioContext, dest: AudioNode) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(50, t + 1.5);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 1.5);
    
    osc.start(t);
    osc.stop(t + 1.5);
};

export const playBossSpawn = (ctx: AudioContext, dest: AudioNode) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t); // A2
    osc.frequency.linearRampToValueAtTime(55, t + 2.0); // A1
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 2.0);
    
    osc.start(t);
    osc.stop(t + 2.0);
};


export interface InputState {
    dx: number;
    dy: number;
    fire: boolean;
    shield: boolean;
    missile: boolean;
    start: boolean;
    source: 'KEYBOARD' | 'GAMEPAD';
}

export const getInputState = (
    keys: { [key: string]: boolean }, 
    prevGamepadState: { [key: string]: boolean }, 
    setGamepadConnected: (connected: boolean) => void,
    lastGamepadConnected: boolean
): InputState => {
    const DEADZONE = 0.15;
    const input: InputState = {
        dx: 0,
        dy: 0,
        fire: false,
        shield: false,
        missile: false,
        start: false,
        source: 'KEYBOARD' 
    };

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gpActive = false;
    let gpDx = 0;
    let gpDy = 0;
    
    let mergedFire = false;
    let mergedShield = false;
    let mergedMissile = false;
    let mergedStart = false;

    for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp || !gp.connected) continue;

        if (gp.axes.length >= 2) {
            const rawX = gp.axes[0];
            const rawY = gp.axes[1];
            if (Math.abs(rawX) > DEADZONE) { gpDx = rawX; gpActive = true; }
            if (Math.abs(rawY) > DEADZONE) { gpDy = rawY; gpActive = true; }
        }

        if (gp.buttons) {
            const btn = (idx: number) => gp.buttons[idx]?.pressed || false;
            // Fire: Left Trigger (6) or Left Bumper (4)
            if (btn(6) || btn(4)) { mergedFire = true; gpActive = true; }
            // Shield: Right Trigger (7) or Right Bumper (5) or Circle (1)
            if (btn(7) || btn(5) || btn(1)) { mergedShield = true; gpActive = true; }
            // Missile: Cross/A (0) or Square/X (2)
            if (btn(0) || btn(2)) { mergedMissile = true; gpActive = true; }
            // Options(9) or Start -> Start
            if (btn(9)) { mergedStart = true; gpActive = true; }
            
            if (btn(14)) { gpDx = -1; gpActive = true; } // Left
            if (btn(15)) { gpDx = 1; gpActive = true; }  // Right
            if (btn(12)) { gpDy = -1; gpActive = true; } // Up
            if (btn(13)) { gpDy = 1; gpActive = true; }  // Down
        }
    }
    
    if (mergedFire) input.fire = true;
    if (mergedShield) input.shield = true;
    if (mergedMissile) input.missile = true;
    if (mergedStart) input.start = true;

    const isConnected = Array.from(gamepads).some(gp => gp && gp.connected);
    if (isConnected !== lastGamepadConnected) {
        setGamepadConnected(isConnected);
    }

    if (gpActive) {
        input.dx = gpDx;
        input.dy = gpDy;
        input.source = 'GAMEPAD';
        return input;
    }

    if (keys['ArrowLeft']) input.dx -= 1;
    if (keys['ArrowRight']) input.dx += 1;
    if (keys['ArrowUp']) input.dy -= 1;
    if (keys['ArrowDown']) input.dy += 1;
    
    if (keys[' '] || keys['Space']) input.fire = true;
    if (keys['r'] || keys['R']) input.shield = true;
    if (keys['x'] || keys['X'] || keys['c'] || keys['C']) input.missile = true;
    if (keys['Enter'] || keys['Space']) input.start = true;

    return input;
};

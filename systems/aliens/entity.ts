
import { Alien, AlienType, MovementType } from '../../types';
import { AlienUpdateContext } from './types';

// Classe de base abstraite pour tous les aliens
export abstract class AlienEntity implements Alien {
    id: string;
    pos: { x: number; y: number };
    width: number;
    height: number;
    color: string;
    active: boolean;
    type: AlienType;
    scoreValue: number;
    hp: number;
    maxHp: number;
    shieldHp?: number;
    movementType: MovementType;
    startX: number;
    baseY?: number;
    timeOffset: number;
    vy: number;
    burstRemaining?: number;
    burstTimer?: number;
    spawnTimer?: number;
    squadId?: string;
    vx?: number;
    phase?: 'PROTECT' | 'TRACKING' | 'LOCKED' | 'CHARGE';
    parentAlienId?: string;
    protectTimer?: number;
    lockedVector?: { x: number; y: number };
    hasFired?: boolean;
    returnTimer?: number;
    spiralAngle?: number;
    gatlingTimer?: number;
    isGatlingFiring?: boolean;
    sniperPhase?: 'AIMING' | 'LOCKED' | 'COOLDOWN';
    aimAngle?: number;
    sniperTimer?: number;
    ufoState?: 'PATROL' | 'CHARGE' | 'BEAM';
    beamTimer?: number;

    constructor(props: Alien) {
        this.id = props.id;
        this.pos = { ...props.pos };
        this.width = props.width;
        this.height = props.height;
        this.color = props.color;
        this.active = props.active;
        this.type = props.type;
        this.scoreValue = props.scoreValue;
        this.hp = props.hp;
        this.maxHp = props.maxHp;
        this.shieldHp = props.shieldHp;
        this.movementType = props.movementType;
        this.startX = props.startX;
        this.baseY = props.baseY;
        this.timeOffset = props.timeOffset;
        this.vy = props.vy;
        this.burstRemaining = props.burstRemaining;
        this.burstTimer = props.burstTimer;
        this.spawnTimer = props.spawnTimer;
        this.squadId = props.squadId;
        this.vx = props.vx;
        this.phase = props.phase;
        this.parentAlienId = props.parentAlienId;
        this.protectTimer = props.protectTimer;
        this.lockedVector = props.lockedVector;
        this.hasFired = props.hasFired;
        this.returnTimer = props.returnTimer;
        
        // Copie des props spécifiques (Boss, Sniper, etc.)
        if (props.spiralAngle !== undefined) this.spiralAngle = props.spiralAngle;
        if (props.gatlingTimer !== undefined) this.gatlingTimer = props.gatlingTimer;
        if (props.isGatlingFiring !== undefined) this.isGatlingFiring = props.isGatlingFiring;
        if (props.sniperPhase) this.sniperPhase = props.sniperPhase;
        if (props.ufoState) this.ufoState = props.ufoState;
    }

    // Méthode polymorphique principale
    abstract update(ctx: AlienUpdateContext): void;
}

// Classe adaptateur pour supporter les anciennes fonctions de mise à jour (Migration progressive)
export class LegacyAdapterAlien extends AlienEntity {
    private updateFn: (alien: Alien, ctx: AlienUpdateContext) => void;

    constructor(props: Alien, updateFn: (alien: Alien, ctx: AlienUpdateContext) => void) {
        super(props);
        this.updateFn = updateFn;
    }

    update(ctx: AlienUpdateContext): void {
        this.updateFn(this, ctx);
    }
}

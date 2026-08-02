
import { Alien, AlienType } from '../../types';
import { AlienEntity, LegacyAdapterAlien } from './entity';
import { BossAlien } from './boss';
import { SniperAlien } from './sniper';
import { StandardAlien } from './standard';

// Import remaining functional updates for legacy wrapping
import { updateMothership } from './mothership';
import { updateKamikaze } from './kamikaze';
import { updateGunner } from './gunner';
import { updateArtillery } from './artillery';
import { updateElite } from './elite';
import { updateUfo } from './ufo';

export class AlienFactory {
    static create(props: Alien): AlienEntity {
        switch (props.type) {
            case AlienType.BOSS:
                return new BossAlien(props);
            
            case AlienType.SNIPER:
                return new SniperAlien(props);
            
            case AlienType.MOTHERSHIP:
            case AlienType.SUPREME_MOTHERSHIP:
                return new LegacyAdapterAlien(props, updateMothership);
            
            case AlienType.KAMIKAZE:
                return new LegacyAdapterAlien(props, updateKamikaze);
            
            case AlienType.GUNNER:
                return new LegacyAdapterAlien(props, updateGunner);
            
            case AlienType.ARTILLERY:
            case AlienType.SUPREME_ARTILLERY:
                return new LegacyAdapterAlien(props, updateArtillery);
            
            case AlienType.ELITE:
                return new LegacyAdapterAlien(props, updateElite);
            
            case AlienType.UFO:
                return new LegacyAdapterAlien(props, updateUfo);
            
            case AlienType.SCOUT:
            case AlienType.FIGHTER:
            case AlienType.ASSAULT:
            case AlienType.REFLECTOR:
            case AlienType.JELLYFISH: // Mapped to standard for now or create specific if needed
            default:
                // Default to standard class for basic enemies
                return new StandardAlien(props);
        }
    }
}

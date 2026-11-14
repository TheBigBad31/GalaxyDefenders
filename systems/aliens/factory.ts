
import { Alien, AlienType } from '../../types';
import { AlienEntity } from './entity';
import { BossAlien } from './boss';
import { SniperAlien } from './sniper';
import { StandardAlien } from './standard';
import { MothershipAlien } from './mothership';
import { KamikazeAlien } from './kamikaze';
import { GunnerAlien } from './gunner';
import { ArtilleryAlien } from './artillery';
import { EliteAlien } from './elite';
import { UfoAlien } from './ufo';

export class AlienFactory {
    static create(props: Alien): AlienEntity {
        switch (props.type) {
            case AlienType.BOSS:
                return new BossAlien(props);
            
            case AlienType.SNIPER:
                return new SniperAlien(props);
            
            case AlienType.MOTHERSHIP:
            case AlienType.SUPREME_MOTHERSHIP:
                return new MothershipAlien(props);
            
            case AlienType.KAMIKAZE:
                return new KamikazeAlien(props);
            
            case AlienType.GUNNER:
                return new GunnerAlien(props);
            
            case AlienType.ARTILLERY:
            case AlienType.SUPREME_ARTILLERY:
                return new ArtilleryAlien(props);
            
            case AlienType.ELITE:
                return new EliteAlien(props);
            
            case AlienType.UFO:
                return new UfoAlien(props);
            
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

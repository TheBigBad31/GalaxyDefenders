import { Particle, Position } from '../types';

export class ParticleSystem {
    private particles: Particle[] = [];

    public getParticles(): Particle[] {
        return this.particles;
    }

    public update(): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.pos.x += p.velocity.x;
            p.pos.y += p.velocity.y;
            p.life -= p.decay || 0.03;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    public spawnExplosion(pos: Position, color: string, count: number = 15): void {
        // Flash core
        this.particles.push({
            id: Math.random().toString(),
            pos: { x: pos.x, y: pos.y },
            velocity: { x: 0, y: 0 },
            life: 1.0,
            color: '#ffffff',
            size: 16,
            type: 'FLASH',
            decay: 0.1
        });

        // Sparks & debris
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            this.particles.push({
                id: Math.random().toString(),
                pos: { x: pos.x, y: pos.y },
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                life: 0.8 + Math.random() * 0.4,
                color,
                size: 2 + Math.random() * 3,
                type: 'SPARK',
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }

    public spawnThrusterSpark(pos: Position, color: string): void {
        this.particles.push({
            id: Math.random().toString(),
            pos: { x: pos.x + (Math.random() - 0.5) * 8, y: pos.y },
            velocity: {
                x: (Math.random() - 0.5) * 1.5,
                y: 2 + Math.random() * 3
            },
            life: 0.6,
            color,
            size: 2,
            type: 'SPARK',
            decay: 0.08
        });
    }

    public spawnFloatingText(pos: Position, text: string, color: string = '#22d3ee'): void {
        this.particles.push({
            id: Math.random().toString(),
            pos: { x: pos.x, y: pos.y },
            velocity: { x: 0, y: -1.2 },
            life: 1.0,
            color,
            size: 12,
            type: 'TEXT',
            text,
            decay: 0.02
        });
    }

    public clear(): void {
        this.particles = [];
    }
}

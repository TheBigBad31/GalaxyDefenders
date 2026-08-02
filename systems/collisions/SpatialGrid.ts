
import { Entity } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

export class SpatialGrid {
    private cellSize: number;
    private cols: number;
    private rows: number;
    private buckets: Entity[][];

    constructor(cellSize: number = 100) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(CANVAS_WIDTH / cellSize);
        this.rows = Math.ceil(CANVAS_HEIGHT / cellSize);
        this.buckets = new Array(this.cols * this.rows).fill(null).map(() => []);
    }

    public clear() {
        for (let i = 0; i < this.buckets.length; i++) {
            this.buckets[i].length = 0;
        }
    }

    public insert(entity: Entity) {
        // Calculate the range of cells the entity overlaps
        const startCol = Math.floor(entity.pos.x / this.cellSize);
        const endCol = Math.floor((entity.pos.x + entity.width) / this.cellSize);
        const startRow = Math.floor(entity.pos.y / this.cellSize);
        const endRow = Math.floor((entity.pos.y + entity.height) / this.cellSize);

        // Clamp to grid bounds
        const minCol = Math.max(0, startCol);
        const maxCol = Math.min(this.cols - 1, endCol);
        const minRow = Math.max(0, startRow);
        const maxRow = Math.min(this.rows - 1, endRow);

        for (let y = minRow; y <= maxRow; y++) {
            for (let x = minCol; x <= maxCol; x++) {
                const index = y * this.cols + x;
                this.buckets[index].push(entity);
            }
        }
    }

    public retrieve(entity: { pos: { x: number, y: number }, width: number, height: number }): Entity[] {
        const startCol = Math.floor(entity.pos.x / this.cellSize);
        const endCol = Math.floor((entity.pos.x + entity.width) / this.cellSize);
        const startRow = Math.floor(entity.pos.y / this.cellSize);
        const endRow = Math.floor((entity.pos.y + entity.height) / this.cellSize);

        const minCol = Math.max(0, startCol);
        const maxCol = Math.min(this.cols - 1, endCol);
        const minRow = Math.max(0, startRow);
        const maxRow = Math.min(this.rows - 1, endRow);

        const candidates = new Set<Entity>();

        for (let y = minRow; y <= maxRow; y++) {
            for (let x = minCol; x <= maxCol; x++) {
                const index = y * this.cols + x;
                const bucket = this.buckets[index];
                for (let i = 0; i < bucket.length; i++) {
                    candidates.add(bucket[i]);
                }
            }
        }

        return Array.from(candidates);
    }
}

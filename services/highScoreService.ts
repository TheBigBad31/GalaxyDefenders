export const HIGHSCORES_STORAGE_KEY = 'galaxy_defenders_highscores_v1';
export const HIGHSCORES_SCHEMA_VERSION = 1;
export const MAX_TOP_SCORES = 10;

export interface HighScoreEntry {
    score: number;
    level: number;
    shipId: string;
    pilotName: string;
    pilotId: string;
    maxCombo: number;
    date: string;
}

export interface ShipBestRecord {
    score: number;
    level: number;
    pilotName: string;
    pilotId: string;
    maxCombo: number;
    date: string;
}

export interface HighScoresStore {
    version: number;
    top10: HighScoreEntry[];
    bestByShip: Record<string, ShipBestRecord>;
}

export interface RecordScoreInput {
    score: number;
    level: number;
    shipId: string;
    pilotName: string;
    pilotId: string;
    maxCombo?: number;
    date?: string;
}

export interface RecordScoreResult {
    isNewGlobalRecord: boolean;
    isNewShipRecord: boolean;
    rank: number | null;
    previousBestForShip: number;
    entry: HighScoreEntry;
}

function createEmptyStore(): HighScoresStore {
    return {
        version: HIGHSCORES_SCHEMA_VERSION,
        top10: [],
        bestByShip: {},
    };
}

function isValidEntry(raw: unknown): raw is HighScoreEntry {
    if (!raw || typeof raw !== 'object') return false;
    const obj = raw as Record<string, unknown>;
    return (
        typeof obj.score === 'number' &&
        Number.isFinite(obj.score) &&
        obj.score >= 0 &&
        typeof obj.level === 'number' &&
        Number.isFinite(obj.level) &&
        obj.level >= 0 &&
        typeof obj.shipId === 'string' &&
        obj.shipId.length > 0 &&
        typeof obj.pilotName === 'string' &&
        typeof obj.pilotId === 'string' &&
        typeof obj.maxCombo === 'number' &&
        Number.isFinite(obj.maxCombo) &&
        typeof obj.date === 'string'
    );
}

function sanitizeStore(raw: unknown): HighScoresStore {
    if (!raw || typeof raw !== 'object') return createEmptyStore();
    const obj = raw as Record<string, unknown>;
    if (obj.version !== HIGHSCORES_SCHEMA_VERSION) return createEmptyStore();

    const top10 = Array.isArray(obj.top10)
        ? obj.top10.filter(isValidEntry).sort(compareEntries).slice(0, MAX_TOP_SCORES)
        : [];

    const bestByShip: Record<string, ShipBestRecord> = {};
    if (obj.bestByShip && typeof obj.bestByShip === 'object' && !Array.isArray(obj.bestByShip)) {
        for (const [shipId, rec] of Object.entries(obj.bestByShip as Record<string, unknown>)) {
            if (!rec || typeof rec !== 'object') continue;
            const r = rec as Record<string, unknown>;
            if (
                typeof r.score === 'number' &&
                Number.isFinite(r.score) &&
                r.score >= 0 &&
                typeof r.level === 'number' &&
                Number.isFinite(r.level) &&
                typeof r.pilotName === 'string' &&
                typeof r.pilotId === 'string' &&
                typeof r.maxCombo === 'number' &&
                Number.isFinite(r.maxCombo) &&
                typeof r.date === 'string'
            ) {
                bestByShip[shipId] = {
                    score: r.score,
                    level: r.level,
                    pilotName: r.pilotName,
                    pilotId: r.pilotId,
                    maxCombo: r.maxCombo,
                    date: r.date,
                };
            }
        }
    }

    return {
        version: HIGHSCORES_SCHEMA_VERSION,
        top10,
        bestByShip,
    };
}

function compareEntries(a: HighScoreEntry, b: HighScoreEntry): number {
    if (b.score !== a.score) return b.score - a.score;
    if (b.level !== a.level) return b.level - a.level;
    return b.date.localeCompare(a.date);
}

function getStorage(): Storage | null {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
            return globalThis.localStorage;
        }
    } catch {
        return null;
    }
    return null;
}

class HighScoreService {
    private loadStore(): HighScoresStore {
        const storage = getStorage();
        if (!storage) return createEmptyStore();
        try {
            const raw = storage.getItem(HIGHSCORES_STORAGE_KEY);
            if (!raw) return createEmptyStore();
            const parsed = JSON.parse(raw);
            return sanitizeStore(parsed);
        } catch {
            return createEmptyStore();
        }
    }

    private saveStore(store: HighScoresStore): void {
        const storage = getStorage();
        if (!storage) return;
        try {
            storage.setItem(HIGHSCORES_STORAGE_KEY, JSON.stringify(store));
        } catch {
            // Ignore storage quota / security errors
        }
    }

    public getTop10(): HighScoreEntry[] {
        return this.loadStore().top10;
    }

    public getBestForShip(shipId: string): ShipBestRecord | null {
        const store = this.loadStore();
        return store.bestByShip[shipId] ?? null;
    }

    public getBestScore(shipId?: string): number {
        const store = this.loadStore();
        if (shipId) {
            return store.bestByShip[shipId]?.score ?? 0;
        }
        return store.top10[0]?.score ?? 0;
    }

    public recordScore(input: RecordScoreInput): RecordScoreResult {
        const score = Math.max(0, Math.floor(Number.isFinite(input.score) ? input.score : 0));
        const level = Math.max(1, Math.floor(Number.isFinite(input.level) ? input.level : 1));
        const maxCombo = Math.max(1, Math.floor(Number.isFinite(input.maxCombo ?? 1) ? (input.maxCombo ?? 1) : 1));
        const entry: HighScoreEntry = {
            score,
            level,
            shipId: input.shipId || 'VIPER',
            pilotName: (input.pilotName || 'GUEST PILOT').trim() || 'GUEST PILOT',
            pilotId: input.pilotId || 'guest_pilot',
            maxCombo,
            date: input.date || new Date().toISOString(),
        };

        const store = this.loadStore();
        const previousBestForShip = store.bestByShip[entry.shipId]?.score ?? 0;
        const previousGlobalBest = store.top10[0]?.score ?? 0;

        if (score <= 0) {
            return {
                isNewGlobalRecord: false,
                isNewShipRecord: false,
                rank: null,
                previousBestForShip,
                entry,
            };
        }

        const isNewGlobalRecord = score > previousGlobalBest;
        const isNewShipRecord = score > previousBestForShip;

        const nextTop10 = [...store.top10, entry]
            .sort(compareEntries)
            .slice(0, MAX_TOP_SCORES);

        const rankIndex = nextTop10.findIndex((item) => item === entry);
        const rank = rankIndex >= 0 ? rankIndex + 1 : null;

        const nextBestByShip = { ...store.bestByShip };
        if (isNewShipRecord) {
            nextBestByShip[entry.shipId] = {
                score: entry.score,
                level: entry.level,
                pilotName: entry.pilotName,
                pilotId: entry.pilotId,
                maxCombo: entry.maxCombo,
                date: entry.date,
            };
        }

        this.saveStore({
            version: HIGHSCORES_SCHEMA_VERSION,
            top10: nextTop10,
            bestByShip: nextBestByShip,
        });

        return {
            isNewGlobalRecord,
            isNewShipRecord,
            rank,
            previousBestForShip,
            entry,
        };
    }

    public clearAll(): void {
        const storage = getStorage();
        if (!storage) return;
        try {
            storage.removeItem(HIGHSCORES_STORAGE_KEY);
        } catch {
            // Ignore
        }
    }
}

export const highScoreService = new HighScoreService();

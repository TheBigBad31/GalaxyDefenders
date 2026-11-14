export const HIGHSCORE_STORAGE_KEY = 'galaxy_defenders_highscores_v1';
export const HIGHSCORE_SCHEMA_VERSION = 1;
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

export interface HighScoreStore {
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
    isNewRecord: boolean;
    isShipRecord: boolean;
    rank: number | null;
    store: HighScoreStore;
}

function createEmptyStore(): HighScoreStore {
    return {
        version: HIGHSCORE_SCHEMA_VERSION,
        top10: [],
        bestByShip: {},
    };
}

function isValidNumber(val: unknown): val is number {
    return typeof val === 'number' && Number.isFinite(val) && val >= 0;
}

function isValidEntry(raw: unknown): raw is HighScoreEntry {
    if (!raw || typeof raw !== 'object') return false;
    const obj = raw as Record<string, unknown>;
    return (
        isValidNumber(obj.score) &&
        isValidNumber(obj.level) &&
        typeof obj.shipId === 'string' &&
        obj.shipId.length > 0 &&
        typeof obj.pilotName === 'string' &&
        typeof obj.pilotId === 'string' &&
        isValidNumber(obj.maxCombo) &&
        typeof obj.date === 'string'
    );
}

function isValidShipBest(raw: unknown): raw is ShipBestRecord {
    if (!raw || typeof raw !== 'object') return false;
    const obj = raw as Record<string, unknown>;
    return (
        isValidNumber(obj.score) &&
        isValidNumber(obj.level) &&
        typeof obj.pilotName === 'string' &&
        typeof obj.pilotId === 'string' &&
        isValidNumber(obj.maxCombo) &&
        typeof obj.date === 'string'
    );
}

function sortEntries(entries: HighScoreEntry[]): HighScoreEntry[] {
    return [...entries].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.level !== a.level) return b.level - a.level;
        return b.date.localeCompare(a.date);
    });
}

function sanitizeStore(raw: unknown): HighScoreStore {
    if (!raw || typeof raw !== 'object') return createEmptyStore();
    const obj = raw as Record<string, unknown>;
    if (obj.version !== HIGHSCORE_SCHEMA_VERSION) return createEmptyStore();

    const rawTop = Array.isArray(obj.top10) ? obj.top10 : [];
    const top10 = sortEntries(rawTop.filter(isValidEntry)).slice(0, MAX_TOP_SCORES);

    const bestByShip: Record<string, ShipBestRecord> = {};
    if (obj.bestByShip && typeof obj.bestByShip === 'object' && !Array.isArray(obj.bestByShip)) {
        for (const [shipId, record] of Object.entries(obj.bestByShip as Record<string, unknown>)) {
            if (shipId && isValidShipBest(record)) {
                bestByShip[shipId] = record;
            }
        }
    }

    return {
        version: HIGHSCORE_SCHEMA_VERSION,
        top10,
        bestByShip,
    };
}

class HighScoreService {
    public getStore(): HighScoreStore {
        try {
            if (typeof localStorage === 'undefined') return createEmptyStore();
            const raw = localStorage.getItem(HIGHSCORE_STORAGE_KEY);
            if (!raw) return createEmptyStore();
            const parsed = JSON.parse(raw);
            return sanitizeStore(parsed);
        } catch {
            return createEmptyStore();
        }
    }

    private saveStore(store: HighScoreStore): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(HIGHSCORE_STORAGE_KEY, JSON.stringify(store));
        } catch {
            // Ignore storage quota or access errors
        }
    }

    public getTop10(): HighScoreEntry[] {
        return this.getStore().top10;
    }

    public getBestByShip(shipId: string): ShipBestRecord | null {
        const store = this.getStore();
        return store.bestByShip[shipId] ?? null;
    }

    public getGlobalBest(): number {
        const top = this.getTop10();
        return top.length > 0 ? top[0].score : 0;
    }

    public recordScore(input: RecordScoreInput): RecordScoreResult {
        const store = this.getStore();
        const score = Math.max(0, Math.floor(input.score));

        if (score <= 0) {
            return {
                isNewRecord: false,
                isShipRecord: false,
                rank: null,
                store,
            };
        }

        const previousGlobalBest = store.top10.length > 0 ? store.top10[0].score : 0;
        const isNewRecord = score > previousGlobalBest;

        const entry: HighScoreEntry = {
            score,
            level: Math.max(1, Math.floor(input.level)),
            shipId: input.shipId || 'VIPER',
            pilotName: (input.pilotName || 'GUEST PILOT').trim() || 'GUEST PILOT',
            pilotId: input.pilotId || 'guest_pilot',
            maxCombo: Math.max(0, Math.floor(input.maxCombo ?? 0)),
            date: input.date ?? new Date().toISOString(),
        };

        const sortedTop = sortEntries([...store.top10, entry]).slice(0, MAX_TOP_SCORES);
        const rankIndex = sortedTop.findIndex(
            (e) =>
                e.score === entry.score &&
                e.date === entry.date &&
                e.pilotId === entry.pilotId &&
                e.shipId === entry.shipId
        );
        const rank = rankIndex >= 0 ? rankIndex + 1 : null;

        const prevShipBest = store.bestByShip[entry.shipId];
        const isShipRecord = !prevShipBest || entry.score > prevShipBest.score;

        const nextBestByShip = { ...store.bestByShip };
        if (isShipRecord) {
            nextBestByShip[entry.shipId] = {
                score: entry.score,
                level: entry.level,
                pilotName: entry.pilotName,
                pilotId: entry.pilotId,
                maxCombo: entry.maxCombo,
                date: entry.date,
            };
        }

        const nextStore: HighScoreStore = {
            version: HIGHSCORE_SCHEMA_VERSION,
            top10: sortedTop,
            bestByShip: nextBestByShip,
        };

        this.saveStore(nextStore);

        return {
            isNewRecord,
            isShipRecord,
            rank,
            store: nextStore,
        };
    }

    public clearAll(): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.removeItem(HIGHSCORE_STORAGE_KEY);
        } catch {
            // Ignore
        }
    }
}

export const highScoreService = new HighScoreService();

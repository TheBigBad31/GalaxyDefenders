let _nextId = 1;

/**
 * Fast incremental entity ID generator (zero-GC compared to Math.random().toString()).
 */
export const nextId = (): string => String(_nextId++);

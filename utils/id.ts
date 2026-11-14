let nextId = 1;

export const nextEntityId = (): string => String(nextId++);

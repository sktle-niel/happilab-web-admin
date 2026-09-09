/**
 * The API speaks snake_case and the pages camelCase; the data provider
 * converts once, in each direction, so no page spells a wire name.
 * Only plain objects are renamed: arrays are walked, everything else
 * (strings, numbers, dates) passes through.
 */
const camel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const snake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

const isPlain = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;

function rename(value: unknown, key: (name: string) => string): unknown {
  if (Array.isArray(value)) return value.map((item) => rename(item, key));
  if (isPlain(value)) return Object.fromEntries(Object.entries(value).map(([name, inner]) => [key(name), rename(inner, key)]));
  return value;
}

export const toCamel = <T>(value: unknown) => rename(value, camel) as T;
export const toSnake = (value: unknown) => rename(value, snake);
/** One field name as the API's query string wants it: `requestedAt` → `requested_at`. */
export const snakeKey = snake;

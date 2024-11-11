interface CacheOptions {
  key: string;
  ttl: string | number;
}

interface CacheEntry<T> {
  value: T;
  expires: number;
}

class Cache {
  private static instances = new Map<string, Cache>();
  private store: Map<string, CacheEntry<any>>;
  private readonly namespace: string;

  private constructor(namespace: string = "default") {
    this.store = new Map();
    this.namespace = namespace;
  }

  public static getInstance(namespace: string = "default"): Cache {
    if (!Cache.instances.has(namespace)) {
      Cache.instances.set(namespace, new Cache(namespace));
    }
    return Cache.instances.get(namespace)!;
  }

  public set<T>(key: string, value: T, ttl: number): void {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  public invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  public invalidateAllExpired(): void {
    for (const [key, entry] of this.store.entries()) {
      if (Date.now() > entry.expires) {
        this.store.delete(key);
      }
    }
  }

  public clear(): void {
    this.store.clear();
  }
}

function parseTTL(ttl: string | number): number {
  if (typeof ttl === "number") return ttl;

  const units: { [key: string]: number } = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(
      'Invalid TTL format. Use number or string like "1s", "5m", "2h", "1d"'
    );
  }

  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

async function cache<T>(
  promise: Promise<T>,
  options: CacheOptions,
  namespace: string = "default"
): Promise<T> {
  const cacheInstance = Cache.getInstance(namespace);

  try {
    const cachedValue = cacheInstance.get<T>(options.key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    const result = await promise;
    const ttlMs = parseTTL(options.ttl);
    cacheInstance.set(options.key, result, ttlMs);

    return result;
  } catch (error) {
    throw error;
  }
}

function invalidateCache(key: string, namespace: string = "default"): boolean {
  const cacheInstance = Cache.getInstance(namespace);
  return cacheInstance.invalidate(key);
}

function invalidateAllExpiredCacheEntries(namespace: string = "default"): void {
  const cacheInstance = Cache.getInstance(namespace);
  cacheInstance.invalidateAllExpired();
}

function clearCache(namespace: string = "default"): void {
  const cacheInstance = Cache.getInstance(namespace);
  cacheInstance.clear();
}

export {
  cache,
  CacheOptions,
  invalidateCache,
  invalidateAllExpiredCacheEntries,
  clearCache,
  Cache,
};

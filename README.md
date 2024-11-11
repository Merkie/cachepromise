# cachepromise

A lightweight, type-safe in-memory cache for Promises with TTL (Time To Live) support. Perfect for caching expensive API calls, database queries, or any asynchronous operations.

## Features

- 🚀 Simple and lightweight
- 💪 Fully typed with TypeScript
- ⏰ TTL (Time To Live) support with human-readable durations
- 🔍 Namespace support for organizing different cache contexts
- 🧹 Automatic cleanup of expired entries
- 🔒 Singleton pattern ensures consistent caching across your application

## Installation

```bash
npm install cachepromise
```

## Usage

### Basic Usage

```typescript
import { cache } from "cachepromise";

// Function that makes an expensive API call
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// Cache the result for 5 minutes
const userData = await cache(fetchUserData("123"), {
  key: "user-123",
  ttl: "5m",
});

// Subsequent calls with the same key will return cached data
const cachedUserData = await cache(fetchUserData("123"), {
  key: "user-123",
  ttl: "5m",
});
```

### TTL (Time To Live) Formats

Support for human-readable durations:

- Seconds: `'30s'`
- Minutes: `'5m'`
- Hours: `'2h'`
- Days: `'1d'`
- Milliseconds: `5000` (number)

```typescript
// Cache for 30 seconds
await cache(myPromise(), { key: "short-lived", ttl: "30s" });

// Cache for 1 hour
await cache(myPromise(), { key: "long-lived", ttl: "1h" });

// Cache for 5000 milliseconds
await cache(myPromise(), { key: "custom", ttl: 5000 });
```

### Using Namespaces

Organize your cache entries with namespaces:

```typescript
// Cache in 'users' namespace
await cache(fetchUserData("123"), { key: "user-123", ttl: "5m" }, "users");

// Cache in 'products' namespace
await cache(
  fetchProductData("456"),
  { key: "product-456", ttl: "10m" },
  "products"
);
```

### Cache Invalidation

```typescript
import {
  invalidateCache,
  invalidateAllExpiredCacheEntries,
  clearCache,
} from "cachepromise";

// Invalidate specific entry
invalidateCache("user-123");

// Invalidate specific entry in a namespace
invalidateCache("user-123", "users");

// Remove all expired entries
invalidateAllExpiredCacheEntries();

// Clear all entries in a namespace
clearCache("users");
```

### Advanced Usage with Cache Class

```typescript
import { Cache } from "cachepromise";

const userCache = Cache.getInstance("users");

// Manual cache operations
userCache.set("user-123", userData, 300000); // Cache for 5 minutes
const cachedUser = userCache.get("user-123");
```

## TypeScript Support

The cache is fully typed and will preserve the type of your Promise's resolved value:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const user = await cache<User>(fetchUser("123"), {
  key: "user-123",
  ttl: "5m",
});
// user is typed as User
```

## API Reference

### cache<T>(promise: Promise<T>, options: CacheOptions, namespace?: string): Promise<T>

Main caching function that wraps a Promise.

- `promise`: The Promise to cache
- `options`:
  - `key`: Unique identifier for the cached item
  - `ttl`: Time to live (string or number)
- `namespace`: Optional namespace for the cache (default: "default")

### invalidateCache(key: string, namespace?: string): boolean

Removes an entry from the cache.

### invalidateAllExpiredCacheEntries(namespace?: string): void

Removes all expired entries from the cache.

### clearCache(namespace?: string): void

Clears all entries in a namespace.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

import { cache, invalidateCache, Cache } from "../src";

describe("Cache", () => {
  beforeEach(() => {
    // Clear all caches before each test
    const cacheInstance = Cache.getInstance();
    cacheInstance.clear();
  });

  test("should cache and retrieve values", async () => {
    const mockFetch = jest.fn().mockResolvedValue("test-data");
    const promise = mockFetch(); // Create the promise once

    const result1 = await cache(promise, { key: "test", ttl: "1m" });
    expect(result1).toBe("test-data");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call should use cached value and not create a new promise
    const result2 = await cache(promise, { key: "test", ttl: "1m" });
    expect(result2).toBe("test-data");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("should respect TTL", async () => {
    const mockFetch = jest.fn().mockResolvedValue("test-data");
    await cache(mockFetch(), { key: "test", ttl: "1s" });

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 1100));

    await cache(mockFetch(), { key: "test", ttl: "1s" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test("should handle multiple namespaces", async () => {
    const mockFetch = jest.fn().mockResolvedValue("test-data");
    const promise = mockFetch();

    await cache(promise, { key: "test", ttl: "1m" }, "namespace1");
    await cache(promise, { key: "test", ttl: "1m" }, "namespace2");

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("should handle invalidation", async () => {
    const mockFetch = jest.fn().mockResolvedValue("test-data");
    const promise = mockFetch();

    await cache(promise, { key: "test", ttl: "1m" });
    invalidateCache("test");

    await cache(mockFetch(), { key: "test", ttl: "1m" }); // New promise after invalidation
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  // Add new test for parseTTL function
  test("should parse different TTL formats", async () => {
    const mockFetch = jest.fn().mockResolvedValue("test-data");
    const promise = mockFetch();

    // Test different TTL formats
    await cache(promise, { key: "test1", ttl: "1s" });
    await cache(promise, { key: "test2", ttl: "1m" });
    await cache(promise, { key: "test3", ttl: "1h" });
    await cache(promise, { key: "test4", ttl: "1d" });
    await cache(promise, { key: "test5", ttl: 1000 }); // milliseconds

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // Add test for invalid TTL format
  test("should throw error for invalid TTL format", async () => {
    const mockFetch = jest.fn().mockResolvedValue("test-data");
    const promise = mockFetch();

    await expect(
      cache(promise, { key: "test", ttl: "invalid" })
    ).rejects.toThrow("Invalid TTL format");
  });
});

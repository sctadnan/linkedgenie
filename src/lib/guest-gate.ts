import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export type GuestToolType = 'hook' | 'post';

const GUEST_LIMITS: Record<GuestToolType, number> = {
    hook: 1,
    post: 3,
};

const TTL_SECONDS = 60 * 60 * 24; // 24 hours — resets daily

/**
 * Checks and enforces IP-based guest usage limits.
 * Atomically increments the counter only if the limit has not been reached.
 *
 * @param ip - The client's IP address
 * @param type - The tool being used: 'hook' or 'post'
 * @returns An object describing whether the request is allowed and current usage stats
 */
export async function checkGuestLimit(
    ip: string,
    type: GuestToolType
): Promise<{ allowed: boolean; used: number; limit: number; error?: string }> {
    const limit = GUEST_LIMITS[type];
    const key = `guest:${ip}:${type}`;

    try {
        // Get current count first (before incrementing)
        const current = await redis.get<number>(key);
        const used = current ?? 0;

        if (used >= limit) {
            return { allowed: false, used, limit };
        }

        // Atomically increment
        const newCount = await redis.incr(key);

        // Set TTL only on first use (when the key was just created)
        if (newCount === 1) {
            await redis.expire(key, TTL_SECONDS);
        }

        return { allowed: true, used: newCount, limit };
    } catch (err) {
        console.error("Redis error in guest-gate:", err);
        // Fail open: if Redis is down, allow the request rather than blocking all guests
        return { allowed: true, used: 0, limit, error: "Redis unavailable" };
    }
}

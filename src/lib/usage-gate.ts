import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./server-supabase";
import { checkGuestLimit, type GuestToolType } from "./guest-gate";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const MAX_FREE_CREDITS = 5;

/**
 * Validates the user's session and checks their credit/pro status.
 * Supports both guest (IP-based) and authenticated (Supabase) users.
 *
 * @param req - The incoming request
 * @param guestType - The tool type for guest limit tracking ('hook' | 'post')
 */
export async function enforceUsageLimit(req: Request, guestType: GuestToolType) {
    const authHeader = req.headers.get("Authorization");

    // ── GUEST PATH ────────────────────────────────────────────────────────────
    if (!authHeader) {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
        const result = await checkGuestLimit(ip, guestType);

        if (!result.allowed) {
            return { error: "GUEST_LIMIT_REACHED", status: 403, guestLimit: result.limit, guestUsed: result.used };
        }

        // Guest is allowed; no user object to return
        return { success: true, user: null, isGuest: true };
    }

    // ── AUTHENTICATED PATH ────────────────────────────────────────────────────
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        console.error("Auth error in usage-gate:", authError);
        return {
            error: `Invalid session or unauthenticated: ${authError?.message || 'No user found'}`,
            status: 401
        };
    }

    // Fetch user profile via admin client to bypass RLS
    let { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("is_pro, credits_used")
        .eq("id", user.id)
        .single();

    // Lazily create profile if missing (PGRST116 = 0 rows returned)
    if (profileError?.code === 'PGRST116' || !profile) {
        const { data: newProfile, error: insertError } = await supabaseAdmin
            .from("profiles")
            .insert({ id: user.id, is_pro: false, credits_used: 0 })
            .select("is_pro, credits_used")
            .single();

        if (insertError) {
            console.error("Failed to lazily create profile:", insertError);
            return { error: `Profile not found and could not be created automatically. DB Error: ${insertError.message}`, status: 500 };
        }

        profile = newProfile;
        profileError = null;
    } else if (profileError) {
        console.error("Database error fetching profile:", profileError);
        return { error: "Internal database error when fetching profile", status: 500 };
    }

    // Pro users have unlimited access
    if (profile.is_pro) {
        return { success: true, user };
    }

    // Free user — out of credits
    if (profile.credits_used >= MAX_FREE_CREDITS) {
        return { error: "OUT_OF_CREDITS", status: 403 };
    }

    // Free user — has credits, increment by 1
    const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ credits_used: profile.credits_used + 1 })
        .eq("id", user.id);

    if (updateError) {
        console.error("Failed to increment usage:", updateError);
        return { error: "Internal Server Error updating credits", status: 500 };
    }

    return { success: true, user };
}

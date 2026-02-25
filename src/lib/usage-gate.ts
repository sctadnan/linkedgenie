import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./server-supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const MAX_FREE_CREDITS = 5;

/**
 * Validates the user's session and checks their credit/pro status.
 * Use this at the top of all protected API routes.
 */
export async function enforceUsageLimit(req: Request) {
    // 1. Get the Authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return { error: "Missing Authorization header", status: 401 };
    }

    const token = authHeader.replace("Bearer ", "");

    // 2. We must verify this token with Supabase Auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return { error: "Invalid session or unauthenticated", status: 401 };
    }

    // 3. Fetch the user's profile using the admin client to bypass RLS 
    // (RLS might block read if they somehow aren't authenticated properly contextually)
    // We use the admin client in server contexts strictly for reading trusted data here
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("is_pro, credits_used")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
        return { error: "Profile not found", status: 404 };
    }

    // 4. Logic Enforcement
    if (profile.is_pro) {
        // PRO User - Free pass
        return { success: true, user };
    }

    if (profile.credits_used >= MAX_FREE_CREDITS) {
        // FREE User - Out of credits
        return { error: "OUT_OF_CREDITS", status: 403 };
    }

    // FREE User - Has credits, increment by 1
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

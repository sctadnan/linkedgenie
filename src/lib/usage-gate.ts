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
    console.log("DEBUG: authHeader is:", authHeader);
    console.log("DEBUG: token extracted is:", token);

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        console.error("Auth error in usage-gate:", authError);
        return { error: `Invalid session or unauthenticated: ${authError?.message || 'No user found'} [Token received starting with: '${token ? token.substring(0, 10) : 'empty'}']`, status: 401 };
    }

    // 3. Fetch the user's profile using the admin client to bypass RLS 
    // (RLS might block read if they somehow aren't authenticated properly contextually)
    // We use the admin client in server contexts strictly for reading trusted data here
    let { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("is_pro, credits_used")
        .eq("id", user.id)
        .single();

    // If the profile does not exist (e.g. they signed up before we created the DB trigger)
    // PGRST116 is the PostgREST error code for "Results contain 0 rows"
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

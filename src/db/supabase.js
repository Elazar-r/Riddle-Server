/**
 * Supabase Connection Module
 *
 * Manages connection to Supabase for player data
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ quiet: true }); // Load environment variables from .env file

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("✘ Missing Supabase configuration. Please check your .env file.");
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: {
        // Not needed for server-side
        persistSession: false, // Disable session persistence for server-side usage
    },
});


// Test Supabase player connection
async function testSupabaseConnection() {
    try {
        // Simple query to test connection
        const { data, error } = await supabase.from("players").select("id").limit(1);

        if (error && error.code !== "PGRST116") {
            // PGRST116 means table doesn't exist yet, which is OK
            throw error;
        }

        console.log("✔ Supabase connection successful");
        return true;
    } catch (error) {
        console.error("✘ Supabase connection error:", error.message);
        return false;
    }
}

/**
 * Get Supabase client
 */
function getSupabaseClient() {
    return supabase;
}

export default {
    supabase,
    testSupabaseConnection,
    getSupabaseClient,
};
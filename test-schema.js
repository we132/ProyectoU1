import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing DB credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Verifying 'notes' table schema...");
    // Attempt to select columns added in Phase 7
    const { data, error } = await supabase
        .from('notes')
        .select('id, folder_id, title, content, image_url')
        .limit(1);

    if (error) {
        console.error("❌ SUPABASE ERROR DETECTED:");
        console.error(error);
        process.exit(1);
    } else {
        console.log("✅ Supabase 'notes' table seems correctly configured for Phase 7.");
        console.log("Sample Data:", data);
    }
}

checkSchema();

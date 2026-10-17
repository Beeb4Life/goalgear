/**
 * GoalGear - Admin Account Creation Script
 *
 * Can be run via:
 *   node scripts/create-admin.js [email] [password] [fullName]
 *
 * Example:
 *   node scripts/create-admin.js admin@goalgear.demo AdminPass123! "GoalGear Store Admin"
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const args = process.argv.slice(2);
    const email = args[0] || process.env.ADMIN_INITIAL_EMAIL || 'admin@goalgear.demo';
    const password = args[1] || process.env.ADMIN_INITIAL_PASSWORD || 'GoalGearAdmin2026!';
    const fullName = args[2] || 'GoalGear Administrator';

    console.log('====================================================');
    console.log('GoalGear - Secure Admin Account Generator');
    console.log('====================================================');
    console.log(`Email:     ${email}`);
    console.log(`Full Name: ${fullName}`);
    console.log(`Role:      admin`);
    console.log('----------------------------------------------------');

    // Generate secure bcrypt hash (10 salt rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log('Password hash generated successfully.');

    // Generate ready-to-use SQL for Supabase SQL Editor
    const sqlStatement = `
-- Run this query in your Supabase SQL Editor:
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('${email.replace(/'/g, "''")}', '${passwordHash}', '${fullName.replace(/'/g, "''")}', 'admin')
ON CONFLICT (email)
DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = 'admin',
    updated_at = NOW();
    `.trim();

    console.log('\n[Option A] Copy-paste into Supabase SQL Editor:');
    console.log('----------------------------------------------------');
    console.log(sqlStatement);
    console.log('----------------------------------------------------');

    // Attempt direct database insertion if Supabase env vars exist
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('your-project-id')) {
        console.log('\n[Option B] Attempting direct insertion into configured Supabase database...');
        try {
            const supabase = createClient(supabaseUrl, serviceRoleKey);
            const { data, error } = await supabase
                .from('users')
                .upsert(
                    {
                        email,
                        password_hash: passwordHash,
                        full_name: fullName,
                        role: 'admin'
                    },
                    { onConflict: 'email' }
                )
                .select();

            if (error) {
                console.error('Supabase error inserting admin:', error.message);
            } else {
                console.log('SUCCESS: Admin user created or updated directly in Supabase!');
                console.log('Admin User ID:', data[0]?.id);
            }
        } catch (err) {
            console.error('Network or client error connecting to Supabase:', err.message);
        }
    } else {
        console.log('\n(Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not yet configured in .env.');
        console.log('Use [Option A] above to run the SQL in your Supabase dashboard once created.)');
    }
    console.log('====================================================\n');
}

main().catch((err) => {
    console.error('Fatal error generating admin account:', err);
    process.exit(1);
});

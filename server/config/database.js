import { createClient } from '@supabase/supabase-js';

// 🚨 HARDCODED Supabase credentials for local dev (do NOT use in prod)
const supabaseUrl = 'https://pbzofplqbhpbvgcbxisf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiem9mcGxxYmhwYnZnY2J4aXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDU0NDksImV4cCI6MjA2OTg4MTQ0OX0.ma7tEty4lCIVhJ5nFapyQQ4mE4Grn11jddbXEUOwD4M';

// ✅ Initialize Supabase client with hardcoded credentials
export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Test database connection
export const testConnection = async () => {
  try {
    console.log('📡 Testing Supabase connection...');

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    const queryPromise = supabase.from('users').select('*').limit(1);
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.error('❌ Supabase query error:', error.message);
      return false;
    }

    console.log('✅ Supabase responded successfully:');
    console.log(`Found ${data?.length || 0} users in database`);

    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};


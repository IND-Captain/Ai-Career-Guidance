
// Supabase Configuration
// REPLACE THESE WITH YOUR ACTUAL KEYS FROM SUPABASE DASHBOARD
const SUPABASE_URL = 'https://elaowrmpmqbxyllvhmzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYW93cm1wbXFieHlsbHZobXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjYzNDgsImV4cCI6MjA4NTg0MjM0OH0.Hbxto2LornwLqt6c-qI6R_7U3wtTb4IzOffHz5btl6Q';

let supabase;

if (typeof createClient !== 'undefined') {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
} else {
    console.warn('Supabase JS library not loaded.');
}

// Export for other files if using modules (but we are using script tags)
// window.supabase = supabase;

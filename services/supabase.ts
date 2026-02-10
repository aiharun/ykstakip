import { createClient } from '@supabase/supabase-js';

// Environment variables should be used here.
// In a real deployment, ensure process.env.SUPABASE_URL and process.env.SUPABASE_KEY are set.
const supabaseUrl = process.env.SUPABASE_URL || 'https://ytbgindgnwklratuatmt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YmdpbmRnbndrbHJhdHVhdG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTkzMjQsImV4cCI6MjA4NjI5NTMyNH0.r2KeUmDZLuEyvgX1Ip_B34JnFIUdvyoIhgkBEHUlqdw';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const TABLE_NAME = 'study_sessions';

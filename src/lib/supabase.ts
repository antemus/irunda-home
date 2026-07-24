import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lalmyznpdqzjshewndyp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_fundWNwRhexjcTaH31WJ8A_2dsjmFwd';

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';

// 클라이언트 사이드에서는 반드시 NEXT_PUBLIC_ 환경변수만 사용 가능
// SUPABASE_SERVICE_ROLE_KEY는 서버 사이드 전용이라 브라우저에서는 undefined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

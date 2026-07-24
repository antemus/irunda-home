import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lalmyznpdqzjshewndyp.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_fundWNwRhexjcTaH31WJ8A_2dsjmFwd';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { name, phone, message, inquiry_type, property_id, property_title } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: '성함과 연락처는 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('public_inquiries').insert([
      {
        name,
        phone,
        message: message || null,
        inquiry_type: inquiry_type || 'general',
        property_id: property_id || null,
        property_title: property_title || null,
        status: 'pending',
      },
    ]).select();

    if (error) {
      console.error('Supabase Inquiry Insert Error:', error);
      return NextResponse.json({ error: '데이터 저장 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('API Inquiry Route Error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

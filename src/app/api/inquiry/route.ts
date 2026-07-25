import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function sendMobileNotification(inquiryData: {
  name: string;
  phone: string;
  message?: string;
  inquiry_type?: string;
  property_title?: string;
}) {
  const text = `🔔 [이룬다부동산 홈페이지 문의 접수]
- 성함: ${inquiryData.name}
- 연락처: ${inquiryData.phone}
- 문의유형: ${inquiryData.inquiry_type || '일반상담'}
- 대상매물: ${inquiryData.property_title || '일반상담/선택없음'}
- 메모/요청: ${inquiryData.message || '없음'}
- 접수일시: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;

  // 1. 텔레그램 실시간 푸시 알림 (무료 1초 알림)
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  if (telegramToken && telegramChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: text,
        }),
      });
    } catch (e) {
      console.error('Telegram notification error:', e);
    }
  }

  // 2. CoolSMS / Aligo SMS 문자 서비스 알림 (API Key 설정 시)
  const aligoApiKey = process.env.ALIGO_API_KEY;
  const aligoUserId = process.env.ALIGO_USER_ID;
  const targetPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '010-2772-1719';

  if (aligoApiKey && aligoUserId) {
    try {
      const formData = new URLSearchParams();
      formData.append('key', aligoApiKey);
      formData.append('user_id', aligoUserId);
      formData.append('sender', '01027721719');
      formData.append('receiver', targetPhone.replace(/-/g, ''));
      formData.append('msg', `[이룬다부동산 홈페이지 문의]\n성함: ${inquiryData.name}\n연락처: ${inquiryData.phone}\n매물: ${inquiryData.property_title || '일반상담'}`);

      await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: formData,
      });
    } catch (e) {
      console.error('Aligo SMS notification error:', e);
    }
  }
}

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

    // 휴대폰 실시간 알림 발송 실행
    await sendMobileNotification({
      name,
      phone,
      message,
      inquiry_type,
      property_title,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('API Inquiry Route Error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

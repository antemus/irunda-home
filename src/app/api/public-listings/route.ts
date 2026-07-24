import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id, property_no, building_name, address, sido, sigungu, bname, latitude, longitude, property_type, transaction_type, deposit, rent, sale_price, premium, exclusive_area, contract_area, land_area, features, current_status, registered_platforms, created_at')
      .in('is_completed', ['N', 'H'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Public Listings Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // registered_platforms.home === true 인 항목만 반환
    const publicListings = (data || []).filter((item: any) =>
      item.registered_platforms?.home === true ||
      item.registered_platforms?.home === 'true'
    );

    return NextResponse.json(publicListings);
  } catch (err: any) {
    console.error('Route GET Catch Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

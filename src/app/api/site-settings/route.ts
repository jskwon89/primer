import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// 기본값: 모든 섹션 켜짐
const defaultSettings: Record<string, boolean> = {
  services: true,
  value_proposition: true,
  how_it_works: true,
  contact: true,
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .eq('category', 'landing_sections');

    if (error) {
      // 테이블이 없으면 기본값 반환
      return NextResponse.json({ settings: defaultSettings });
    }

    const settings = { ...defaultSettings };
    for (const row of data ?? []) {
      settings[row.key] = row.value === 'true' || row.value === true;
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ settings: defaultSettings });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings } = body as { settings: Record<string, boolean> };

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }

    // 각 키별로 upsert
    const upserts = Object.entries(settings).map(([key, value]) => ({
      category: 'landing_sections',
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(upserts, { onConflict: 'category,key' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

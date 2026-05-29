import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  const sb = createServerClient();
  if (key) {
    const { data } = await sb.from('settings').select('value').eq('key', key).single();
    return NextResponse.json({ value: data?.value ?? null });
  }
  const { data } = await sb.from('settings').select('*');
  return NextResponse.json(data ?? []);
}

export async function PUT(req: NextRequest) {
  const { key, value } = await req.json();
  const sb = createServerClient();
  const { error } = await sb.from('settings').upsert({ key, value });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

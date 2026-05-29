import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const sb = createServerClient();
  const { data, error } = await sb.from('tree_nodes').select('*').order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json(); // { id, value }
  const sb = createServerClient();
  const { data, error } = await sb
    .from('tree_nodes')
    .update({ value: body.value })
    .eq('id', body.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json(); // array of { label, value } for bulk upsert
  const sb = createServerClient();
  for (const row of body) {
    await sb
      .from('tree_nodes')
      .update({ value: row.value })
      .eq('label', row.label);
  }
  return NextResponse.json({ ok: true });
}

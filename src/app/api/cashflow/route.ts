import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const sb = createServerClient();
  const { data, error } = await sb.from('cashflow').select('*').order('rec_id').order('quarter');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  // { id, cost_out?, saving_in? }
  const body = await req.json();
  const { id, ...update } = body;
  const sb = createServerClient();
  const { data, error } = await sb.from('cashflow').update(update).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  // Create cashflow rows for a new recommendation
  const body = await req.json(); // { rec_id, rows: [{ quarter, cost_out, saving_in }] }
  const sb = createServerClient();
  const rows = body.rows.map((r: { quarter: number; cost_out: number; saving_in: number }) => ({
    rec_id: body.rec_id,
    quarter: r.quarter,
    cost_out: r.cost_out ?? 0,
    saving_in: r.saving_in ?? 0,
  }));
  const { error } = await sb.from('cashflow').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const sb = createServerClient();
  const { data, error } = await sb.from('options').select('*').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = createServerClient();
  const { data, error } = await sb.from('options').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  // Promote stage: { id, stage }
  const body = await req.json();
  const sb = createServerClient();

  if (body.promote) {
    const next: Record<string, string> = { could: 'can', can: 'should' };
    const { data: current } = await sb.from('options').select('stage').eq('id', body.id).single();
    if (!current) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const newStage = next[current.stage as string];
    if (!newStage) {
      // should → recommendations
      const { data: opt } = await sb.from('options').select('*').eq('id', body.id).single();
      if (opt) {
        await sb.from('recommendations').insert({
          title: (opt as { title: string }).title,
          pillar: null,
          tree_node: (opt as { tree_node: string | null }).tree_node,
          impact_low: (opt as { impact_low: number | null }).impact_low,
          impact_high: (opt as { impact_high: number | null }).impact_high,
          approved: false,
          horizons: null,
        });
      }
      return NextResponse.json({ promoted_to: 'recommendations' });
    }
    const { data, error } = await sb.from('options').update({ stage: newStage }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await sb.from('options').update(body).eq('id', body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

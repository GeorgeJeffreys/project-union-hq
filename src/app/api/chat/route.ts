import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@/lib/supabase';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const sb = createServerClient();

  // Fetch fresh live data before every call
  const [tasks, scenarios, recommendations, options, cashflow] = await Promise.all([
    sb.from('tasks').select('*').then(r => r.data ?? []),
    sb.from('scenarios').select('*').then(r => r.data ?? []),
    sb.from('recommendations').select('*').then(r => r.data ?? []),
    sb.from('options').select('*').then(r => r.data ?? []),
    sb.from('cashflow').select('*').then(r => r.data ?? []),
  ]);

  const approvedRecs = (recommendations as { approved: boolean }[]).filter(r => r.approved);

  const systemPrompt = `You are a McKinsey-level strategy consultant assistant for Project Union — a consulting engagement for Designers Guild (DG), a British luxury fabric and wallpaper brand. The engagement objective is to maximise EBITDA from -£2m to +£5-7m and position DG for a premium exit sale in 24-30 months.

LIVE DATA SNAPSHOT:
current_scenarios: ${JSON.stringify(scenarios)}
approved_recommendations: ${JSON.stringify(approvedRecs)}
all_recommendations: ${JSON.stringify(recommendations)}
options_pipeline: ${JSON.stringify(options)}
cashflow_summary: ${JSON.stringify(cashflow)}
tasks: ${JSON.stringify(tasks)}

CAPABILITIES:
1. Answer analytical questions about the data with specific £ figures
2. Suggest new options or recommendations with specific £ impact estimates
3. Analyse Excel data the user pastes or describes
4. When the user asks you to ADD, CREATE, or RECOMMEND something that should be saved to the app, respond conversationally first, then append one or more action blocks in this exact format — no markdown, no explanation inside the tags:

<action>{"type":"add_recommendation","data":{"title":"...","pillar":"...","tree_node":"...","impact_low":0,"impact_high":0,"approved":false,"horizons":{"h0_3":{"owner":"","actions":""},"h3_12":{"owner":"","actions":""},"h12_24":{"owner":"","actions":""}}}}</action>

<action>{"type":"add_task","data":{"lane":"Discovery","week":1,"title":"...","type":"discussion","owner":"","notes":""}}</action>

<action>{"type":"add_option","data":{"workstream":"revenue","stage":"could","title":"...","description":"...","impact_low":0,"impact_high":0,"cash_cost":0,"tree_node":"","rationale":""}}</action>

<action>{"type":"add_scenario","data":{"name":"...","is_baseline":false,"inputs":{}}}</action>

Always use numbers not strings for impact and cash fields.
Always include all fields even if empty string.

Be specific, data-driven, and commercially rigorous in all responses. Speak in the voice of a senior McKinsey partner.`;

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';

  // Persist messages
  await sb.from('chat_messages').insert([
    { role: 'user', content: message },
    { role: 'assistant', content },
  ]);

  return NextResponse.json({ content });
}

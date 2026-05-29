export type TaskType = 'discussion' | 'analysis' | 'problem' | 'recommendation' | 'done';

export interface Task {
  id: string;
  lane: string;
  week: number;
  title: string;
  type: TaskType;
  owner: string | null;
  notes: string | null;
  created_at: string;
}

export interface TreeNode {
  id: string;
  label: string;
  value: string | null;
  parent_id: string | null;
  is_editable: boolean;
  sort_order: number;
  created_at: string;
  children?: TreeNode[];
}

export type Workstream = 'revenue' | 'cost';
export type Stage = 'could' | 'can' | 'should';

export interface Option {
  id: string;
  workstream: Workstream;
  stage: Stage;
  title: string;
  description: string | null;
  impact_low: number | null;
  impact_high: number | null;
  cash_cost: number | null;
  tree_node: string | null;
  rationale: string | null;
  created_at: string;
}

export interface ScenarioInputs {
  trade_revenue: number;
  us_revenue: number;
  dtc_revenue: number;
  avg_price_uplift_pct: number;
  gross_margin_pct: number;
  property: number;
  headcount: number;
  marketing: number;
  other_overhead: number;
}

export interface Scenario {
  id: string;
  name: string;
  is_baseline: boolean;
  inputs: ScenarioInputs;
  created_at: string;
}

export interface HorizonPlan {
  actions: string;
  owner: string;
}

export interface Horizons {
  h0_3: HorizonPlan;
  h3_12: HorizonPlan;
  h12_24: HorizonPlan;
}

export interface Recommendation {
  id: string;
  title: string;
  pillar: string | null;
  tree_node: string | null;
  impact_low: number | null;
  impact_high: number | null;
  approved: boolean;
  horizons: Horizons | null;
  created_at: string;
}

export interface Cashflow {
  id: string;
  rec_id: string;
  quarter: number;
  cost_out: number;
  saving_in: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Claude action types
export type ActionType = 'add_recommendation' | 'add_task' | 'add_option';

export interface ClaudeAction {
  type: ActionType;
  data: Record<string, unknown>;
}

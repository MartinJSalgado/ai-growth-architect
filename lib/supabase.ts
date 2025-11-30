import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to generate a session ID for anonymous users
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("session_id");

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("session_id", sessionId);
  }

  return sessionId;
}

// Database types
export interface OnboardingDataRow {
  id?: string;
  user_id?: string | null;
  session_id: string;
  company_name: string;
  what_you_sell: string;
  who_you_sell_to: string;
  primary_goal: string;
  channels: string[];
  biggest_challenge: string;
  history?: string | null;
  brand_personality: string[];
  fabric_maturity: Record<string, number>;
  selected_sections: string[];
  layout_preference: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GrowthPlanRow {
  id?: string;
  onboarding_id: string;
  user_id?: string | null;
  session_id: string;
  summary: string;
  sections: Record<string, string>;
  created_at?: string;
  regenerated_count?: number;
}

export interface ConversationRow {
  id?: string;
  onboarding_id: string;
  user_id?: string | null;
  session_id: string;
  messages: Array<{ sender: string; text: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface AnalyticsEventRow {
  id?: string;
  user_id?: string | null;
  session_id: string;
  onboarding_id?: string | null;
  event_type: string;
  event_data?: Record<string, any>;
  created_at?: string;
}

-- Users (Extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade,
  is_anonymous boolean default false,
  consented_to_biometrics boolean default false, -- Explicit consent required [GDPR]
  baseline_stress_score float -- For tracking "Drift" over time
);

-- Triage Logs (The "Digital Psychological Signature")
create table triage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  text_sentiment float, -- -1.0 to 1.0
  voice_jitter float, -- acoustic biomarker
  face_valence float, -- visual biomarker
  risk_level text check (risk_level in ('low', 'moderate', 'crisis')),
  ai_rationale text, -- For Explainability (XAI)
  triggered_guardrail boolean default false
);

-- Journal Entries (Encrypted)
create table entries (
  id uuid primary key,
  user_id uuid references profiles(id),
  content_encrypted text, -- Must use PGP encryption
  ai_summary text -- Non-sensitive summary for dashboard
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table triage_events enable row level security;
alter table entries enable row level security;

-- Policies (Basic RLS placeholder - adjust as needed)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can insert own triage events" on triage_events for insert with check (auth.uid() = user_id);
create policy "Users can view own triage events" on triage_events for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on entries for insert with check (auth.uid() = user_id);
create policy "Users can view own entries" on entries for select using (auth.uid() = user_id);

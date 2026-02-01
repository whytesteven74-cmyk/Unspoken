-- Enable RLS on tables
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TriageEvent" ENABLE ROW LEVEL SECURITY;

-- Policies for Profile
CREATE POLICY "Users can only view their own profile" 
ON "Profile" FOR SELECT 
USING (auth.uid()::text = id);

CREATE POLICY "Users can only update their own profile" 
ON "Profile" FOR UPDATE 
USING (auth.uid()::text = id);

-- Policies for Message
CREATE POLICY "Users can only view their own messages" 
ON "Message" FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own messages" 
ON "Message" FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Policies for TriageEvent
CREATE POLICY "Users can only view their own triage events" 
ON "TriageEvent" FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own triage events" 
ON "TriageEvent" FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

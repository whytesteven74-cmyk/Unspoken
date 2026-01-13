-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "consented_to_biometrics" BOOLEAN NOT NULL DEFAULT false,
    "baseline_stress_score" REAL
);

-- CreateTable
CREATE TABLE "TriageEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text_sentiment" REAL,
    "voice_jitter" REAL,
    "face_valence" REAL,
    "risk_level" TEXT,
    "ai_rationale" TEXT,
    "triggered_guardrail" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TriageEvent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "content_encrypted" TEXT,
    "ai_summary" TEXT,
    CONSTRAINT "Entry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

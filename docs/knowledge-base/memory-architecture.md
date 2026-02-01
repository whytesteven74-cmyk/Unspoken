# Research: Long-Term Memory Architecture 🧠
**Date**: February 1, 2026
**Status**: Proposal

## The Challenge
Standard LLM chat history (Short-Term Memory) is limited by context windows and doesn't persist key facts *across* sessions efficiently. For a therapy AI, remembering that "The user's mother is named Sarah" or "The user has anxiety on Sundays" is critical for trust.

## Proposed Solution: Hybrid Memory System

### 1. The "Fact Store" (Explicit Memory)
A structured table `UserFacts` extracting key entities from conversations.
*   **Structure**: `(user_id, fact_category, fact_content, confidence_score)`
*   **Example**: `("123", "FAMILY", "Mother is Sarah", 0.95)`
*   **Mechanism**: A background job (Edge Function) runs after each session to summarize and extract facts.

### 2. The "Semantic Store" (Implicit Memory)
Using `pgvector` in Supabase to store embeddings of user messages.
*   **Structure**: `(user_id, content, embedding_vector)`
*   **Mechanism**: When user asks "What did I say about my job?", we perform a cosine similarity search on past messages.

## Implementation Roadmap (Phase 9)

1.  **Schema Update**:
    *   Enable `vector` extension in Supabase.
    *   Create `UserMemory` table.

2.  **Account Management UI (`/account`)**:
    *   **Transparency**: User can view what the AI "knows" (Facts).
    *   **Control**: "Forget this fact" button (GDPR/Privacy compliance).

## Privacy Considerations
*   Memory must be strictly scoped to `user_id` via RLS (Row Level Security).
*   "Nuclear Option": Button to wipe all memory embeddings without deleting the account.

## Recommendation
Start with **Explicit Memory (Fact Store)** via simple summarization first. It is cheaper, more predictable, and easier to display in the Account UI for user verification, which builds trust.

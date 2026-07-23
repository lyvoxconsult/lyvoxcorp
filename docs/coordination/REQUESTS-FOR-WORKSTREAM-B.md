# REQUESTS FROM WORKSTREAM A → WORKSTREAM B

> **Branch:** `parallel/a-stabilization-platform`  
> **Date:** 2026-07-23  
> **Status:** Initial requests  

---

## 1. DO NOT touch these files (A is actively working on them)

During Phases 023–026, the following areas are under active stabilization:

- `apps/api/src/services/*` — build/typecheck failures being resolved
- `apps/web/src/features/meetings/*` — MeetingFormDialog fixes pending
- `apps/api/src/middleware/*` — CSRF middleware fixes pending
- `apps/api/src/routes/*` — OpenAPI spec alignment pending
- `apps/api/src/db/` — migrations 0010+ are YOUR domain, do NOT touch anything before 0010

## 2. MIGRATION OWNERSHIP RULE

- **Phases 001–009:** Owned by Greenfield Foundation (already merged)
- **Phase 010 and below:** LOCKED — do not modify
- **Migrations 010+:** YOUR domain exclusively
- Do NOT create or modify migrations in the 0001–0009 range

## 3. INTEGRATION COORDINATION

When you reach a stable point in Phases 016–022, please:

1. Push your changes to `origin/parallel/b-business-016-022`
2. Confirm the marker commit exists: `docs(coordination): workstream B phases 016-022 ready`
3. Wait for this workstream to create `integration/lyvox-completion` branch

## 4. KNOWN CONFLICTS TO WATCH

- `apps/api/src/db/schema.ts` — may have additions from both sides; coordinate before touching
- `packages/shared/src/types.ts` — shared types; minimal changes expected from A

## 5. QUESTIONS FOR WORKSTREAM B

- [ ] Do you need any shared types added before integration?
- [ ] Are there any new migrations that reference tables we've modified?
- [ ] What is the expected timeline for B phases 016–022 completion?

# Time Capsule — Architecture

## Overview
Next.js 14 App Router application providing encrypted time capsules.

## Trust Boundaries & Security
- **KEK (Key Encryption Key):** Stored in Supabase Vault (v1.5) or Environment Variables (v1). NEVER in the database.
- **DEK (Data Encryption Key):** Generated per-capsule. Encrypted by KEK and stored in DB.
- **Encryption:** AES-256-GCM with unique IVs and AAD (capsuleId:itemId).
- **Quantum Resistance:** Hybrid approach planned for v2.

## Implementation Strategies (Critique & Improvement Fixes)
- **User Mirroring:** Moved from Middleware to an async background job or a `protectedProcedure` decorator to avoid latency.
- **Rate Limiting:** Global rate limiting via Upstash Redis.
- **Cron Job:** Decoupled email sending via Resend's batching or a queue to fit within Vercel's 10s limit.
- **Mobile Dev:** Optimized build scripts for low-resource environments.

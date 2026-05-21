# Time Capsule

A platform for creating digital time capsules — messages, photos, videos, and other mementos locked until a specified unlock date, then optionally delivered to chosen recipients.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind + shadcn/ui
- tRPC v11
- Prisma → Supabase Postgres
- Supabase Auth (SSR cookies) + Storage
- Resend for email
- Vercel hosting + Vercel Cron for unlock scheduling

## Local development

    git clone https://github.com/Bobbygkmc/time_capsule.git
    cd time_capsule
    cp .env.example .env.local   # populate keys
    npm install
    npx prisma generate
    npx prisma migrate dev
    npm run dev


# Supabase Auth Redirect Checklist

These settings must be configured in the **Supabase Dashboard** before the app
handles any real user logins. Incorrect redirect URLs cause silent auth failures
(the OTP email link lands on an error page).

---

## Dashboard Location

Supabase Dashboard → **Authentication** → **URL Configuration**

---

## Settings to Configure

### 1. Site URL

```
https://timecapsule.uyammadu.com
```

This is the primary origin Supabase uses for auth flows. Set it to the canonical
production URL — no trailing slash.

### 2. Redirect URLs (allow-list)

Add **both** of these entries:

```
https://timecapsule.uyammadu.com/auth/callback
https://timecapsule.uyammadu.com/**
```

The first is the exact callback route used by `src/app/auth/callback/route.ts`.
The second is a wildcard for the `next` query-param redirects (e.g. `/dashboard`).

> **During development only**, you may also add `http://localhost:3000/**`.
> Remove localhost entries before go-live.

### 3. Email Template — OTP Magic Link

The login flow (`src/app/(auth)/login/page.tsx`) sends OTP via
`supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: ... } })`.

The `emailRedirectTo` is constructed as:
```
<window.location.origin>/auth/callback
```

In production this resolves to `https://timecapsule.uyammadu.com/auth/callback`.

**No changes needed to email templates** — the URL is set dynamically from the
browser's `window.location.origin`. Just confirm the allow-list above includes
the callback URL.

---

## Verification

After configuring:
1. Click "Send test email" in Supabase Auth → Email Templates
2. Click the link in the email — it should land on `/dashboard` (if logged in) or redirect back to `/login?error=...` with a clear error (not a blank page)
3. Perform a full OTP login flow on the production URL end-to-end

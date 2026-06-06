# Rollback Steps

## Strategy

Each release is deployed into a timestamped directory under `/srv/timecapsule/releases/`.
A symlink `/srv/timecapsule/current` points to the active release.
The systemd unit's `WorkingDirectory` points through the symlink.

---

## Directory Layout

```
/srv/timecapsule/
├── releases/
│   ├── 20260523-140000/      ← previous release
│   │   └── time-capsule/
│   └── 20260524-093000/      ← current release
│       └── time-capsule/
├── current -> releases/20260524-093000  ← symlink
└── shared/
    └── .env                  ← shared env file, symlinked into each release
```

---

## Deploy Procedure (sets up rollback automatically)

```bash
RELEASE_DIR="/srv/timecapsule/releases/$(date +%Y%m%d-%H%M%S)"

# 1. Clone / copy the new build
git clone --depth 1 git@github.com:Bobbygkmc/time_capsule.git "$RELEASE_DIR"
cd "$RELEASE_DIR/time-capsule"

# 2. Install & build
npm ci
SKIP_ENV_VALIDATION=1 npm run build

# 3. Link shared static assets into the standalone bundle
STANDALONE="$RELEASE_DIR/time-capsule/.next/standalone/time-capsule"
ln -sfn "$RELEASE_DIR/time-capsule/public"         "$STANDALONE/public"
ln -sfn "$RELEASE_DIR/time-capsule/.next/static"   "$STANDALONE/.next/static"

# 4. Run migrations (against DIRECT_URL from env)
npx prisma migrate deploy

# 5. Swing the symlink
ln -sfn "$RELEASE_DIR" /srv/timecapsule/current

# 6. Restart service
sudo systemctl restart timecapsule
sudo systemctl status timecapsule

# 7. Smoke test
sleep 3
curl -sI http://127.0.0.1:3000 | head -1
# Expected: HTTP/1.1 307 Temporary Redirect
```

---

## Rollback Procedure

```bash
# List available releases (newest last)
ls -lt /srv/timecapsule/releases/

# Pick the previous release
PREVIOUS="/srv/timecapsule/releases/<timestamp-of-previous>"

# Swing the symlink back
ln -sfn "$PREVIOUS" /srv/timecapsule/current

# Restart
sudo systemctl restart timecapsule
sudo systemctl status timecapsule

# Confirm
sleep 3
curl -sI http://127.0.0.1:3000 | head -1
```

> **Note on database migrations:** If the new release ran schema migrations,
> rolling back the app code does NOT automatically reverse the migration.
> For non-destructive migrations (adding columns/tables) this is usually fine —
> the old code ignores new columns.
> For destructive migrations (dropping columns/tables), coordinate with the DB
> team before rolling back.

---

## Keeping Only N Releases

```bash
# Keep the 3 most recent releases, delete the rest
ls -dt /srv/timecapsule/releases/* | tail -n +4 | xargs rm -rf
```

---

## Emergency: Force Stop

```bash
sudo systemctl stop timecapsule
# App is offline. Cloudflare Tunnel will serve a 502 to users.
# Fix the issue, then: sudo systemctl start timecapsule
```

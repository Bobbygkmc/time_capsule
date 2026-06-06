# systemd Service Draft — timecapsule.service

## Assumptions

| Item | Value |
|------|-------|
| App user | `timecapsule` (dedicated, no login shell) |
| App directory | `/srv/timecapsule/time-capsule` |
| Env file | `/etc/timecapsule/env` (600, owned by root) |
| Node binary | `/usr/bin/node` (or from `nvm`/`fnm` — adjust path) |
| Listen port | `3000` (Cloudflare Tunnel forwards to this) |

---

## Deployment Layout

```
/srv/timecapsule/
└── time-capsule/
    ├── .next/
    │   └── standalone/
    │       └── time-capsule/
    │           └── server.js      ← entry point
    ├── public/                    ← must be symlinked or copied here
    └── .next/static/              ← must be symlinked or copied here
```

> **Important:** The standalone bundle does NOT include `public/` or `.next/static/`.
> After each deploy, copy (or symlink) them:
>
> ```bash
> cp -r .next/standalone/time-capsule/.next/static .next/standalone/time-capsule/.next/static || true
> # or symlink:
> ln -sfn /srv/timecapsule/time-capsule/.next/static \
>         /srv/timecapsule/time-capsule/.next/standalone/time-capsule/.next/static
> ln -sfn /srv/timecapsule/time-capsule/public \
>         /srv/timecapsule/time-capsule/.next/standalone/time-capsule/public
> ```

---

## Unit File

Save as `/etc/systemd/system/timecapsule.service`:

```ini
[Unit]
Description=TimeCapsule Next.js App
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=timecapsule
Group=timecapsule
WorkingDirectory=/srv/timecapsule/time-capsule/.next/standalone/time-capsule

# Secrets/config — file must be 600 owned by root, readable by systemd
EnvironmentFile=/etc/timecapsule/env

# Bind only to loopback; Cloudflare Tunnel is the public entry point
Environment=HOSTNAME=127.0.0.1
Environment=PORT=3000
Environment=NODE_ENV=production

ExecStart=/usr/bin/node server.js

# Restart policy
Restart=on-failure
RestartSec=5s
StartLimitIntervalSec=60
StartLimitBurst=3

# Hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/timecapsule/time-capsule/.next/cache

# Logging (journald)
StandardOutput=journal
StandardError=journal
SyslogIdentifier=timecapsule

[Install]
WantedBy=multi-user.target
```

---

## `/etc/timecapsule/env` Template

```bash
# Set permissions: sudo chmod 600 /etc/timecapsule/env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://timecapsule.uyammadu.com
CRON_SECRET=<openssl rand -hex 32>
```

---

## Activation Commands

```bash
# First-time setup
sudo systemctl daemon-reload
sudo systemctl enable timecapsule
sudo systemctl start timecapsule
sudo systemctl status timecapsule

# View logs
sudo journalctl -u timecapsule -f

# After an update
sudo systemctl restart timecapsule
```

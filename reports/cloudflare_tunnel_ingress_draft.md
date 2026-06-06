# Cloudflare Tunnel Ingress Draft

## Prerequisites

- `cloudflared` installed on the server
- A Cloudflare Tunnel created: `cloudflared tunnel create timecapsule`
- The tunnel UUID noted (shown after creation)
- DNS CNAME `timecapsule.uyammadu.com → <uuid>.cfargotunnel.com` added in Cloudflare Dashboard

---

## Config File

Save as `~/.cloudflared/config.yml` (or `/etc/cloudflared/config.yml` for system-wide):

```yaml
tunnel: <your-tunnel-uuid>
credentials-file: /home/<user>/.cloudflared/<your-tunnel-uuid>.json

ingress:
  - hostname: timecapsule.uyammadu.com
    service: http://127.0.0.1:3000
    originRequest:
      # Pass the real client IP to Next.js via X-Forwarded-For
      noTLSVerify: false
      connectTimeout: 30s
      tcpKeepAlive: 30s
      keepAliveConnections: 100
      keepAliveTimeout: 90s

  # Catch-all: return 404 for any other hostname
  - service: http_status:404
```

---

## Security Notes

- `HOSTNAME=127.0.0.1` in the systemd unit ensures Next.js only listens on loopback — Cloudflare Tunnel is the only public entry point.
- TLS termination is handled by Cloudflare; traffic from the tunnel to `localhost:3000` is plain HTTP on the loopback interface (acceptable).
- Enable **Under Attack Mode** or **Bot Fight Mode** in the Cloudflare dashboard for additional protection.

---

## systemd Unit for cloudflared

```ini
# /etc/systemd/system/cloudflared.service
# (usually installed automatically by: cloudflared service install)
[Unit]
Description=Cloudflare Tunnel
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=cloudflared
ExecStart=/usr/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## Verify Tunnel

```bash
# Should show the tunnel as healthy
cloudflared tunnel info timecapsule

# End-to-end check
curl -I https://timecapsule.uyammadu.com
# Expected: 307 redirect to /login (middleware auth)
```

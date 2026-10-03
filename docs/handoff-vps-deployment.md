# Handoff: first production deploy on the OVHcloud VPS (Coolify)

Next session's focus: everything that has to happen **on the VPS and in the Coolify panel** before
and right after the first production deploy. The code side is finished.

## State of the work

- The Netlify → Coolify/SQLite migration is merged: `origin/devel` was fast-forwarded to
  `56d238e`. The local `devel` in the main checkout is **not** updated yet:
  `git -C /home/przemek/work/priv/tewu-webiste pull --ff-only`.
- The worktree `.worktrees/feat-coolify-migration` and branch `feat/coolify-migration` still exist
  and can be removed once the user confirms.
- The code went through three review rounds; the fixes are in commits `49a4c90`, `9805774`,
  `ebb7136`, `c4b4603`, `56d238e`.
- Design and reasoning: `docs/adr/0003-migration-to-coolify-ovhcloud-and-sqlite.md`.
- Coolify steps in prose and the env variable table: `README.md` ("Konfiguracja środowiska",
  "Wdrożenie w Coolify na VPS OVHcloud").
- Not part of this work: Google Maps / GA4 disclosure in the privacy policy. It is deliberately
  left out of the policy for now and will come with the GA4 implementation.

## Facts the deploy must keep true

The privacy policy (`src/i18n/pl.ts`, `src/i18n/uk.ts`) states each of these, so each must hold
in production:

| Policy statement | What makes it true |
|---|---|
| Hosting by OVH Sp. z o.o. (Wrocław) under a DPA | VPS ordered from OVH Sp. z o.o.; DPA accepted in the OVH account |
| Server and buffer are in the EEA | VPS in an EEA data centre (WAW, GRA, SBG, RBX, DE) |
| Logs deleted after 7 days | Step 3 (logrotate) and step 2 (no Docker size rotation) |
| Buffered requests deleted after `CALLBACK_OUTBOX_TTL_HOURS` (72 h by default) | Scheduled task running every 10 min (step 6) |

## Steps

Placeholders: `<vps>` is the SSH host, `<app-container>` is the app container's name. Never paste
real secret values into this file, a commit or chat.

### 1. Check the VPS location (OVHcloud panel)

In the OVHcloud Control Panel, open the VPS details and confirm the data centre is in the EEA, and
that the contract party is OVH Sp. z o.o. If it isn't, stop: the privacy policy would be false.

### 2. Docker log options (on the VPS)

Docker's own size-based rotation keeps old log files by count, not by age, so they can outlive 7
days. Remove it and let logrotate (step 3) handle retention.

```bash
ssh <vps>
sudo cat /etc/docker/daemon.json
```

If the output contains `"log-opts"` with `max-size` / `max-file` (the Coolify installer may add
them), remove only that key and keep everything else:

```bash
sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.bak
sudo apt-get install -y jq          # if jq is missing
sudo jq 'del(."log-opts")' /etc/docker/daemon.json.bak | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker       # restarts ALL containers, Coolify included
```

`log-opts` only apply to newly created containers, so do this **before** the first app deploy, or
redeploy the app afterwards. After a Coolify upgrade, check `daemon.json` again.

### 3. Install logrotate config for container logs (on the VPS)

The file is in the repo: `deploy/logrotate/docker-containers` (the comments explain each line).
From the local repo:

```bash
scp deploy/logrotate/docker-containers <vps>:/tmp/docker-containers
ssh <vps>
sudo install -m 644 -o root -g root /tmp/docker-containers /etc/logrotate.d/docker-containers
rm /tmp/docker-containers
sudo logrotate --debug /etc/logrotate.d/docker-containers   # dry run: no errors expected
systemctl status logrotate.timer                             # must be active (runs daily)
```

If the Coolify proxy (Traefik) access log is turned on, add its log path to that file.

### 4. Generate secrets (locally or on the VPS)

```bash
openssl rand -hex 32   # CRON_SECRET
openssl rand -hex 32   # OUTBOX_ENCRYPTION_KEY
```

Store them in a password manager. Changing `OUTBOX_ENCRYPTION_KEY` later makes pending buffered
requests unreadable; they are deleted with a Telegram alert.

### 5. Create the application in Coolify (panel)

1. New resource → **Application** → Git repository, branch to deploy, build pack **Dockerfile**.
2. Ports Exposes: `3000`. Set the domain; Coolify's proxy issues the TLS certificate. Don't publish
   port 3000 on the host.
3. **Storages**: add a volume, destination path `/app/data` (name e.g. `tewu-data`). For a bind
   mount instead, run `sudo chown -R 1001:1001 <host-path>` on the VPS first.
4. **Environment Variables**: all variables from the table in `README.md`. Mark
   `CALLBACK_OUTBOX_TTL_HOURS`, `NEXT_PUBLIC_CALLBACK_CALL_NUMBER` and
   `NEXT_PUBLIC_EXTRA_CLOSED_DATES` as **Build Variable**. `CALLBACK_OUTBOX_TTL_HOURS` must also
   stay available at runtime.
5. Deploy.

### 6. Scheduled task (panel)

In the app's **Scheduled Tasks**, add a task with the cron expression `*/10 * * * *` and this
command (it runs inside the container; the image has no `curl`):

```bash
wget -qO- --post-data='' --header="Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/internal/process-outbox
```

Run it once by hand. Expected output: `{"processed":0,…,"keyMissing":false}`.
`{"status":"skipped","reason":"run-in-progress"}` is also fine: it means the previous run was
still going.

### 7. Verify on the VPS

```bash
ssh <vps>
docker ps --format '{{.Names}}  {{.Image}}  {{.Status}}'                    # find <app-container>
docker inspect -f '{{.State.Health.Status}}' <app-container>                  # healthy
docker exec <app-container> ls -la /app/data                                  # outbox.db owned by nextjs
docker logs <app-container> 2>&1 | grep -E '\[Startup\]|Run finished' | tail  # no [Startup] error
docker inspect -f '{{.HostConfig.LogConfig}}' <app-container>                 # json-file, no max-size
```

Then:

- Open `https://<domain>/polityka-prywatnosci` and check the retention hours shown match
  `CALLBACK_OUTBOX_TTL_HOURS`.
- Send one real callback request through the site and confirm the email arrives.
- If Telegram is configured, confirm the ping arrives and contains no phone number.

### 8. Decisions for the owner

- **Backups:** OVH snapshots or Coolify volume backups of `/app/data` would keep buffered requests
  longer than the TTL stated in the policy. Either exclude the volume from backups, or keep backup
  retention at most the TTL.
- **Open legal items:** listed in `README.md` under "Otwarte kwestie prawne i organizacyjne".

## Suggested skills

- `mattpocock-skills:wizard`: turn steps 1–7 into an interactive script that walks the user through
  the parts only they can do (panel clicks, SSH with sudo).
- `superpowers:verification-before-completion`: before saying the deploy is done, run step 7 and
  report the actual output.
- `superpowers:systematic-debugging`: if the health check, the scheduled task or the database
  fails after deploy.

# Mission-Control

Source for the Mission Control page at
https://openclaw.internal:8443/mission-control.

## Weekly update

1. Replace `mission_control.html` in this repo with the new file.
2. Commit and push to `main`.

It is live within about a minute. No build, no restart.

On the server, with the new file at `~/mission_control.html`:

```sh
cd ~/mission-control
cp ~/mission_control.html mission_control.html
git commit -am "Mission Control update $(date +%F)" && git push
```

Drop the file in exactly as generated. The DeFi and Postcard dashboard links
are added when the page is served, so the file never needs editing.

## How it is served

```
nginx :8443  /mission-control  (snippets/openclaw-custom-routes.conf, guarded by openclaw-route-guard)
  -> 127.0.0.1:3002            (Docker container mission-control-app, Next.js)
  -> src/app/route.ts          (copy of deploy/route.ts)
  -> reads site/mission_control.html on every request and adds the dashboard links
```

- App source: `/opt/openclaw/state/workspace/mission-control` (part of the
  eBay-Postcard-Pipeline repo; it also serves `/defi` and
  `/mission-control/postcards`).
- `site/` inside it is a clone of this repo (the deploy checkout, excluded
  from the parent repo via `.git/info/exclude`).
- `deploy/sync.sh` runs every minute from scottadmin's crontab, fetches
  `origin/main` and resets the checkout to it. Deploys are logged to
  `~/.local/state/mission-control-deploy.log`.

The links injected under the page header are:

- Open DeFi Mission Control -> `/defi`
- Open Postcard ledger -> `/mission-control/postcards`

To change them, edit `deploy/route.ts`, copy it to `src/app/route.ts` in the
app, and restart the container (`docker restart mission-control-app`), which
rebuilds the app.

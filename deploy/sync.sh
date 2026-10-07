#!/usr/bin/env bash
# Pull-to-deploy for the /mission-control page.
#
# Runs every minute from scottadmin's crontab against the deploy checkout at
# /opt/openclaw/state/workspace/mission-control/site. The Next.js app
# (container mission-control-app) reads site/mission_control.html on every
# request, so updating this checkout is the whole deploy: no build, no restart.
set -euo pipefail

SITE_DIR="${SITE_DIR:-/opt/openclaw/state/workspace/mission-control/site}"
LOG="${LOG:-$HOME/.local/state/mission-control-deploy.log}"

mkdir -p "$(dirname "$LOG")"
exec 9>"$SITE_DIR/.git/sync.lock"
flock -n 9 || exit 0

cd "$SITE_DIR"
before="$(git rev-parse HEAD)"
if ! out="$(git fetch -q origin main 2>&1)"; then
    echo "$(date -Is) fetch failed: $out" >>"$LOG"
    exit 1
fi
after="$(git rev-parse origin/main)"

if [[ "$before" != "$after" ]]; then
    git reset -q --hard origin/main
    echo "$(date -Is) deployed $(git log -1 --format='%h %s')" >>"$LOG"
fi

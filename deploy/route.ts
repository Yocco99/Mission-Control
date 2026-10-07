// Mission Control home page (/mission-control).
//
// Installed as src/app/route.ts in the mission-control Next.js app
// (/opt/openclaw/state/workspace/mission-control). The page content is the
// weekly mission_control.html from the Yocco99/Mission-Control repo, checked
// out at ./site and kept current by deploy/sync.sh. It is read on every
// request, so a new push goes live without rebuilding the app.
//
// The DeFi and Postcard dashboard links are injected here rather than written
// into the HTML, so they survive each weekly replacement of the file.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const PAGE_PATH = path.join(process.cwd(), 'site', 'mission_control.html');

const DASHBOARD_LINKS = `
<nav class="mc-dashboard-links" style="display:flex;gap:16px;flex-wrap:wrap;margin:-8px 0 20px;font-size:14px">
  <a href="/defi" style="color:var(--accent,#2563eb)">Open DeFi Mission Control</a>
  <a href="/mission-control/postcards" style="color:var(--accent,#2563eb)">Open Postcard ledger</a>
</nav>`;

function withDashboardLinks(html: string): string {
  // Directly under the page header when there is one, else top of <body>.
  if (html.includes('</header>')) {
    return html.replace('</header>', `</header>${DASHBOARD_LINKS}`);
  }
  const body = html.match(/<body[^>]*>/i);
  if (body?.index !== undefined) {
    const end = body.index + body[0].length;
    return html.slice(0, end) + DASHBOARD_LINKS + html.slice(end);
  }
  return DASHBOARD_LINKS + html;
}

export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get('view') === 'defi') {
    return new Response(null, { status: 302, headers: { Location: '/defi' } });
  }

  let html: string;
  try {
    html = await readFile(PAGE_PATH, 'utf8');
  } catch {
    return new Response('Mission Control page is not deployed (site/mission_control.html missing).', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(withDashboardLinks(html), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

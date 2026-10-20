// Cloudflare Worker (kostenlos): nimmt Scrim-Anfragen der Website an und leitet sie an den Discord-Webhook weiter.
// Secrets/Variablen im Worker: DISCORD_WEBHOOK (Secret), ALLOWED_ORIGIN (z. B. https://sleeplxsssss.github.io)
const MODES = ['1v1', '2v2', '3v3'];
const cut = (v, n) => String(v ?? '').replace(/[`@<>]/g, '').slice(0, n);

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    const ok = allowed.length === 0 || allowed.includes(origin);
    const cors = { 'Access-Control-Allow-Origin': ok ? origin || '*' : 'null', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST' || !ok) return new Response('forbidden', { status: 403, headers: cors });
    let d; try { d = await req.json(); } catch { return new Response('bad json', { status: 400, headers: cors }); }
    if (d._honey) return Response.json({ ok: true }, { headers: cors });             // bots
    const type = d.type === 'join' ? 'join' : 'create';
    const body = {
      type, team: cut(d.team, 40), discord: cut(d.discord, 40), mode: MODES.includes(d.mode) ? d.mode : '3v3',
      rank: cut(d.rank, 20), when: cut(d.when, 20), scrim: cut(d.scrim, 12), title: cut(d.title, 60),
      email: cut(d.email, 80), message: cut(d.message, 400),
    };
    if (body.team.length < 2 || body.discord.length < 2 || (type === 'create' && !body.when) || (type === 'join' && !body.scrim))
      return Response.json({ ok: false, error: 'Pflichtfelder fehlen' }, { status: 400, headers: cors });
    const r = await fetch(env.DISCORD_WEBHOOK + '?wait=true', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Sephora Website', allowed_mentions: { parse: [] },
        content: '```json\n' + JSON.stringify({ sephira_web: body }) + '\n```' }),
    });
    return Response.json({ ok: r.ok }, { status: r.ok ? 200 : 502, headers: cors });
  },
};

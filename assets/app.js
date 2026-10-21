(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  $('#y').textContent = new Date().getFullYear();

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold: .12});
  const observe = () => document.querySelectorAll('.rv:not(.in)').forEach((el, i) => { el.style.transitionDelay = (i % 6) * 60 + 'ms'; io.observe(el); });
  observe();

  // cursor glow on cards
  let pm = null;
  document.addEventListener('pointermove', e => {
    if (pm) return; pm = requestAnimationFrame(() => { pm = null;
      const c = e.target.closest && e.target.closest('.card'); if (!c) return;
      const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  }, {passive: true});

  // smooth scrolling (Lenis) + nav state
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true});
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return; const el = document.querySelector(id);
      if (el) { e.preventDefault(); lenis.scrollTo(el, {offset: -70}); }
    }));
  }
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  (lenis ? lenis.on.bind(lenis, 'scroll') : f => addEventListener('scroll', f, {passive: true}))(onScroll); onScroll();

  const count = (el, to) => {
    if (to == null) { el.textContent = '–'; return; }
    const t0 = performance.now(), d = 1200;
    const step = t => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('de-DE'); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const fmt = ts => new Date(ts * 1000).toLocaleString('de-DE', {weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin'});

  fetch('data/discord.json?' + Date.now(), {cache: 'no-store'}).then(r => r.json()).then(d => {
    const now = Date.now() / 1000;
    const scrims = (d.scrims || []).filter(s => s.starts > now - 3600 && (!s.status || s.status === 'open' || s.status === 'forming'));
    if (d.invite) document.querySelectorAll('[data-invite]').forEach(a => { a.href = d.invite; a.target = '_blank'; a.rel = 'noopener'; });
    count($('[data-n=members]'), d.members); count($('[data-n=online]'), d.online); count($('[data-n=scrims]'), scrims.length); count($('[data-n=boosts]'), d.boosts);
    if (d.online != null) $('#live').textContent = d.online + ' gerade online';
    window.__d = d; buildTicker(d, scrims.length); liveCounts(d);

    $('#scrimList').innerHTML = scrims.length ? scrims.map(s => {
      const slots = Array.from({length: s.size}, (_, i) => `<i class="${i < s.filled ? 'on' : ''}"></i>`).join('');
      return `<article class="card rv"><div class="row"><span class="tag">${esc(s.mode)} · ${esc(s.type)}</span><span class="meta">#${s.id}</span></div>
        <h3>${esc(s.title)}</h3>${(s.opponents||[]).length ? `<p class="vs">🆚 ${s.opponents.map(esc).join(' · ')}</p>` : ''}<p class="meta">${fmt(s.starts)} Uhr</p>
        <div class="slots">${slots}</div>
        <div class="row"><span class="meta">${s.filled}/${s.size} Plätze${s.details ? ' · ' + esc(s.details.slice(0, 60)) : ''}</span>
        <a class="btn" href="#anmelden" data-scrim="${s.id}">Anmelden</a></div></article>`;
    }).join('') : '<div class="empty">Gerade keine offenen Scrims. Erstell einen auf Discord oder frag uns unten an.</div>';
    const sel = $('#scrimid'); if (scrims.length) sel.innerHTML = '';
    scrims.forEach(s => sel.insertAdjacentHTML('beforeend', `<option value="${s.id}">#${s.id} · ${esc(s.title)} (${fmt(s.starts)})</option>`));
    document.querySelectorAll('[data-scrim]').forEach(b => b.addEventListener('click', e => { window.sephiraJoin(b.dataset.scrim); if (lenis) { e.preventDefault(); lenis.scrollTo('#anmelden', {offset: -70}); } }));

    $('#roster').innerHTML = (d.roster || []).filter(s => s.members.length).map(s => `<div class="rv"><h3>${esc(s.title)}</h3>${(s.opponents||[]).length ? `<p class="vs">🆚 ${s.opponents.map(esc).join(' · ')}</p>` : ''}<div class="people">${
      s.members.map(m => `<div class="p"><img loading="lazy" src="${esc(m.avatar)}" alt=""><span><b>${esc(m.name)}</b><small style="color:${m.color ? '#' + m.color.toString(16).padStart(6, '0') : 'var(--mut)'}">${m.role_icon ? `<img class="ri" src="${esc(m.role_icon)}" alt="">` : ''}${esc(m.role)}</small></span></div>`).join('')}</div></div>`).join('')
      || '<div class="empty">Roster folgt.</div>';

    const tt = Object.assign({username: 'sephoraesport'}, d.tiktok || {}); if (!tt.latest) tt.latest = (window.SEPHIRA || {}).tiktokFallback || '7698060489925954838';
    if (tt.title) $('#ttTitle').textContent = tt.title;
    if (tt.latest) {
      $('#ttLink').href = `https://www.tiktok.com/@${encodeURIComponent(tt.username || 'sephoraesport')}/video/${encodeURIComponent(tt.latest)}`;
      $('#ttPlayer').innerHTML = `<iframe src="https://www.tiktok.com/player/v1/${encodeURIComponent(tt.latest)}?music_info=1&description=0&rel=0&controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=1" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" loading="lazy" title="Neuestes TikTok-Video"></iframe>`;
    } else $('#ttPlayer').innerHTML = '<div class="empty">Noch kein Video</div>';
    if (scrims.length) { const ld = document.createElement('script'); ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify(scrims.map(s => ({'@context': 'https://schema.org', '@type': 'Event', name: 'Rocket League Scrim ' + s.mode + ': ' + s.title,
        startDate: new Date(s.starts * 1000).toISOString(), eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {'@type': 'VirtualLocation', url: location.origin + '/#anmelden'}, organizer: {'@type': 'SportsTeam', name: 'Sephora E-Sports', url: location.origin + '/'},
        description: 'Offener Rocket League Scrim (' + s.mode + ') – jetzt anmelden.'})));
      document.head.appendChild(ld); }
    observe();
  }).catch(() => { $('#scrimList').innerHTML = '<div class="empty">Daten konnten nicht geladen werden.</div>'; });

  // rotating word
  const words = ['Scrims', 'Turniere', 'Coaching', 'Giveaways', 'Rewards', 'Community'];
  let wi = 0; const rot = $('#rot');
  if (rot && !reduce) setInterval(() => {
    const old = rot.querySelector('b'); old.classList.add('out'); setTimeout(() => old.remove(), 450);
    wi = (wi + 1) % words.length; const b = document.createElement('b'); b.textContent = words[wi]; rot.appendChild(b);
  }, 2400);

  // infinite ticker
  function buildTicker(d, nScrims) {
    const items = [`<i>●</i> <b>${d.online ?? '–'}</b> gerade online`, `👥 <b>${d.members ?? '–'}</b> Mitglieder`, `⚔️ Scrims in <b>1v1 · 2v2 · 3v3</b>`,
      `🗓️ <b>${nScrims}</b> offene Scrims`, `🚀 <b>${d.boosts ?? 0}</b> Server-Boosts`, '🎁 Punkte sammeln & <b>Prämien</b> holen', '🏆 Roster · Academy · Main',
      '🎟️ <b>Giveaways</b> jeden Monat', '🎵 TikTok <b>@sephoraesport</b>', '🌸 <b>sephoraesports.de</b>'];
    const html = items.map(x => `<span>${x}</span><span><i>✦</i></span>`).join('');
    const t = $('#ticker'); if (t) t.innerHTML = html + html;
  }

  // live member/online counts straight from Discord (refresh every 60 s)
  function liveCounts(d) {
    const code = (d.invite || 'https://discord.gg/A4JvxzRy6d').split('/').pop();
    const upd = async () => {
      try {
        const r = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`); if (!r.ok) return;
        const j = await r.json(); const bots = Math.max(0, (j.approximate_member_count || 0) - (d.members || j.approximate_member_count));
        const online = Math.max(0, (j.approximate_presence_count || 0) - bots), members = (j.approximate_member_count || 0) - bots;
        const set = (k, v) => { const el = $(`[data-n=${k}]`); if (el && el.textContent !== v.toLocaleString('de-DE')) { el.textContent = v.toLocaleString('de-DE'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } };
        setTimeout(() => { set('online', online); set('members', members); }, 1300);
        $('#live').textContent = online + ' gerade online'; d.online = online; d.members = members; buildTicker(d, (d.scrims || []).filter(s => s.status === 'open').length);
      } catch {}
    };
    upd(); setInterval(upd, 60000);
  }

  // form: Discord (via Worker) + E-Mail (FormSubmit)
  const f = $('#signup'); let type = 'create';
  const setType = t => {
    type = t; f.querySelector('.seg').dataset.t = t; f.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.type === t));
    f.querySelectorAll('.only-join').forEach(e => { e.hidden = t !== 'join'; e.classList.remove('swap'); void e.offsetWidth; e.classList.add('swap'); });
    f.querySelectorAll('.only-create').forEach(e => { e.hidden = t !== 'create'; e.classList.remove('swap'); void e.offsetWidth; e.classList.add('swap'); });
  };
  f.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => setType(b.dataset.type)));
  window.sephiraJoin = id => { setType('join'); const s = $('#scrimid'); const o = [...s.options].find(o => o.value === String(id)); if (o) s.value = o.value; };
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const m = $('#formMsg'), b = f.querySelector('button[type=submit]'), d = Object.fromEntries(new FormData(f)); d.type = type;
    if (d._honey) return;
    if (!d.team || !d.discord || (type === 'create' && !d.when) || (type === 'join' && !d.scrim)) { m.style.color = '#ff8f8f'; m.textContent = 'Bitte Teamname, Discord-Name und ' + (type === 'create' ? 'Termin' : 'Scrim') + ' angeben.'; return; }
    b.disabled = true; m.style.color = ''; m.textContent = 'Wird gesendet …';
    const cfg = window.SEPHIRA || {}; let sent = false;
    if (cfg.endpoint) {
      try { const r = await fetch(cfg.endpoint, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(d)}); sent = r.ok; } catch {}
    }
    try {
      const fd = new FormData(); fd.append('_subject', (type === 'create' ? 'Neue Scrim-Anfrage' : 'Scrim-Anmeldung #' + d.scrim) + ' · ' + d.team);
      fd.append('_template', 'table'); fd.append('_captcha', 'false');
      for (const [k, v] of Object.entries(d)) if (v && k !== '_honey') fd.append(k, v);
      const r = await fetch('https://formsubmit.co/ajax/' + (cfg.email || 'sephoraesports250@gmail.com'), {method: 'POST', headers: {Accept: 'application/json'}, body: fd});
      sent = sent || r.ok;
    } catch {}
    if (sent) { m.style.color = 'var(--ok)'; m.textContent = '✓ Anfrage gesendet! Das Team gibt sie im Discord frei.'; f.reset(); setType(type); }
    else { m.style.color = '#ff8f8f'; m.textContent = 'Senden fehlgeschlagen. Bitte versuch es später erneut oder schreib uns auf Discord.'; }
    b.disabled = false;
  });
})();

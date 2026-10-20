# Website → Discord (Scrim-Anfragen), kostenlos

1. Im Discord als Admin: `/sephira website-webhook` → Sephira schickt dir (nur für dich sichtbar) eine Webhook-URL.
2. https://dash.cloudflare.com → Workers & Pages → „Create Worker“ → Inhalt von `worker.js` einfügen → Deploy.
3. Im Worker unter Settings → Variables:
   - `DISCORD_WEBHOOK` = die URL aus Schritt 1 (als **Secret**)
   - `ALLOWED_ORIGIN` = `https://sleeplxsssss.github.io` (später zusätzlich deine eigene Domain, mit Komma getrennt)
4. Die Worker-Adresse (z. B. `https://sephora-scrims.DEINNAME.workers.dev`) in `assets/config.js` bei `endpoint` eintragen und hochladen.

Fertig: Jede Anfrage von der Website landet im Anfrage-Kanal mit „Freigeben“/„Ablehnen“ und zusätzlich per E-Mail.
Free-Plan: 100.000 Anfragen pro Tag.

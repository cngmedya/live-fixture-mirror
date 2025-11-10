import fs from 'node:fs';
import fetch from 'node-fetch';

// 1) TSV çek
const url = process.env.SHEET_TSV_URL;
if (!url) { console.error('SHEET_TSV_URL missing'); process.exit(1); }

const res = await fetch(url, { headers: { 'User-Agent': 'gh-action' }});
if (!res.ok) { console.error('Fetch fail', res.status); process.exit(1); }
const tsv = await res.text();

// 2) TSV → JSON (ilk satır başlık)
const lines = tsv.trim().split(/\r?\n/);
const headers = lines.shift().split('\t').map(s => s.trim());

// küçük yardımcı: sayıya çevirebilen alanları sayıya çevir
const toNum = v => v === '' ? null : (isNaN(v) ? v : Number(v));

const rows = lines.map(line => {
  const cells = line.split('\t');
  const o = {};
  headers.forEach((h,i) => o[h] = (['fixture_id','goals_home','goals_away','minute','corner_home','corner_away','xg_home','xg_away','tempo_index'].includes(h) ? toNum(cells[i]) : (cells[i] ?? '').trim()));
  return o;
});

// 3) Minimal çıktı (gerekiyorsa alanları daralt)
const data = rows.map(r => ({
  fixture_id: r.fixture_id,
  league: r.league,
  round: r.round,
  kickoff_trt: r.kickoff_trt,
  status: r.status,
  minute: r.minute,
  home: r.home,
  away: r.away,
  goals_home: r.goals_home,
  goals_away: r.goals_away,
  tempo_index: r.tempo_index ?? null,
  corner_home: r.corner_home ?? null,
  corner_away: r.corner_away ?? null,
  xg_home: r.xg_home ?? null,
  xg_away: r.xg_away ?? null,
  updated_at: new Date().toISOString()
}));

// 4) Yaz
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/live.json', JSON.stringify(data, null, 2));
console.log(`Wrote data/live.json (${data.length} rows)`);

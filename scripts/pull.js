import fetch from "node-fetch";
import { parse } from "csv-parse/sync";
import { writeFileSync, mkdirSync } from "fs";

const SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvj3Rq3R1Q2kpXiBoF1_bN46Ag0Ly5KZgZJmTfFLYy5nWb2XK9kH3DB3CbbJ9RqVm1A_YRv620BV1P/pub?gid=1679302956&single=true&output=csv";

const res = await fetch(SHEET_CSV, { headers: { "cache-control":"no-cache" }});
if (!res.ok) throw new Error("Sheet fetch failed: " + res.status);
const csvText = await res.text();

const rows = parse(csvText, { columns: true, skip_empty_lines: true });

const now = new Date().toISOString();
const json = rows.map(r => ({
  fixture_id: r.fixture_id ?? r.id ?? "",
  league: r.league ?? "",
  round: r.round ?? "",
  kickoff_trt: r.kickoff_trt ?? r.kickoff ?? "",
  status: r.status ?? "",
  minute: Number(r.minute ?? 0),
  home: r.home ?? r.home_team ?? "",
  away: r.away ?? r.away_team ?? "",
  goals_home: Number(r.goals_home ?? r.home_goals ?? 0),
  goals_away: Number(r.goals_away ?? r.away_goals ?? 0),
  corners_home: Number(r.corners_home ?? 0),
  corners_away: Number(r.corners_away ?? 0),
  xg_home: Number(r.xg_home ?? 0),
  xg_away: Number(r.xg_away ?? 0),
  updated_at: now
}));

mkdirSync("public", { recursive: true });
writeFileSync("public/live.json", JSON.stringify(json, null, 2));
writeFileSync("public/live.csv", csvText);
console.log(`Wrote ${json.length} rows at ${now}`);

import APP_DATA from './data.js';

export const CURVE = APP_DATA.c;
export const SEASON_START = APP_DATA.s;

// family curve value at couch size n
export function fc(n) {
  if (n <= 3) return CURVE.a / (1 + CURVE.b * (n - 1));
  const raw = CURVE.raw;
  if (raw[n] != null) return raw[n];
  const ks = Object.keys(raw).map(Number).filter(k => k >= 4).sort((a, b) => a - b);
  if (n <= ks[0]) return raw[ks[0]];
  if (n >= ks[ks.length - 1]) return raw[ks[ks.length - 1]];
  let lo = ks[0], hi = ks[ks.length - 1];
  for (const k of ks) { if (k <= n) lo = k; }
  for (let i = ks.length - 1; i >= 0; i--) { if (ks[i] >= n) hi = ks[i]; }
  if (lo === hi) return raw[lo];
  const f = (n - lo) / (hi - lo);
  return raw[lo] + f * (raw[hi] - raw[lo]);
}

export const COUCHES = APP_DATA.g.map((row, i) => ({
  id: i, date: row[0],
  size: row[1].length,
  players: row[1].map(p => ({ name: p[0], city: p[1], score: p[2] }))
}));

export const CITY_NAMES = { DC: 'Dawson Creek', PG: 'Prince George', WK: 'West Kelowna' };
export const PLAYER_CITY = {
  Jonny: 'DC', Julia: 'DC', Mom: 'DC', Dad: 'DC', Carmen: 'DC', Beckett: 'DC',
  Naomi: 'PG', Stevie: 'PG', Nate: 'WK', Eberley: 'WK', Kirsten: 'WK', Helena: 'WK', Kevin: 'WK'
};
export const ALL_PLAYERS = ['Jonny', 'Nate', 'Stevie', 'Naomi', 'Eberley', 'Kirsten', 'Julia',
  'Helena', 'Mom', 'Dad', 'Carmen', 'Beckett', 'Kevin'];
export const MIN_GAMES = 5;

export const RATINGS = (function () {
  const acc = {};
  for (const c of COUCHES) {
    for (const p of c.players) {
      const e = fc(c.size);
      if (e <= 0) continue;
      if (!acc[p.name]) acc[p.name] = { sum: 0, n: 0 };
      acc[p.name].sum += p.score / e;
      acc[p.name].n++;
    }
  }
  const out = {};
  for (const nm in acc) out[nm] = { rating: acc[nm].sum / acc[nm].n, games: acc[nm].n };
  return out;
})();

export function rating(name) {
  const r = RATINGS[name];
  if (!r) return { rating: 1, games: 0, provisional: true };
  return { rating: r.rating, games: r.games, provisional: r.games < MIN_GAMES };
}

export function dayResults(date, couches) {
  const todays = couches.filter(c => c.date === date);
  const out = [];
  for (const c of todays) {
    for (const p of c.players) {
      const r = rating(p.name);
      const expected = r.rating * fc(c.players.length);
      const index = expected > 0 ? (p.score / expected) * 100 : 100;
      out.push({
        name: p.name, city: p.city, score: p.score, size: c.players.length,
        expected, index, provisional: r.provisional, games: r.games
      });
    }
  }
  return out;
}

export function rangeBoard(fromDate, toDate, couches) {
  const ind = {}, city = {};
  const dates = [...new Set(couches.map(c => c.date))]
    .filter(d => d >= fromDate && d <= toDate).sort();
  for (const d of dates) {
    const res = dayResults(d, couches);
    for (const r of res) {
      if (!ind[r.name]) ind[r.name] = { sum: 0, n: 0, prov: r.provisional };
      ind[r.name].sum += r.index; ind[r.name].n++; ind[r.name].prov = r.provisional;
    }
    const byCity = {};
    for (const r of res) { (byCity[r.city] = byCity[r.city] || []).push(r.index); }
    for (const c in byCity) {
      const avg = byCity[c].reduce((a, b) => a + b, 0) / byCity[c].length;
      if (!city[c]) city[c] = { sum: 0, n: 0 };
      city[c].sum += avg; city[c].n++;
    }
  }
  const indArr = Object.entries(ind).map(([nm, v]) => ({
    name: nm, avg: v.sum / v.n, games: v.n, provisional: v.prov
  })).sort((a, b) => b.avg - a.avg);
  const cityArr = Object.entries(city).map(([c, v]) => ({ city: c, avg: v.sum / v.n, days: v.n }))
    .sort((a, b) => b.avg - a.avg);
  return { indArr, cityArr, dates };
}

export function daysWonTally(fromDate, couches) {
  const dw = {}, cw = {};
  const dates = [...new Set(couches.map(c => c.date))].filter(d => d >= fromDate).sort();
  for (const d of dates) {
    const res = dayResults(d, couches).filter(r => !r.provisional);
    if (!res.length) continue;
    const best = Math.max(...res.map(r => r.index));
    const winners = res.filter(r => Math.abs(r.index - best) < 1e-6);
    winners.forEach(w => dw[w.name] = (dw[w.name] || 0) + 1 / winners.length);
    const byCity = {};
    res.forEach(r => (byCity[r.city] = byCity[r.city] || []).push(r.index));
    const cAvg = Object.entries(byCity).map(([c, v]) =>
      [c, v.reduce((a, b) => a + b, 0) / v.length]);
    const cBest = Math.max(...cAvg.map(x => x[1]));
    const cWin = cAvg.filter(x => Math.abs(x[1] - cBest) < 1e-6);
    cWin.forEach(x => cw[x[0]] = (cw[x[0]] || 0) + 1 / cWin.length);
  }
  return { dw, cw };
}

export const LAST_DATE = COUCHES[COUCHES.length - 1].date;

import { useState, useMemo } from 'react';
import { COUCHES, SEASON_START, LAST_DATE, CITY_NAMES, PLAYER_CITY, dayResults, rangeBoard } from '../model.js';
import { Avatar, CityTag, weekKey, monthKey, yearKey, periodLabel } from './shared.jsx';

function SummaryBoard() {
  const [period, setPeriod] = useState('week');
  const [scope, setScope] = useState('ind');
  const ranges = useMemo(() => {
    const end = LAST_DATE, d = new Date(end);
    const back = n => { const x = new Date(d); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
    return { day: [end, end], week: [back(6), end], month: [back(29), end], season: [SEASON_START, end] };
  }, []);
  const r = ranges[period];
  const board = useMemo(() => rangeBoard(r[0], r[1], COUCHES), [r[0], r[1]]);
  const champ = scope === 'ind' ? board.indArr[0] : board.cityArr[0];
  const plbl = { day: 'Today', week: 'This Week', month: 'This Month', season: '2026 Season' }[period];

  return (
    <>
      <div className="pad">
        <div className="seg">
          {['day', 'week', 'month', 'season'].map(p => (
            <button key={p} className={period === p ? 'on' : ''} onClick={() => setPeriod(p)}>
              {{ day: 'Day', week: 'Week', month: 'Month', season: 'Season' }[p]}</button>))}
        </div>
        <div className="seg" style={{ marginTop: 6 }}>
          <button className={scope === 'ind' ? 'on' : ''} onClick={() => setScope('ind')}>Players</button>
          <button className={scope === 'city' ? 'on' : ''} onClick={() => setScope('city')}>Cities</button>
        </div>
      </div>
      {champ &&
        <div className="pad">
          <div className="champ">
            <div className="crown">👑</div>
            <div className="lbl">{plbl} · {scope === 'ind' ? 'Top Player' : 'Top City'}</div>
            <div className="who">{scope === 'ind' ? champ.name : CITY_NAMES[champ.city]}</div>
            <div className="idx">Performance Index {Math.round(champ.avg)}</div>
          </div>
        </div>}
      <div className="pad">
        <div className="section-title">{scope === 'ind' ? 'Player' : 'City'} Standings — {plbl}</div>
        <div className="card" style={{ padding: '4px 2px' }}>
          {scope === 'ind'
            ? board.indArr.map((p, i) => (
              <div className="lb-row" key={p.name}>
                <div className={'rank r' + (i + 1)}>{i + 1}</div>
                <Avatar name={p.name} />
                <div className="lb-name">
                  <div className="nm">{p.name} {p.provisional && <span className="prov">new</span>}</div>
                  <div className="sub">{p.games} {p.games === 1 ? 'day' : 'days'} ·&nbsp;
                    <CityTag city={PLAYER_CITY[p.name]} /></div>
                </div>
                <div className="lb-score">{Math.round(p.avg)}<span className="u"> idx</span></div>
              </div>))
            : board.cityArr.map((c, i) => (
              <div className="lb-row" key={c.city}>
                <div className={'rank r' + (i + 1)}>{i + 1}</div>
                <div className={'avatar city-' + c.city}>{c.city}</div>
                <div className="lb-name">
                  <div className="nm">{CITY_NAMES[c.city]}</div>
                  <div className="sub">{c.days} days scored</div>
                </div>
                <div className="lb-score">{Math.round(c.avg)}<span className="u"> idx</span></div>
              </div>))}
          {scope === 'ind' && board.indArr.length === 0 &&
            <div className="empty">No games in this period yet.</div>}
        </div>
      </div>
    </>
  );
}

function ArchiveBoard() {
  const [gran, setGran] = useState('day');
  const [scope, setScope] = useState('ind');
  const [open, setOpen] = useState(null);

  const periods = useMemo(() => {
    const keyFn = { day: d => d, week: weekKey, month: monthKey, year: yearKey }[gran];
    const dates = [...new Set(COUCHES.map(c => c.date))]
      .filter(d => d >= SEASON_START).sort();
    const buckets = {};
    for (const d of dates) {
      const k = keyFn(d);
      (buckets[k] = buckets[k] || []).push(d);
    }
    return Object.entries(buckets).sort((a, b) => b[0].localeCompare(a[0]))
      .map(function (entry) {
        const k = entry[0], ds = entry[1];
        const indAgg = {}, cityAgg = {};
        for (const d of ds) {
          const res = dayResults(d, COUCHES);
          for (const rr of res) {
            if (!indAgg[rr.name]) indAgg[rr.name] = { sum: 0, n: 0, prov: rr.provisional };
            indAgg[rr.name].sum += rr.index; indAgg[rr.name].n++;
            indAgg[rr.name].prov = rr.provisional;
          }
          const byC = {};
          res.forEach(rr => { (byC[rr.city] = byC[rr.city] || []).push(rr.index); });
          for (const c in byC) {
            const a = byC[c].reduce((x, y) => x + y, 0) / byC[c].length;
            if (!cityAgg[c]) cityAgg[c] = { sum: 0, n: 0 };
            cityAgg[c].sum += a; cityAgg[c].n++;
          }
        }
        const indRank = Object.entries(indAgg).map(function (e) {
          return { name: e[0], avg: e[1].sum / e[1].n, games: e[1].n, prov: e[1].prov };
        }).sort((a, b) => b.avg - a.avg);
        const cityRank = Object.entries(cityAgg).map(function (e) {
          return { city: e[0], avg: e[1].sum / e[1].n };
        }).sort((a, b) => b.avg - a.avg);
        return { key: k, dates: ds, indRank, cityRank };
      });
  }, [gran]);

  return (
    <>
      <div className="pad">
        <div className="seg">
          {['day', 'week', 'month', 'year'].map(g => (
            <button key={g} className={gran === g ? 'on' : ''}
              onClick={() => { setGran(g); setOpen(null); }}>
              {{ day: 'Day', week: 'Week', month: 'Month', year: 'Year' }[g]}</button>))}
        </div>
        <div className="seg" style={{ marginTop: 6 }}>
          <button className={scope === 'ind' ? 'on' : ''} onClick={() => setScope('ind')}>Players</button>
          <button className={scope === 'city' ? 'on' : ''} onClick={() => setScope('city')}>Cities</button>
        </div>
      </div>
      <div className="pad">
        <div className="section-title">
          {scope === 'ind' ? 'Player' : 'City'} History — by {gran}
        </div>
        <div className="card" style={{ padding: '2px' }}>
          {periods.map(function (p) {
            const rank = scope === 'ind' ? p.indRank : p.cityRank;
            const win = rank[0];
            const isOpen = open === p.key;
            return (
              <div key={p.key}>
                <div className="lb-row" style={{ cursor: 'pointer' }}
                  onClick={() => setOpen(isOpen ? null : p.key)}>
                  <div className="arch-date">{periodLabel(gran, p.key)}</div>
                  {win &&
                    <>
                      <span className="crown-sm">🏆</span>
                      {scope === 'ind'
                        ? <Avatar name={win.name} size={28} />
                        : <div className={'avatar city-' + win.city}
                          style={{ width: 28, height: 28, fontSize: 11 }}>{win.city}</div>}
                      <div className="lb-name">
                        <div className="nm" style={{ fontSize: 14 }}>
                          {scope === 'ind' ? win.name : CITY_NAMES[win.city]}</div>
                        {scope === 'ind' &&
                          <div className="sub"><CityTag city={PLAYER_CITY[win.name]} /></div>}
                      </div>
                      <div className="lb-score" style={{ fontSize: 18 }}>
                        {Math.round(win.avg)}<span className="u"> idx</span></div>
                    </>}
                  <div className={'chev ' + (isOpen ? 'up' : '')}>▾</div>
                </div>
                {isOpen &&
                  <div className="arch-detail">
                    {gran === 'day' && scope === 'ind'
                      ? dayResults(p.key, COUCHES).sort((a, b) => b.index - a.index)
                        .map(function (rr, i) {
                          return (
                            <div className="detail-row" key={rr.name + i}>
                              <span className="dr-rank">{i + 1}</span>
                              <Avatar name={rr.name} size={24} />
                              <span className="dr-name">{rr.name}</span>
                              <span className="dr-sub">{rr.score} pts · exp {rr.expected.toFixed(1)}</span>
                              <span className="dr-idx">{Math.round(rr.index)}</span>
                            </div>
                          );
                        })
                      : rank.map(function (rr, i) {
                        return (
                          <div className="detail-row" key={(rr.name || rr.city) + i}>
                            <span className="dr-rank">{i + 1}</span>
                            {scope === 'ind'
                              ? <Avatar name={rr.name} size={24} />
                              : <div className={'avatar city-' + rr.city}
                                style={{ width: 24, height: 24, fontSize: 9 }}>{rr.city}</div>}
                            <span className="dr-name">
                              {scope === 'ind' ? rr.name : CITY_NAMES[rr.city]}</span>
                            <span className="dr-sub">avg index</span>
                            <span className="dr-idx">{Math.round(rr.avg)}</span>
                          </div>
                        );
                      })}
                  </div>}
              </div>
            );
          })}
          {periods.length === 0 &&
            <div className="empty">No games recorded yet this season.</div>}
        </div>
        <div className="hint">
          Tap any {gran} to see the full ranking. Index = score vs. expectation;
          higher means a bigger over-performance.
        </div>
      </div>
    </>
  );
}

export default function LeaderboardView() {
  const [mode, setMode] = useState('summary');
  return (
    <div className="scroll fade">
      <div className="pad" style={{ paddingBottom: 0 }}>
        <div className="seg mode-seg">
          <button className={mode === 'summary' ? 'on' : ''}
            onClick={() => setMode('summary')}>Summary</button>
          <button className={mode === 'archive' ? 'on' : ''}
            onClick={() => setMode('archive')}>Archive</button>
        </div>
      </div>
      {mode === 'summary' ? <SummaryBoard /> : <ArchiveBoard />}
    </div>
  );
}

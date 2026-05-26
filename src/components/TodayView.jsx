import { useMemo } from 'react';
import { SEASON_START, MIN_GAMES, CITY_NAMES, dayResults, daysWonTally } from '../model.js';
import { Avatar, fmtDate } from './shared.jsx';

export default function TodayView({ couches, ratings, lastDate }) {
  const res = useMemo(
    () => dayResults(lastDate, couches, ratings).sort((a, b) => b.index - a.index),
    [lastDate, couches, ratings]
  );
  const eligible = res.filter(r => !r.provisional);
  const winner = eligible[0];
  const tally = useMemo(() => daysWonTally(SEASON_START, couches, ratings), [couches, ratings]);
  const dwArr = Object.entries(tally.dw).map(([n, v]) => ({ name: n, wins: v }))
    .sort((a, b) => b.wins - a.wins);
  const cwArr = Object.entries(tally.cw).map(([c, v]) => ({ city: c, wins: v }))
    .sort((a, b) => b.wins - a.wins);

  return (
    <div className="scroll fade">
      <div className="pad">
        <div className="section-title">Latest Game Night · {fmtDate(lastDate)}</div>
        {winner &&
          <div className="champ">
            <div className="crown">🏆</div>
            <div className="lbl">Winner of the Day</div>
            <div className="who">{winner.name}</div>
            <div className="idx">Index {Math.round(winner.index)} ·
              scored {winner.score}, expected {winner.expected.toFixed(1)}</div>
          </div>}

        <div className="card" style={{ padding: '4px 2px' }}>
          {res.map((r, i) => (
            <div className="lb-row" key={r.name + i}>
              <div className={`rank r${i + 1}`}>{i + 1}</div>
              <Avatar name={r.name} />
              <div className="lb-name">
                <div className="nm">{r.name} {r.provisional &&
                  <span className="prov">new</span>}</div>
                <div className="sub">scored {r.score} · expected&nbsp;
                  {r.expected.toFixed(1)} · {r.size === 1 ? 'solo' : r.size + '-couch'}</div>
              </div>
              <div className="lb-score">{Math.round(r.index)}
                <span className="u"> idx</span></div>
            </div>))}
        </div>
      </div>

      <div className="pad">
        <div className="section-title">2026 Season · Days Won</div>
        <div className="card" style={{ padding: '4px 2px' }}>
          {dwArr.map((p, i) => {
            const max = dwArr[0].wins;
            return (
              <div className="lb-row" key={p.name}>
                <div className={`rank r${i + 1}`}>{i + 1}</div>
                <Avatar name={p.name} size={32} />
                <div className="lb-name">
                  <div className="nm">{p.name}</div>
                  <div className="mini-bar"><i style={{ width: (p.wins / max * 100) + '%' }} /></div>
                </div>
                <div className="lb-score">{p.wins % 1 ? p.wins.toFixed(1) : p.wins}
                  <span className="u"> won</span></div>
              </div>
            );
          })}
        </div>

        <div className="section-title">2026 Season · City Days Won</div>
        <div className="card" style={{ padding: '4px 2px' }}>
          {cwArr.map((c, i) => {
            const max = cwArr[0].wins;
            return (
              <div className="lb-row" key={c.city}>
                <div className={`rank r${i + 1}`}>{i + 1}</div>
                <div className={`avatar city-${c.city}`} style={{ width: 32, height: 32,
                  fontSize: 13 }}>{c.city}</div>
                <div className="lb-name">
                  <div className="nm">{CITY_NAMES[c.city]}</div>
                  <div className="mini-bar"><i style={{ width: (c.wins / max * 100) + '%' }} /></div>
                </div>
                <div className="lb-score">{c.wins % 1 ? c.wins.toFixed(1) : c.wins}
                  <span className="u"> won</span></div>
              </div>
            );
          })}
        </div>
        <div className="hint">Days Won counts each game night's top performer.
          Ties split. Players need {MIN_GAMES}+ recent games to be eligible.</div>
      </div>
    </div>
  );
}

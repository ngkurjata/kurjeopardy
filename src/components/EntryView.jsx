import { useState } from 'react';
import { ALL_PLAYERS } from '../model.js';
import { insertGame } from '../db.js';
import { Avatar } from './shared.jsx';

export default function EntryView({ onSubmit, reload, lastDate }) {
  const [date, setDate] = useState(lastDate);
  const [couches, setCouches] = useState([{ players: {} }]);
  const [submitting, setSubmitting] = useState(false);

  function togglePlayer(ci, name) {
    setCouches(cs => cs.map((c, i) => {
      if (i !== ci) return c;
      const p = { ...c.players };
      if (name in p) delete p[name]; else p[name] = 0;
      return { players: p };
    }));
  }

  function setScore(ci, name, delta) {
    setCouches(cs => cs.map((c, i) => {
      if (i !== ci) return c;
      const p = { ...c.players };
      p[name] = Math.max(0, Math.min(66, (p[name] || 0) + delta));
      return { players: p };
    }));
  }

  async function handleSubmitClick() {
    setSubmitting(true);
    try {
      await insertGame(date, couches);
      await reload();
      onSubmit(date, couches);
    } catch (e) {
      alert('Failed to save scores: ' + (e.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  const usedPlayers = new Set(couches.flatMap(c => Object.keys(c.players)));
  const couchTotals = couches.map(c => Object.values(c.players).reduce((a, b) => a + b, 0));
  const anyOver = couchTotals.some(t => t > 66);
  const anyEmpty = couches.some(c => Object.keys(c.players).length === 0);

  return (
    <div className="scroll fade">
      <div className="pad">
        <div className="field-label">Game Date</div>
        <input className="date-in" type="date" value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setDate(e.target.value)} />

        {couches.map((couch, ci) => (
          <div key={ci}>
            <div className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Couch {ci + 1} — Who Played This Screen?</span>
              {couches.length > 1 &&
                <span style={{ color: 'var(--red)', cursor: 'pointer' }}
                  onClick={() => setCouches(cs => cs.filter((_, i) => i !== ci))}>remove</span>}
            </div>
            <div className="couch-box">
              <div className="player-pick">
                {ALL_PLAYERS.map(name => {
                  const sel = name in couch.players;
                  const takenElsewhere = usedPlayers.has(name) && !sel;
                  return <button key={name}
                    className={`pp ${sel ? 'sel' : ''}`}
                    disabled={takenElsewhere || submitting}
                    style={takenElsewhere ? { opacity: .25 } : {}}
                    onClick={() => togglePlayer(ci, name)}>{name}</button>;
                })}
              </div>
              {Object.keys(couch.players).length > 0 &&
                <div style={{ marginTop: 12 }}>
                  {Object.keys(couch.players).map(name => (
                    <div className="score-row" key={name}>
                      <Avatar name={name} size={30} />
                      <div className="nm">{name}</div>
                      <div className="stepper">
                        <button onClick={() => setScore(ci, name, -1)} disabled={submitting}>–</button>
                        <div className="val">{couch.players[name]}</div>
                        <button onClick={() => setScore(ci, name, 1)} disabled={submitting}>+</button>
                      </div>
                    </div>))}
                  <div className={`total-chip ${couchTotals[ci] > 66 ? 'bad' : ''}`}>
                    Couch total: {couchTotals[ci]} / 66
                    {couchTotals[ci] > 66 && ' — over the max!'}
                  </div>
                </div>}
            </div>
          </div>
        ))}

        <button className="pp" style={{ width: '100%', marginTop: 12, padding: 11 }}
          disabled={submitting}
          onClick={() => setCouches(cs => [...cs, { players: {} }])}>
          + Add Another Couch (different city / screen)
        </button>

        <button className="big-btn" disabled={anyOver || anyEmpty || submitting}
          onClick={handleSubmitClick}>
          {submitting ? 'Saving…' : 'Submit Game Night'}
        </button>
        <div className="hint">
          Add a separate couch for each screen being played — Dawson Creek,
          Prince George and West Kelowna are usually their own couches.
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { fmtDate, Ico } from './components/shared.jsx';
import { computeRatings } from './model.js';
import { fetchGames } from './db.js';
import TodayView from './components/TodayView.jsx';
import LeaderboardView from './components/LeaderboardView.jsx';
import EntryView from './components/EntryView.jsx';
import ChatView from './components/ChatView.jsx';

export default function App() {
  const [tab, setTab] = useState('today');
  const [toast, setToast] = useState('');
  const [couches, setCouches] = useState(null);
  const [ratings, setRatings] = useState({});
  const [lastDate, setLastDate] = useState('');

  async function reload() {
    const data = await fetchGames();
    setCouches(data);
    setRatings(computeRatings(data));
    setLastDate(data.length ? data[data.length - 1].date : '');
  }

  useEffect(() => { reload(); }, []);

  function handleSaved(date, couchData) {
    const n = couchData.reduce((s, c) => s + Object.keys(c.players).length, 0);
    setToast(`Logged ${n} score${n > 1 ? 's' : ''} for ${fmtDate(date)} ✓`);
    setTimeout(() => setToast(''), 2600);
    setTab('today');
  }

  if (!couches) {
    return (
      <>
        <header>
          <div className="wordmark"><span className="kur">KUR</span><span className="jeop">JEOPARDY</span></div>
          <div className="tagline">The Kurjata Family League</div>
        </header>
        <div className="scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty">Loading Kurjeopardy…</div>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <div className="wordmark"><span className="kur">KUR</span><span className="jeop">JEOPARDY</span></div>
        <div className="tagline">The Kurjata Family League</div>
      </header>

      {tab === 'today' && <TodayView couches={couches} ratings={ratings} lastDate={lastDate} />}
      {tab === 'board' && <LeaderboardView couches={couches} ratings={ratings} lastDate={lastDate} />}
      {tab === 'entry' && <EntryView onSubmit={handleSaved} reload={reload} lastDate={lastDate} />}
      {tab === 'chat' && <ChatView />}

      {toast && <div className="toast">{toast}</div>}

      <nav>
        <button className={tab === 'today' ? 'on' : ''} onClick={() => setTab('today')}>
          {Ico.trophy}<span>Today</span></button>
        <button className={tab === 'board' ? 'on' : ''} onClick={() => setTab('board')}>
          {Ico.chart}<span>Standings</span></button>
        <button className={tab === 'entry' ? 'on' : ''} onClick={() => setTab('entry')}>
          {Ico.plus}<span>Add Scores</span></button>
        <button className={tab === 'chat' ? 'on' : ''} onClick={() => setTab('chat')}>
          {Ico.chat}<span>Chat</span></button>
      </nav>
    </>
  );
}

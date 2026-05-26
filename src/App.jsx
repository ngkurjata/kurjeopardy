import { useState } from 'react';
import { fmtDate, Ico } from './components/shared.jsx';
import TodayView from './components/TodayView.jsx';
import LeaderboardView from './components/LeaderboardView.jsx';
import EntryView from './components/EntryView.jsx';
import ChatView from './components/ChatView.jsx';

export default function App() {
  const [tab, setTab] = useState('today');
  const [toast, setToast] = useState('');

  function handleSubmit(date, couches) {
    const n = couches.reduce((s, c) => s + Object.keys(c.players).length, 0);
    setToast(`Logged ${n} score${n > 1 ? 's' : ''} for ${fmtDate(date)} ✓`);
    setTimeout(() => setToast(''), 2600);
    setTab('today');
  }

  return (
    <>
      <header>
        <div className="wordmark"><span className="kur">KUR</span><span className="jeop">JEOPARDY</span></div>
        <div className="tagline">The Kurjata Family League</div>
      </header>

      {tab === 'today' && <TodayView />}
      {tab === 'board' && <LeaderboardView />}
      {tab === 'entry' && <EntryView onSubmit={handleSubmit} />}
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

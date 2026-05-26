import { useState, useRef, useEffect } from 'react';
import { AV_COLORS } from './shared.jsx';

const SEED_CHAT = [
  { who: 'Nate', me: false, text: '11 and 4 tonight. Brutal final.' },
  { who: 'Jonny', me: true, text: 'A and Dub 22 over here! 🥳' },
  { who: 'Naomi', me: false, text: 'Big dogg won again 🙄 13-6' },
  { who: 'Nate', me: false, gif: 'https://media.tenor.com/x8v1oNUOmg4AAAAC/love-it.gif' },
];

const GIFS = [
  'https://media.tenor.com/x8v1oNUOmg4AAAAC/love-it.gif',
  'https://media.tenor.com/gUiu1zyxfzYAAAAC/thumbs-up.gif',
  'https://media.tenor.com/NShE0_Nm9ksAAAAC/clapping.gif',
  'https://media.tenor.com/bI1JZcaJYIYAAAAC/mind-blown.gif',
];

export default function ChatView() {
  const [msgs, setMsgs] = useState(SEED_CHAT);
  const [txt, setTxt] = useState('');
  const [tray, setTray] = useState(false);
  const endRef = useRef();
  useEffect(() => { endRef.current && endRef.current.scrollIntoView(); }, [msgs]);

  function send() {
    if (!txt.trim()) return;
    setMsgs(m => [...m, { who: 'Jonny', me: true, text: txt.trim() }]);
    setTxt('');
  }

  function sendGif(url) {
    setMsgs(m => [...m, { who: 'Jonny', me: true, gif: url }]);
    setTray(false);
  }

  return (
    <div className="chat-wrap fade">
      <div className="chat-scroll">
        {msgs.map((m, i) => (
          <div className={`msg ${m.me ? 'me' : 'them'}`} key={i}>
            {!m.me && <div className="who" style={{ color: AV_COLORS[m.who] }}>{m.who}</div>}
            {m.text && <div>{m.text}</div>}
            {m.gif && <img src={m.gif} alt="gif" />}
          </div>))}
        <div ref={endRef} />
      </div>
      {tray &&
        <div className="gif-tray">
          {GIFS.map(g => <img key={g} src={g} onClick={() => sendGif(g)} alt="gif" />)}
        </div>}
      <div className="chat-input">
        <button className="gif-btn" onClick={() => setTray(t => !t)}>GIF</button>
        <input value={txt} placeholder="Message the family…"
          onChange={e => setTxt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()} />
        <button onClick={send}>➤</button>
      </div>
    </div>
  );
}

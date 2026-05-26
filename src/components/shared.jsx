export const AV_COLORS = {
  Jonny: '#c0392b', Julia: '#cd6d3a', Mom: '#a8478b', Dad: '#7d5a3c',
  Carmen: '#b5654d', Beckett: '#8e5a9e', Naomi: '#27ae60', Stevie: '#16895a',
  Nate: '#2980b9', Eberley: '#3a7bb5', Kirsten: '#5566c0', Helena: '#4a8fb0', Kevin: '#557799'
};

export const initials = n => n.slice(0, 2).toUpperCase();

export function fmtDate(d) {
  const [y, m, day] = d.split('-');
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1];
  return `${mo} ${+day}, ${y}`;
}

export const Ico = {
  trophy: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6m12 5h1.5a2.5 2.5 0 000-5H18M6 4h12v5a6 6 0 11-12 0V4z"/><path d="M9 18h6M10 22h4M12 18v4"/></svg>,
  plus: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>,
  chart: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="7"/><rect x="13" y="6" width="3" height="12"/><rect x="19" y="14" width="3" height="4" transform="translate(-1 0)"/></svg>,
  chat: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 014 11.5 8.5 8.5 0 1121 11.5z"/></svg>,
  city: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>
};

export function Avatar({ name, size = 38 }) {
  return (
    <div className="avatar" style={{ background: AV_COLORS[name] || '#556',
      width: size, height: size, fontSize: size * 0.42 }}>
      {initials(name)}
    </div>
  );
}

export function CityTag({ city }) {
  return <span className={`citytag city-${city}`}>{city}</span>;
}

export function weekKey(d) {
  const dt = new Date(d + 'T00:00:00');
  const day = (dt.getDay() + 6) % 7; // Mon=0
  dt.setDate(dt.getDate() - day);
  return dt.toISOString().slice(0, 10);
}

export const monthKey = d => d.slice(0, 7);
export const yearKey = d => d.slice(0, 4);

export function periodLabel(gran, key) {
  const MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  if (gran === 'day') return fmtDate(key);
  if (gran === 'year') return key + ' Season';
  if (gran === 'month') { const p = key.split('-'); return MO[+p[1] - 1] + ' ' + p[0]; }
  const start = new Date(key + 'T00:00:00');
  const end = new Date(start); end.setDate(end.getDate() + 6);
  const f = dt => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    [dt.getMonth()] + ' ' + dt.getDate();
  return 'Week of ' + f(start) + '–' + f(end);
}

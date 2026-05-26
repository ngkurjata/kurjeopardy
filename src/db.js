import { supabase } from './supabase.js';
import { PLAYER_CITY } from './model.js';

export async function fetchGames() {
  const { data, error } = await supabase
    .from('games')
    .select('date, couch_id, player, city, score')
    .order('date', { ascending: true })
    .order('couch_id', { ascending: true });

  if (error) throw error;

  // Group flat rows by couch_id, preserving insertion order (date+couch_id sorted).
  const couchMap = new Map();
  for (const row of data) {
    if (!couchMap.has(row.couch_id)) {
      couchMap.set(row.couch_id, { date: row.date, couch_id: row.couch_id, players: [] });
    }
    couchMap.get(row.couch_id).players.push({ name: row.player, city: row.city, score: row.score });
  }

  return [...couchMap.values()];
}

export async function insertGame(date, couches) {
  const rows = [];
  for (const couch of couches) {
    const names = Object.keys(couch.players);
    if (!names.length) continue;
    const city = PLAYER_CITY[names[0]] || 'DC';
    const suffix = Math.random().toString(36).slice(2, 8);
    const couch_id = `${date}_${city}_${suffix}`;
    for (const name of names) {
      rows.push({
        date,
        couch_id,
        player: name,
        city: PLAYER_CITY[name] || city,
        score: couch.players[name],
      });
    }
  }
  const { error } = await supabase.from('games').insert(rows);
  if (error) throw error;
}

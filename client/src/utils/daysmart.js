// Client-side helpers for the DaySmart Vet lookup.
// The actual API secret lives on the server; this only talks to our proxy.

export async function searchClients(query, signal) {
  const res = await fetch(`/api/daysmart/clients?q=${encodeURIComponent(query)}`, { signal });
  if (!res.ok) {
    let msg = `Lookup failed (${res.status}).`;
    try {
      const body = await res.json();
      if (body && body.error) msg = body.error;
    } catch { /* keep default */ }
    throw new Error(msg);
  }
  const body = await res.json();
  return Array.isArray(body.clients) ? body.clients : [];
}

// Map a DaySmart species label ("Canine", "Feline (DSH)", …) to the app's toggle.
export function speciesFromLabel(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('canine') || l.includes('dog')) return 'dog';
  if (l.includes('feline') || l.includes('cat')) return 'cat';
  return null;
}

// Turn an ISO birthdate into a human age string like "4 years" / "7 months".
export function ageFromBirthdate(birthdate) {
  if (!birthdate) return '';
  const born = new Date(birthdate);
  if (Number.isNaN(born.getTime())) return '';
  // DaySmart sends midnight UTC; read the date parts in UTC so it doesn't shift a day locally.
  const now = new Date();
  let months = (now.getFullYear() - born.getUTCFullYear()) * 12 + (now.getMonth() - born.getUTCMonth());
  if (now.getDate() < born.getUTCDate()) months -= 1;
  if (months < 0) return '';
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

// Flatten clients into one selectable row per (client, patient) pair.
export function toPatientRows(clients) {
  const rows = [];
  for (const c of clients) {
    if (c.patients && c.patients.length) {
      for (const p of c.patients) {
        rows.push({ key: `${c.id}-${p.id}`, client: c, patient: p });
      }
    } else {
      rows.push({ key: `${c.id}-none`, client: c, patient: null });
    }
  }
  return rows;
}

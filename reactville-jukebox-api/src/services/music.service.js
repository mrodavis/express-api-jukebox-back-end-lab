// Uses Node's global fetch (Node 18+). If on older Node, `npm i node-fetch` and import it.
const DEFAULT_TIMEOUT_MS = 6000;

const abortable = (ms = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(t) };
};

async function fetchItunes({ artist, title }, signal) {
  const term = [artist, title].filter(Boolean).join(' ');
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', term);
  url.searchParams.set('media', 'music');
  url.searchParams.set('entity', 'song');
  url.searchParams.set('limit', '1');

  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.resultCount) return null;

  const r = json.results[0];
  const coverArtUrl = r.artworkUrl100
    ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
    : null;

  return {
    coverArtUrl,
    soundClipUrl: r.previewUrl || null,
    provider: 'itunes',
    providerTrackId: r.trackId
  };
}

async function fetchDeezer({ artist, title }, signal) {
  const q = `artist:"${artist}" track:"${title}"`;
  const url = new URL('https://api.deezer.com/search');
  url.searchParams.set('q', q);

  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const json = await res.json();
  const r = json?.data?.[0];
  if (!r) return null;

  return {
    coverArtUrl: r.album?.cover_big || r.album?.cover_medium || null,
    soundClipUrl: r.preview || null,
    provider: 'deezer',
    providerTrackId: r.id
  };
}

async function enrichTrack({ title, artist, coverArtUrl, soundClipUrl }) {
  // Skip if both already provided
  if (coverArtUrl && soundClipUrl) return {};

  const { signal, done } = abortable();
  try {
    // Try iTunes first (no auth, very reliable)
    const itunes = await fetchItunes({ artist, title }, signal);
    const fromItunes = {
      coverArtUrl: coverArtUrl || itunes?.coverArtUrl || null,
      soundClipUrl: soundClipUrl || itunes?.soundClipUrl || null
    };
    if (fromItunes.coverArtUrl && fromItunes.soundClipUrl) return fromItunes;

    // Fallback: Deezer (also free, has 30s previews)
    const deezer = await fetchDeezer({ artist, title }, signal);
    return {
      coverArtUrl: fromItunes.coverArtUrl || deezer?.coverArtUrl || null,
      soundClipUrl: fromItunes.soundClipUrl || deezer?.soundClipUrl || null
    };
  } catch {
    return {}; // swallow network timeouts/errors silently
  } finally {
    done();
  }
}

module.exports = { enrichTrack };

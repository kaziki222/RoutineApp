export function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return isValidId(id) ? id : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (url.pathname === '/watch') {
      const v = url.searchParams.get('v');
      return v && isValidId(v) ? v : null;
    }
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments[0] === 'shorts' || segments[0] === 'embed' || segments[0] === 'live') {
      const id = segments[1];
      return id && isValidId(id) ? id : null;
    }
  }
  return null;
}

function isValidId(id: string | undefined): id is string {
  return !!id && /^[A-Za-z0-9_-]{6,20}$/.test(id);
}

export function youTubeThumbnailUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function isSafeHttpUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  try {
    const url = new URL(rawUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

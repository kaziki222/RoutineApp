import { useState } from 'react';
import { extractYouTubeId, youTubeThumbnailUrl } from '../lib/youtube';

type Props = {
  url: string;
};

/**
 * Renders just the YouTube preview image (or a neutral placeholder).
 * No play icon or overlay — the parent owns the action surface.
 */
export function YouTubeThumb({ url }: Props) {
  const id = extractYouTubeId(url);
  const [errored, setErrored] = useState(false);

  if (!id || errored) {
    return <div className="thumb thumb--placeholder" aria-hidden />;
  }
  return (
    <div className="thumb">
      <img
        src={youTubeThumbnailUrl(id)}
        alt=""
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

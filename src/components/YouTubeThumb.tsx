import { Play } from 'lucide-react';
import { useState } from 'react';
import { extractYouTubeId, youTubeThumbnailUrl } from '../lib/youtube';

type Props = {
  url: string;
};

export function YouTubeThumb({ url }: Props) {
  const id = extractYouTubeId(url);
  const [errored, setErrored] = useState(false);

  if (!id || errored) {
    return (
      <div className="thumb thumb--placeholder" aria-hidden>
        <Play size={28} />
      </div>
    );
  }
  return (
    <div className="thumb">
      <img
        src={youTubeThumbnailUrl(id)}
        alt=""
        loading="lazy"
        onError={() => setErrored(true)}
      />
      <div className="thumb__play" aria-hidden>
        <Play size={20} fill="currentColor" />
      </div>
    </div>
  );
}

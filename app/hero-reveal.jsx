'use client';

import { useEffect, useRef, useState } from 'react';

// Holds the hero's entrance until its photo has loaded, then sets
// `data-loaded` so the CSS can play the sequence. Children style themselves
// with `group-data-[loaded]/hero:` variants. The photo needs `data-hero-image`.
//
// MAX_WAIT_MS reveals everything anyway if the photo is slow or fails.
const MAX_WAIT_MS = 4000;

export default function HeroReveal({ children }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current?.querySelector('img[data-hero-image]');
    const reveal = () => setLoaded(true);
    const fallback = setTimeout(reveal, MAX_WAIT_MS);

    if (!img || img.complete) {
      reveal();
    } else {
      img.addEventListener('load', reveal);
      img.addEventListener('error', reveal);
    }
    return () => {
      clearTimeout(fallback);
      img?.removeEventListener('load', reveal);
      img?.removeEventListener('error', reveal);
    };
  }, []);

  return (
    <div ref={ref} className='group/hero' data-loaded={loaded ? '' : undefined}>
      {children}
    </div>
  );
}

import { useEffect } from 'react';

// AdSlot — renders a Google AdSense unit when REACT_APP_ADSENSE_CLIENT is set.
// No-ops (renders nothing) when the env var is absent so the app ships dark
// without a live AdSense account.
//
// Usage: drop <AdSlot /> inside an image-free page's ad-slot aside.
// Never use on Play or Deckbuild (card images present).
//
// The publisher client id and ad-unit slot id come from build-time env vars:
//   REACT_APP_ADSENSE_CLIENT  e.g. ca-pub-1234567890123456
//   REACT_APP_ADSENSE_SLOT    e.g. 1234567890  (the ad-unit slot id)
// Both must be set for the unit to render.

const client = process.env.REACT_APP_ADSENSE_CLIENT;
const slot = process.env.REACT_APP_ADSENSE_SLOT;
const enabled = Boolean(client && slot);

function AdSlot() {
  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      // adsbygoogle not yet loaded — script loads async, push will retry
    }
  }, []);

  if (!enabled) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

export default AdSlot;

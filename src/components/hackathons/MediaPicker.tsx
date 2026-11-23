import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

/** Photos already bundled with the portfolio (they live in /public). */
const SITE_PHOTOS = [
  '/smart-india-hackathon.jpg',
  '/openai-nxtwave.png',
  '/openai-nxtwave-nationals.png',
  '/vit-void-hackathon.jpg',
  '/google-solution-challenge.png',
  '/badge-solution-challenge.png',
  '/synsara.jpg',
  '/srm.jpg',
];

interface MediaImage {
  id: string;
  name: string;
  url: string;
}

const Thumb = ({ url, name, selected, onPick }: { url: string; name: string; selected: boolean; onPick: () => void }) => (
  <button
    type="button"
    onClick={onPick}
    title={name}
    className={cn(
      'group relative aspect-square overflow-hidden rounded-lg border bg-muted/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      selected ? 'border-primary ring-2 ring-primary/40' : 'border-border/60 hover:border-primary/60',
    )}
  >
    <img src={url} alt={name} loading="lazy" draggable={false} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
  </button>
);

/** Pick any photo already uploaded to the Media library, or one of the portfolio's own photos. */
export const MediaPicker = ({ value, onPick }: { value: string; onPick: (url: string) => void }) => {
  const [media, setMedia] = useState<MediaImage[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'media'), orderBy('uploadedAt', 'desc')));
        if (cancelled) return;
        const list: MediaImage[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (typeof data.type === 'string' && data.type.startsWith('image') && data.url) {
            list.push({ id: d.id, name: data.name || 'image', url: data.url });
          }
        });
        setMedia(list);
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-foreground">Your media library</p>
        {state === 'loading' && <p className="text-xs text-muted-foreground">Loading your uploads…</p>}
        {state === 'error' && <p className="text-xs text-muted-foreground">Couldn’t load the media library. Upload a photo above instead.</p>}
        {state === 'ready' && media.length === 0 && (
          <p className="text-xs text-muted-foreground">Nothing uploaded yet. Files you add in Media will show up here.</p>
        )}
        {media.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {media.map((m) => (
              <Thumb key={m.id} url={m.url} name={m.name} selected={m.url === value} onPick={() => onPick(m.url)} />
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-foreground">Portfolio photos</p>
        <div className="grid grid-cols-4 gap-2">
          {SITE_PHOTOS.map((url) => (
            <Thumb key={url} url={url} name={url.replace('/', '')} selected={url === value} onPick={() => onPick(url)} />
          ))}
        </div>
      </div>
    </div>
  );
};

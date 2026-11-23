import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { legacyFitFor, normalizePhotoEdit, photoEditStyle, type PhotoEdit } from './photoEdit';

/** The photo layer with its saved edits applied. Used by the site, the admin list and the studio. */
export const HackathonPhoto = ({ src, alt, edit, className }: { src: string; alt: string; edit: PhotoEdit; className?: string }) => (
  <img
    src={src}
    alt={alt}
    draggable={false}
    className={cn('h-full w-full select-none', className)}
    style={photoEditStyle(edit)}
  />
);

export interface HackathonCardFaceProps {
  name: string;
  year: string;
  image?: string;
  photoEdit?: Partial<PhotoEdit> | null;
  /** Hover zoom / badge spin. Switched off inside the studio so the preview stays still. */
  hoverEffects?: boolean;
}

/**
 * Inside of a hackathon card: photo, readability gradient, trophy badge, year and title.
 * Render it inside a `relative group overflow-hidden` card. The public site and the admin
 * Photo Studio both use this, so the preview is exactly what visitors see.
 */
export const HackathonCardFace = ({ name, year, image, photoEdit, hoverEffects = true }: HackathonCardFaceProps) => {
  const edit = normalizePhotoEdit(photoEdit, legacyFitFor(image, name));

  return (
    <>
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-black">
        {image ? (
          <motion.div
            className="h-full w-full"
            whileHover={hoverEffects ? { scale: 1.05 } : undefined}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <HackathonPhoto src={image} alt={name} edit={edit} />
          </motion.div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🏆</div>
        )}
        {/* Overlay Gradient for Text Readability */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"
          style={{ opacity: edit.overlay / 100 }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col h-full p-6 justify-end">
        {/* Badges top right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <motion.div
            className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
            whileHover={hoverEffects ? { rotate: 360, scale: 1.1 } : undefined}
            transition={{ duration: 0.5 }}
          >
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <Badge variant="secondary" className="shadow-md bg-background/80 backdrop-blur-sm">
            {year}
          </Badge>
        </div>

        <motion.h3
          className="text-2xl font-bold mb-2 text-white group-hover:text-primary transition-colors line-clamp-2"
          whileHover={hoverEffects ? { x: 5 } : undefined}
          transition={{ duration: 0.2 }}
        >
          {name}
        </motion.h3>
      </div>
    </>
  );
};

import { Linkedin, MessageSquare } from 'lucide-react';
import { PanelCard, PanelHeading } from './panelPrimitives';

const LINKEDIN_BLUE = '#0A66C2';

interface LinkedInDetailsProps {
  name: string;
  role: string;
  profileUrl: string;
}

/** Right-hand column for the LinkedIn face. LinkedIn has no public API, so this stays static. */
export const LinkedInDetails = ({ name, role, profileUrl }: LinkedInDetailsProps) => (
  <PanelCard className="p-6">
    <PanelHeading icon={Linkedin} title="LinkedIn" accent={LINKEDIN_BLUE} />
    <h3 className="text-2xl font-bold text-white md:text-3xl">Let’s connect on LinkedIn</h3>
    <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-white/70">
      {name} · {role}. I share project write-ups, hackathon learnings and what I’m building in AI. If you’re hiring,
      collaborating, or just want to talk shop, send a connection request.
    </p>
    <div className="mt-6 flex flex-wrap gap-3">
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: LINKEDIN_BLUE }}
      >
        <Linkedin className="h-4 w-4" aria-hidden="true" />
        Open my profile
      </a>
      <a
        href={`${profileUrl.replace(/\/$/, '')}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
      >
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
        Send a message
      </a>
    </div>
  </PanelCard>
);

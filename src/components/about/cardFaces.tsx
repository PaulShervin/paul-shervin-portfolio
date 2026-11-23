import type { ReactNode } from 'react';
import { Flame, Github, Hash, Linkedin, Mail, MapPin, Star, Users, type LucideIcon } from 'lucide-react';
import { SiLeetcode } from 'react-icons/si';
import type { IconType } from 'react-icons';
import portrait from '@/assets/hero-foreground.webp';
import { useLeetCodeStats } from '@/hooks/useLeetCodeStats';
import { useGitHubStats } from '@/hooks/useGitHubStats';
import { Skeleton, formatNumber } from './panelPrimitives';

/* ── Shared props ── */

export interface Socials {
  github: string;
  linkedin: string;
  leetcode: string;
  email: string;
}

export interface AboutFaceProps {
  name: string;
  role: string;
  location: string;
  socials: Socials;
  leetcode: { rating: number; streak: number };
}

const skillChips = ['Machine Learning', 'Deep Learning', 'Generative AI', 'Full-Stack'];
const ink = 'text-[#1e3a2c]';
const LEETCODE_ORANGE = '#FFA116';
const STAR_GOLD = '#E3B341';
const LINKEDIN_BLUE = '#0A66C2';

/* ── Small pieces reused by the dark faces ── */

const DarkStat = ({ icon: Icon, value, label, tone }: { icon: LucideIcon | IconType; value: ReactNode; label: string; tone?: string }) => (
  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-2.5 py-2.5">
    <Icon className="h-[18px] w-[18px] shrink-0" style={tone ? { color: tone } : undefined} aria-hidden="true" />
    <div className="min-w-0">
      <dd className="text-lg font-bold leading-none text-white">{value}</dd>
      <dt className="mt-1 whitespace-nowrap text-[11px] text-white/55">{label}</dt>
    </div>
  </div>
);

const DarkButton = ({ href, children, color = '#ffffff', text = '#000000' }: { href: string; children: ReactNode; color?: string; text?: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onPointerDown={e => e.stopPropagation()}
    className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
    style={{ background: color, color: text }}
  >
    {children}
  </a>
);

const Avatar = ({ src, alt, ring }: { src?: string | null; alt: string; ring: string }) =>
  src ? (
    <img src={src} alt={alt} className={`h-[144px] w-[144px] rounded-full object-cover ring-4 ${ring}`} loading="lazy" draggable={false} />
  ) : (
    <Skeleton className={`h-[144px] w-[144px] rounded-full ring-4 ${ring}`} />
  );

/* ── About face (the original ID card content) ── */

export const AboutFace = ({ name, role, location, socials, leetcode }: AboutFaceProps) => {
  const socialLinks = [
    { icon: Github, href: socials.github, label: 'GitHub profile' },
    { icon: Linkedin, href: socials.linkedin, label: 'LinkedIn profile' },
    { icon: SiLeetcode, href: socials.leetcode, label: 'LeetCode profile' },
    { icon: Mail, href: `mailto:${socials.email}`, label: 'Send an email' },
  ];

  return (
    <>
      <div className="relative z-[1] -mt-[63px] flex justify-center">
        <div className="rounded-full bg-[conic-gradient(from_200deg,#7ee2a8,#2f7a58,#e3f6ea,#2f7a58,#7ee2a8)] p-[3px] shadow-[0_12px_28px_-8px_rgba(30,58,44,0.55)]">
          <div className="h-[120px] w-[120px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_35%,#e3f6ea,#a9dcc0)] ring-4 ring-[#f7faf7]">
            <img src={portrait} alt={`Portrait of ${name}`} className="pointer-events-none relative left-[-41%] top-[6%] w-[146%] max-w-none" draggable={false} loading="lazy" decoding="async" />
          </div>
        </div>
      </div>

      <div className="px-6 pt-3 text-center">
        <h3 className={`text-[22px] font-extrabold leading-tight tracking-tight ${ink}`}>{name}</h3>
        <p className="mt-1 inline-block rounded-full bg-[#2f7a58]/10 px-3 py-0.5 text-[13px] font-semibold text-[#2f7a58]">{role}</p>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-[#4a5d55]">
          <MapPin className="h-3.5 w-3.5 text-[#2f7a58]" aria-hidden="true" />
          {location}
        </p>
      </div>

      <ul className="mt-3 flex flex-wrap justify-center gap-1.5 px-5" aria-label="Focus areas">
        {skillChips.map(chip => (
          <li key={chip} className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-[#2d5a46]">
            {chip}
          </li>
        ))}
      </ul>

      <div className="mx-6 mt-3 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

      <dl className="mt-3 grid grid-cols-2 gap-2.5 px-5">
        {[
          { icon: SiLeetcode, value: leetcode.rating, label: 'LeetCode Rating', tone: 'text-[#e7a41f]' },
          { icon: Flame, value: leetcode.streak, label: 'Day Streak', tone: 'text-[#e2552c]' },
        ].map(({ icon: Icon, value, label, tone }) => (
          <div key={label} className="flex items-center gap-2 rounded-xl border border-primary/20 bg-gradient-to-br from-white to-[#e9f5ee] px-2.5 py-2 shadow-[0_2px_8px_-4px_rgba(30,58,44,0.25)]">
            <Icon className={`h-[18px] w-[18px] shrink-0 ${tone}`} aria-hidden="true" />
            <div className="min-w-0">
              <dd className={`text-lg font-bold leading-none ${ink}`}>{value}</dd>
              <dt className="mt-1 whitespace-nowrap text-[11px] text-[#5a6b63]">{label}</dt>
            </div>
          </div>
        ))}
      </dl>

      <ul className="mt-3 flex justify-center gap-2.5 px-5" aria-label="Social links">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <li key={label}>
            <a
              href={href}
              aria-label={label}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              onPointerDown={e => e.stopPropagation()}
              className={`flex h-10 w-12 cursor-pointer items-center justify-center rounded-xl border border-primary/15 bg-white/70 ${ink} transition-colors hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      <div className="px-5 pb-4 pt-3">
        <div className="flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#2f7a58,#1e4d3a)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_-8px_rgba(30,77,58,0.7)]">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ee2a8] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7ee2a8]" />
          </span>
          Open to Opportunities
        </div>
      </div>
    </>
  );
};

/* ── LeetCode face ── */

export const LeetCodeFace = ({ username, profileUrl }: { username: string; profileUrl: string }) => {
  const { profileQuery, calendarQuery, badgesQuery } = useLeetCodeStats(username);
  const profile = profileQuery.data;
  const calendar = calendarQuery.data;
  const badges = (badgesQuery.data ?? []).slice(0, 4);

  return (
    <>
      <div className="relative z-[1] -mt-[72px] flex justify-center">
        <Avatar src={profile?.avatar} alt={`${profile?.name ?? username} on LeetCode`} ring="ring-[#141414]" />
      </div>
      <div className="px-6 pt-4 text-center">
        <h3 className="text-[22px] font-bold leading-tight text-white">{profile?.name || username}</h3>
        <p className="mt-1 text-sm font-semibold" style={{ color: LEETCODE_ORANGE }}>@{profile?.username ?? username}</p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/55">
          <Hash className="h-3.5 w-3.5" aria-hidden="true" />
          Global rank {profile?.ranking ? formatNumber(profile.ranking) : '—'}
        </p>
      </div>

      <div className="mx-6 mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <dl className="mt-4 grid grid-cols-2 gap-3 px-5">
        <DarkStat icon={Flame} value={calendar?.streak ?? '—'} label="Day Streak" tone={LEETCODE_ORANGE} />
        <DarkStat icon={SiLeetcode} value={calendar?.totalActiveDays ?? '—'} label="Active Days" tone="#ffffff" />
      </dl>

      <ul className="mt-4 flex justify-center gap-3 px-5" aria-label="Latest badges">
        {badges.map(badge => (
          <li key={badge.id} title={badge.name} className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-black/40 p-1.5">
            <img src={badge.image} alt={badge.name} className="h-full w-full object-contain" loading="lazy" draggable={false} />
          </li>
        ))}
      </ul>

      <div className="px-5 pb-5">
        <DarkButton href={profileUrl} color={LEETCODE_ORANGE}>
          <SiLeetcode className="h-4 w-4" aria-hidden="true" />
          View LeetCode profile
        </DarkButton>
      </div>
    </>
  );
};

/* ── GitHub face ── */

export const GitHubFace = ({ username, profileUrl }: { username: string; profileUrl: string }) => {
  const { userQuery, streakQuery, starsQuery } = useGitHubStats(username);
  const user = userQuery.data;

  return (
    <>
      <div className="relative z-[1] -mt-[72px] flex justify-center">
        <Avatar src={user?.avatar_url} alt={`${user?.name ?? username} on GitHub`} ring="ring-[#141414]" />
      </div>
      <div className="px-6 pt-4 text-center">
        <h3 className="text-[22px] font-bold leading-tight text-white">{user?.name || username}</h3>
        <p className="mt-1 text-sm font-semibold text-white/70">@{user?.login ?? username}</p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/55">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {user ? `${formatNumber(user.followers)} followers · ${formatNumber(user.public_repos)} repos` : '—'}
        </p>
      </div>

      <div className="mx-6 mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <dl className="mt-4 grid grid-cols-2 gap-3 px-5">
        <DarkStat icon={Flame} value={streakQuery.data?.currentStreak ?? '—'} label="Day Streak" tone="#3FB950" />
        <DarkStat icon={Star} value={starsQuery.data?.totalStars ?? '—'} label="Stars Received" tone={STAR_GOLD} />
      </dl>

      <div className="px-5 pb-5">
        <DarkButton href={profileUrl}>
          <Github className="h-4 w-4" aria-hidden="true" />
          View GitHub profile
        </DarkButton>
      </div>
    </>
  );
};

/* ── LinkedIn face ── */

export const LinkedInFace = ({ name, role, location, profileUrl }: { name: string; role: string; location: string; profileUrl: string }) => (
  <>
    <div className="relative z-[1] -mt-[72px] flex justify-center">
      <div className="h-[144px] w-[144px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_35%,#1b4f86,#0a2a4c)] ring-4 ring-[#141414]">
        <img src={portrait} alt={`Portrait of ${name}`} className="pointer-events-none relative left-[-41%] top-[6%] w-[146%] max-w-none" draggable={false} loading="lazy" decoding="async" />
      </div>
    </div>
    <div className="px-6 pt-4 text-center">
      <h3 className="text-[22px] font-bold leading-tight text-white">{name}</h3>
      <p className="mt-1 text-sm font-semibold" style={{ color: '#4da3ff' }}>{role}</p>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/55">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        {location}
      </p>
    </div>

    <div className="mx-6 mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

    <div className="mx-5 mt-4 rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-center text-sm leading-relaxed text-white/70">
      Open to internships, collaborations and conversations about AI. Let’s connect.
    </div>

    <div className="px-5 pb-5">
      <DarkButton href={profileUrl} color={LINKEDIN_BLUE} text="#ffffff">
        <Linkedin className="h-4 w-4" aria-hidden="true" />
        Open LinkedIn profile
      </DarkButton>
    </div>
  </>
);

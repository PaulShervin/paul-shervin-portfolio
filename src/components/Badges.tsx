import { motion } from 'framer-motion';
import { Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePortfolioData } from '../hooks/usePortfolioData';
import demoData from '../data/demo-data.json';

const serif = { fontFamily: '"Cormorant Garamond", serif' };

interface BadgeCardProps {
  name: string;
  source: string;
  image: string;
  delay: number;
}

const BadgeCard = ({ name, source, image }: BadgeCardProps) => {
  const isRealImage = image && (image.startsWith('http') || image.startsWith('/'));

  return (
    <div className="group flex flex-col items-center justify-center gap-4 min-w-[140px] md:min-w-[180px] opacity-60 hover:opacity-100 transition-opacity duration-300 px-4 cursor-default">
      <div className="w-20 h-20 md:w-28 md:h-28 relative flex items-center justify-center">
        {isRealImage ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-full rounded-full bg-muted/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
          style={{ display: isRealImage ? 'none' : 'flex' }}
        >
          <Award className="w-8 h-8 text-primary/50" />
        </div>
      </div>
      <div className="text-center">
        <h4 className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors max-w-[120px] md:max-w-[160px] leading-snug mx-auto" style={serif}>
          {name}
        </h4>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-2 font-mono">
          {source}
        </p>
      </div>
    </div>
  );
};

export const Badges = () => {
  const { profileQuery } = usePortfolioData();
  const profile = profileQuery.data;

  // Extract LeetCode username from profile or fallback
  const leetcodeUrl = profile?.socials?.leetcode || 'https://leetcode.com/u/paulshervinp/';
  const leetcodeUsername = leetcodeUrl.replace(/\/$/, '').split('/').pop() || 'paulshervinp';

  // Extract GitHub username from profile or fallback
  const githubUrl = profile?.socials?.github || 'https://github.com/PaulShervin';
  const githubUsername = githubUrl.replace(/\/$/, '').split('/').pop() || 'PaulShervin';

  // Fetch LeetCode badges dynamically
  const { data: leetcodeBadges, isLoading: isLeetcodeLoading } = useQuery({
    queryKey: ['leetcodeBadges', leetcodeUsername],
    queryFn: async () => {
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/${leetcodeUsername}/badges`);
      if (!response.ok) {
        throw new Error('Failed to fetch LeetCode badges');
      }
      const data = await response.json();
      return data.badges || [];
    },
    retry: 2,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Fetch GitHub achievements dynamically
  const { data: githubBadges, isLoading: isGithubLoading } = useQuery({
    queryKey: ['githubBadges', githubUsername],
    queryFn: async () => {
      const corsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://github.com/${githubUsername}`)}`;
      const response = await fetch(corsUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub profile HTML');
      }
      const data = await response.json();
      const html = data.contents;
      if (!html) return [];
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const achievementsList: any[] = [];
      
      // Target the achievement images in the profile sidebar
      const achievementElements = doc.querySelectorAll('.achievement-badge-sidebar, img[data-hovercard-type="achievement"]');
      achievementElements.forEach((img) => {
        const name = img.getAttribute('alt')?.replace('Achievement: ', '') || '';
        const image = img.getAttribute('src') || '';
        if (name && image) {
          if (!achievementsList.some(item => item.name === name)) {
            achievementsList.push({
              name,
              source: 'GitHub',
              image,
            });
          }
        }
      });
      return achievementsList;
    },
    retry: 2,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Define GitHub profile achievement names to filter out of mock achievements
  const githubProfileAchievementNames = [
    'Pull Shark',
    'YOLO',
    'Pair Extraordinary',
    'Quickdraw',
    'Galaxy Brain',
    'Arctic Code Vault Contributor',
    'Public Sponsor',
    'Starstruck'
  ];

  // Filter out static LeetCode badges and specific static GitHub profile achievements
  const staticFilteredBadges = demoData.badges.filter(b => 
    b.source !== 'LeetCode' && 
    !(b.source === 'GitHub' && githubProfileAchievementNames.includes(b.name))
  );

  // Map LeetCode badges
  const mappedLeetcodeBadges = (leetcodeBadges || []).map((badge: any) => {
    let iconUrl = badge.icon;
    if (iconUrl && iconUrl.startsWith('/')) {
      iconUrl = `https://leetcode.com${iconUrl}`;
    }
    return {
      name: badge.displayName,
      source: 'LeetCode',
      image: iconUrl,
    };
  });

  // Combine static non-dynamic achievements with fetched ones
  const finalLeetcode = (leetcodeBadges && leetcodeBadges.length > 0)
    ? mappedLeetcodeBadges
    : demoData.badges.filter(b => b.source === 'LeetCode');

  const finalGithub = (githubBadges && githubBadges.length > 0)
    ? githubBadges
    : demoData.badges.filter(b => b.source === 'GitHub' && githubProfileAchievementNames.includes(b.name));

  const displayBadges = [
    ...staticFilteredBadges,
    ...finalLeetcode,
    ...finalGithub
  ];

  const isLoading = isLeetcodeLoading || isGithubLoading;

  return (
    <section id="badges" className="pt-12 md:pt-16 pb-24 md:pb-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight" style={serif}>
            Continuous <span className="italic text-primary/80 font-light">mastery.</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg flex items-center justify-center gap-2 max-w-xl mx-auto">
            Milestones and achievements that reflect a journey of continuous growth and technical validation.
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary/50" />}
          </p>
        </motion.div>
      </div>

      {/* Marquee Row */}
      <div className="relative w-full overflow-hidden flex items-center [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          className="flex items-center gap-8 md:gap-16 w-max shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 50, repeat: Infinity }}
        >
          {[...displayBadges, ...displayBadges].map((badge, index) => (
            <BadgeCard
              key={`${badge.name}-${index}`}
              name={badge.name}
              source={badge.source}
              image={badge.image}
              delay={0}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

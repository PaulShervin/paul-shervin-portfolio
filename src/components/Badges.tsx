import { motion } from 'framer-motion';
import { Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePortfolioData } from '../hooks/usePortfolioData';
import demoData from '../data/demo-data.json';

interface BadgeCardProps {
  name: string;
  source: string;
  image: string;
  delay: number;
}

const BadgeCard = ({ name, source, image, delay }: BadgeCardProps) => {
  const isRealImage = image && (image.startsWith('http') || image.startsWith('/'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        scale: 1.05,
        y: -8,
        transition: { duration: 0.25, ease: [0.34, 1.26, 0.64, 1] }
      }}
      className="group relative rounded-xl p-4 py-5 transition-all duration-300
        bg-[hsl(var(--skill-card-bg))] 
        hover:bg-[hsl(var(--skill-card-hover))]
        shadow-[var(--shadow-skill-card)]
        hover:shadow-[var(--shadow-skill-hover)]
        border border-border/10
        hover:border-[hsl(var(--cyber-teal))]/50
        cursor-default
        flex flex-col items-center justify-center gap-3
        overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cyber-teal))]/5 to-transparent" />
      </div>
      
      {/* Badge Image */}
      <motion.div 
        className="w-16 h-16 flex items-center justify-center relative z-10"
        whileHover={{ 
          scale: 1.15,
          rotate: [0, -3, 3, 0],
          transition: { duration: 0.4 }
        }}
      >
        {isRealImage ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(244,180,26,0.2)] transition-transform duration-300"
            onError={(e) => {
              // Hide image and show fallback Award icon if it fails to load
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-full rounded-full bg-muted/20 flex items-center justify-center"
          style={{ display: isRealImage ? 'none' : 'flex' }}
        >
          <Award className="w-8 h-8 text-primary" />
        </div>
      </motion.div>
      
      {/* Badge Info */}
      <div className="text-center relative z-10">
        <h4 className="text-sm font-bold text-foreground mb-1">
          {name}
        </h4>
        <p className="text-xs text-muted-foreground">
          {source}
        </p>
      </div>
    </motion.div>
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
    <section id="badges" className="py-16 md:py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">
            Achieved Badges
          </h2>
          <p className="text-muted-foreground text-base md:text-lg flex items-center justify-center gap-2">
            Milestones that reflect the journey of continuous growth and mastery 🏆
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary inline-block ml-2" />}
          </p>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
          {displayBadges.map((badge, index) => (
            <BadgeCard
              key={`${badge.name}-${index}`}
              name={badge.name}
              source={badge.source}
              image={badge.image}
              delay={index * 40}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

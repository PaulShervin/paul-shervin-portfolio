import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/demo-data.json');

async function main() {
  console.log('Fetching badges and achievements...');
  
  try {
    const demoData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // LeetCode Username
    const leetcodeUrl = demoData.socials.leetcode || 'https://leetcode.com/u/paulshervinp/';
    const leetcodeUsername = leetcodeUrl.replace(/\/$/, '').split('/').pop() || 'paulshervinp';

    // GitHub Username
    const githubUrl = demoData.socials.github || 'https://github.com/PaulShervin';
    const githubUsername = githubUrl.replace(/\/$/, '').split('/').pop() || 'PaulShervin';

    console.log(`LeetCode username: ${leetcodeUsername}`);
    console.log(`GitHub username: ${githubUsername}`);

    // 1. Fetch LeetCode badges
    let leetcodeBadges = [];
    try {
      const leetcodeRes = await fetch(`https://alfa-leetcode-api.onrender.com/${leetcodeUsername}/badges`);
      if (leetcodeRes.ok) {
        const data = await leetcodeRes.json();
        leetcodeBadges = (data.badges || []).map(badge => {
          let iconUrl = badge.icon;
          if (iconUrl && iconUrl.startsWith('/')) {
            iconUrl = `https://leetcode.com${iconUrl}`;
          }
          return {
            name: badge.displayName,
            source: 'LeetCode',
            image: iconUrl
          };
        });
        console.log(`Fetched ${leetcodeBadges.length} LeetCode badges.`);
      } else {
        console.error('Failed to fetch LeetCode badges, response status:', leetcodeRes.status);
      }
    } catch (e) {
      console.error('Error fetching LeetCode badges:', e.message);
    }

    // 2. Fetch GitHub achievements
    let githubBadges = [];
    try {
      const response = await fetch(`https://github.com/${githubUsername}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (response.ok) {
        const html = await response.text();
        const imgRegex = /<img[^>]+>/g;
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
          const imgTag = match[0];
          if (imgTag.includes('data-hovercard-type="achievement"')) {
            const srcMatch = /src="([^"]+)"/.exec(imgTag);
            const altMatch = /alt="Achievement: ([^"]+)"/.exec(imgTag);
            if (srcMatch && altMatch) {
              const name = altMatch[1];
              const image = srcMatch[1];
              if (!githubBadges.some(b => b.name === name)) {
                githubBadges.push({
                  name,
                  source: 'GitHub',
                  image
                });
              }
            }
          }
        }
        console.log(`Fetched ${githubBadges.length} GitHub achievements:`, githubBadges.map(b => b.name).join(', '));
      } else {
        console.error('Failed to fetch GitHub profile HTML, response status:', response.status);
      }
    } catch (e) {
      console.error('Error fetching GitHub achievements:', e.message);
    }

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

    // Filter out static LeetCode badges, the Google Solution Challenge badge, and specific static GitHub profile achievements
    const staticFilteredBadges = demoData.badges.filter(b => 
      b.source !== 'LeetCode' && 
      b.name !== 'Google Solution Challenge' &&
      !(b.source === 'GitHub' && githubProfileAchievementNames.includes(b.name))
    );

    // Keep existing fallback lists if we fetched nothing
    const finalLeetcode = leetcodeBadges.length > 0 ? leetcodeBadges : demoData.badges.filter(b => b.source === 'LeetCode');
    const finalGithub = githubBadges.length > 0 ? githubBadges : demoData.badges.filter(b => b.source === 'GitHub' && githubProfileAchievementNames.includes(b.name));

    // Define the custom Google Solution Challenge badge to be placed in the first place
    const solutionChallengeBadge = {
      name: "Google Solution Challenge",
      source: "Google",
      image: "/badge-solution-challenge.png"
    };

    // Combine them, putting the Google Solution Challenge badge first
    const newBadgesList = [
      solutionChallengeBadge,
      ...staticFilteredBadges,
      ...finalLeetcode,
      ...finalGithub
    ];

    // Write back to demo-data.json
    demoData.badges = newBadgesList;
    fs.writeFileSync(jsonPath, JSON.stringify(demoData, null, 2), 'utf8');
    console.log('Successfully updated src/data/demo-data.json with fetched badges!');

  } catch (err) {
    console.error('Main error:', err);
  }
}

main();

import type { LucideIcon } from 'lucide-react';
import { Code2, Brain, Globe, Database, Cpu, Layers, Wrench } from 'lucide-react';
import type { IconType } from 'react-icons';
import {
  SiPython,
  SiGit,
  SiGithub,
  SiJupyter,
  SiFirebase,
  SiFigma,
  SiPostman,
  SiDocker,
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';

export interface CategoryMeta {
  icon: LucideIcon;
  /** Hex accent colour used for the icon tile, dots and hover states. */
  color: string;
}

const CATEGORY_RULES: Array<{ match: string[]; meta: CategoryMeta }> = [
  { match: ['devops', 'tool', 'cloud', 'infra'], meta: { icon: Wrench, color: '#F97316' } },
  { match: ['ai', 'machine', 'learn', 'ml', 'deep'], meta: { icon: Brain, color: '#8B5CF6' } },
  { match: ['prog', 'lang'], meta: { icon: Code2, color: '#3B82F6' } },
  { match: ['frame', 'librar'], meta: { icon: Layers, color: '#10B981' } },
  { match: ['data', 'back', 'sql'], meta: { icon: Database, color: '#06B6D4' } },
  { match: ['web', 'front', 'dev'], meta: { icon: Globe, color: '#EC4899' } },
];

const FALLBACK_META: CategoryMeta = { icon: Cpu, color: '#4A8B6F' };

export const getCategoryMeta = (category: string): CategoryMeta => {
  const lower = category.toLowerCase();
  const rule = CATEGORY_RULES.find(({ match }) => match.some(token => lower.includes(token)));
  return rule ? rule.meta : FALLBACK_META;
};

export interface ToolMeta {
  name: string;
  icon: IconType;
  color: string;
  /** Brand colour is near-black; render the glyph with the theme foreground instead. */
  useForeground?: boolean;
}

export const TOOLS: ToolMeta[] = [
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'Git', icon: SiGit, color: '#F05032' },
  { name: 'GitHub', icon: SiGithub, color: '#6E7681', useForeground: true },
  { name: 'VS Code', icon: VscVscode, color: '#007ACC' },
  { name: 'Jupyter', icon: SiJupyter, color: '#F37626' },
  { name: 'Firebase', icon: SiFirebase, color: '#FFA000' },
  { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  { name: 'Postman', icon: SiPostman, color: '#FF6C37' },
  { name: 'Docker', icon: SiDocker, color: '#2496ED' },
];

import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { SiLeetcode } from 'react-icons/si';
import demoData from '../data/demo-data.json';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient mb-2">
              {demoData.meta.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {demoData.meta.role}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#about" className="hover:text-primary transition-colors">About</a>
              </li>
              <li>
                <a href="#skills" className="hover:text-primary transition-colors">Skills</a>
              </li>
              <li>
                <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              <a
                href={demoData.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full glassmorphism hover:bg-primary/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={demoData.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full glassmorphism hover:bg-primary/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={demoData.socials.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full glassmorphism hover:bg-primary/10 transition-colors"
                aria-label="LeetCode"
              >
                <SiLeetcode className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${demoData.socials.email}`}
                className="p-2 rounded-full glassmorphism hover:bg-primary/10 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} {demoData.meta.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-4 h-4 text-primary fill-primary inline" /> using React & GSAP
          </p>
        </div>
      </div>
    </footer>
  );
};

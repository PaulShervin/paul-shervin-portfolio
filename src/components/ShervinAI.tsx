import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import portrait from '@/assets/hero-portrait.png';

/* ─── Chat tree data structure ─── */
interface ChatNode {
  id: string;
  message: string;
  options: { label: string; emoji: string; nextId: string }[];
}

const chatTree: Record<string, ChatNode> = {
  root: {
    id: 'root',
    message: "Hey there! 👋 I'm Shervin AI — your personal guide to Paul Shervin's portfolio. What would you like to explore?",
    options: [
      { label: 'About Me', emoji: '👤', nextId: 'about' },
      { label: 'Skills', emoji: '⚡', nextId: 'skills' },
      { label: 'Projects', emoji: '🚀', nextId: 'projects' },
      { label: 'Certifications', emoji: '📜', nextId: 'certifications' },
      { label: 'Hackathons', emoji: '🏆', nextId: 'hackathons' },
      { label: 'Contact', emoji: '📬', nextId: 'contact' },
    ],
  },
  about: {
    id: 'about',
    message:
      "Hi, I'm Paul Shervin — an AI & ML student at Saveetha Engineering College passionate about Machine Learning, Generative AI, and Full Stack Development. I love solving complex DSA and Java problems and building impactful solutions that bridge technology with real-world challenges.",
    options: [
      { label: 'Education', emoji: '🎓', nextId: 'education' },
      { label: 'Goals', emoji: '🎯', nextId: 'goals' },
      { label: 'Skills', emoji: '⚡', nextId: 'skills' },
      { label: 'Projects', emoji: '🚀', nextId: 'projects' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  education: {
    id: 'education',
    message:
      "🎓 B.Tech in AI & ML at Saveetha Engineering College (2022–2026) with a GPA of 8.5/10. Active in coding clubs and AI research groups.",
    options: [
      { label: 'About Me', emoji: '👤', nextId: 'about' },
      { label: 'Goals', emoji: '🎯', nextId: 'goals' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  goals: {
    id: 'goals',
    message:
      "🎯 My goal is to become a leading AI engineer specializing in Generative AI and Agentic AI systems — building impactful, real-world solutions and mentoring the next generation of developers.",
    options: [
      { label: 'About Me', emoji: '👤', nextId: 'about' },
      { label: 'Projects', emoji: '🚀', nextId: 'projects' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  skills: {
    id: 'skills',
    message:
      "⚡ I specialize in Python, Java, SQL, TensorFlow, PyTorch, scikit-learn, React, Node.js, and more. Plus tools like Git, Docker, Jupyter & Figma.",
    options: [
      { label: 'Programming', emoji: '💻', nextId: 'skills_programming' },
      { label: 'AI & ML', emoji: '🧠', nextId: 'skills_ai' },
      { label: 'Web Dev', emoji: '🌐', nextId: 'skills_web' },
      { label: 'Tools', emoji: '🔧', nextId: 'skills_tools' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  skills_programming: {
    id: 'skills_programming',
    message: '💻 Languages:\n• Python ★★★★★\n• Java ★★★★☆\n• C / C++ ★★★☆☆\n• SQL ★★★★☆',
    options: [
      { label: 'AI & ML', emoji: '🧠', nextId: 'skills_ai' },
      { label: 'Web Dev', emoji: '🌐', nextId: 'skills_web' },
      { label: '← Skills', emoji: '⚡', nextId: 'skills' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  skills_ai: {
    id: 'skills_ai',
    message: '🧠 AI & ML:\n• Machine Learning ★★★★★\n• Deep Learning ★★★★☆\n• Data Analysis ★★★★☆\n• NLP ★★★☆☆\n\nTensorFlow, PyTorch, LangChain',
    options: [
      { label: 'Programming', emoji: '💻', nextId: 'skills_programming' },
      { label: 'Projects', emoji: '🚀', nextId: 'projects' },
      { label: '← Skills', emoji: '⚡', nextId: 'skills' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  skills_web: {
    id: 'skills_web',
    message: '🌐 Web Dev:\n• HTML & CSS ★★★★★\n• JavaScript ★★★★☆\n• React ★★★★☆\n• Node.js ★★★☆☆\n• Firebase & MongoDB',
    options: [
      { label: 'Tools', emoji: '🔧', nextId: 'skills_tools' },
      { label: '← Skills', emoji: '⚡', nextId: 'skills' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  skills_tools: {
    id: 'skills_tools',
    message: '🔧 Tools:\n• Git & GitHub\n• VS Code & Jupyter\n• Docker\n• Postman\n• Figma\n• Firebase',
    options: [
      { label: 'Programming', emoji: '💻', nextId: 'skills_programming' },
      { label: '← Skills', emoji: '⚡', nextId: 'skills' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  projects: {
    id: 'projects',
    message: "🚀 I've built 4+ AI/ML projects — from traffic optimization with RL to medical image segmentation. Which one interests you?",
    options: [
      { label: 'Traffic Signal AI', emoji: '🚦', nextId: 'project_traffic' },
      { label: 'Doc Summarizer', emoji: '📄', nextId: 'project_summarizer' },
      { label: 'Medical Imaging', emoji: '🏥', nextId: 'project_medical' },
      { label: 'Agentic AI', emoji: '🤖', nextId: 'project_agentic' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  project_traffic: {
    id: 'project_traffic',
    message: '🚦 Smart Traffic Signal Optimization\n\nDQN-based adaptive traffic control.\n📊 35% less wait time, 28% better flow\n🛠 Python, RL, OpenAI Gym, SUMO',
    options: [
      { label: 'Doc Summarizer', emoji: '📄', nextId: 'project_summarizer' },
      { label: 'Medical Imaging', emoji: '🏥', nextId: 'project_medical' },
      { label: '← Projects', emoji: '🚀', nextId: 'projects' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  project_summarizer: {
    id: 'project_summarizer',
    message: '📄 Document Summarizer\n\nFine-tuned BART with prompt engineering.\n📊 ROUGE-L 0.42, 85% satisfaction\n🛠 Python, Transformers, LangChain',
    options: [
      { label: 'Traffic Signal AI', emoji: '🚦', nextId: 'project_traffic' },
      { label: 'Agentic AI', emoji: '🤖', nextId: 'project_agentic' },
      { label: '← Projects', emoji: '🚀', nextId: 'projects' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  project_medical: {
    id: 'project_medical',
    message: '🏥 Medical Image Segmentation\n\nU-Net with attention for CT scan tumors.\n📊 Dice 0.89, IoU 0.84\n🛠 Python, PyTorch, OpenCV',
    options: [
      { label: 'Doc Summarizer', emoji: '📄', nextId: 'project_summarizer' },
      { label: 'Agentic AI', emoji: '🤖', nextId: 'project_agentic' },
      { label: '← Projects', emoji: '🚀', nextId: 'projects' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  project_agentic: {
    id: 'project_agentic',
    message: '🤖 Agentic Workflow Orchestrator\n\nAutonomous agent with tool-calling & multi-step reasoning.\n📊 78% success on complex tasks\n🛠 Python, LangChain, GPT-4, LangGraph',
    options: [
      { label: 'Traffic Signal AI', emoji: '🚦', nextId: 'project_traffic' },
      { label: 'Medical Imaging', emoji: '🏥', nextId: 'project_medical' },
      { label: '← Projects', emoji: '🚀', nextId: 'projects' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  certifications: {
    id: 'certifications',
    message: "📜 Professional certifications from Coursera, AWS, Hugging Face & Stanford. Plus 15+ badges from GitHub, LeetCode & Google.",
    options: [
      { label: 'Deep Learning', emoji: '🧠', nextId: 'cert_dl' },
      { label: 'AWS ML', emoji: '☁️', nextId: 'cert_aws' },
      { label: 'NLP', emoji: '💬', nextId: 'cert_nlp' },
      { label: 'Reinforcement Learning', emoji: '🎮', nextId: 'cert_rl' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  cert_dl: {
    id: 'cert_dl',
    message: '🧠 Deep Learning Specialization\n• Coursera (Andrew Ng)\n• Aug 2023\n• Neural Networks, CNNs, RNNs, Sequence Models',
    options: [
      { label: 'AWS ML', emoji: '☁️', nextId: 'cert_aws' },
      { label: 'NLP', emoji: '💬', nextId: 'cert_nlp' },
      { label: '← Certs', emoji: '📜', nextId: 'certifications' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  cert_aws: {
    id: 'cert_aws',
    message: '☁️ AWS Certified Machine Learning\n• Amazon Web Services\n• Feb 2024\n• Data Engineering, Modeling, ML Ops on AWS',
    options: [
      { label: 'Deep Learning', emoji: '🧠', nextId: 'cert_dl' },
      { label: 'Reinforcement Learning', emoji: '🎮', nextId: 'cert_rl' },
      { label: '← Certs', emoji: '📜', nextId: 'certifications' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  cert_nlp: {
    id: 'cert_nlp',
    message: '💬 Advanced NLP with Transformers\n• Hugging Face\n• May 2024\n• BERT, GPT, Prompt Engineering, RAG',
    options: [
      { label: 'Deep Learning', emoji: '🧠', nextId: 'cert_dl' },
      { label: 'Reinforcement Learning', emoji: '🎮', nextId: 'cert_rl' },
      { label: '← Certs', emoji: '📜', nextId: 'certifications' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  cert_rl: {
    id: 'cert_rl',
    message: '🎮 Reinforcement Learning\n• Stanford Online\n• Dec 2023\n• MDP, Q-Learning, Policy Gradients, Deep RL',
    options: [
      { label: 'AWS ML', emoji: '☁️', nextId: 'cert_aws' },
      { label: 'NLP', emoji: '💬', nextId: 'cert_nlp' },
      { label: '← Certs', emoji: '📜', nextId: 'certifications' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  hackathons: {
    id: 'hackathons',
    message: "🏆 5+ national & international hackathons — national finals and multiple wins!",
    options: [
      { label: 'Smart India', emoji: '🇮🇳', nextId: 'hack_sih' },
      { label: 'IBM Datathon', emoji: '📊', nextId: 'hack_ibm' },
      { label: 'Google Challenge', emoji: '🌍', nextId: 'hack_google' },
      { label: 'Microsoft Cup', emoji: '💡', nextId: 'hack_microsoft' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  hack_sih: {
    id: 'hack_sih',
    message: '🇮🇳 Smart India Hackathon 2024\n• Team Lead — 5 members\n• AI-powered infrastructure monitoring\n• 🏅 1st Place — National Finals!',
    options: [
      { label: 'IBM Datathon', emoji: '📊', nextId: 'hack_ibm' },
      { label: 'Google Challenge', emoji: '🌍', nextId: 'hack_google' },
      { label: '← Hackathons', emoji: '🏆', nextId: 'hackathons' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  hack_ibm: {
    id: 'hack_ibm',
    message: '📊 IBM Datathon 2023\n• Data Scientist\n• Customer churn prediction — 87% accuracy\n• 🏅 Top 15 / 200+ teams',
    options: [
      { label: 'Smart India', emoji: '🇮🇳', nextId: 'hack_sih' },
      { label: 'Google Challenge', emoji: '🌍', nextId: 'hack_google' },
      { label: '← Hackathons', emoji: '🏆', nextId: 'hackathons' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  hack_google: {
    id: 'hack_google',
    message: '🌍 Google Solution Challenge 2024\n• Full Stack Developer\n• Carbon footprint tracking app with ML\n• 🏅 3rd Place — Regional',
    options: [
      { label: 'Microsoft Cup', emoji: '💡', nextId: 'hack_microsoft' },
      { label: 'IBM Datathon', emoji: '📊', nextId: 'hack_ibm' },
      { label: '← Hackathons', emoji: '🏆', nextId: 'hackathons' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  hack_microsoft: {
    id: 'hack_microsoft',
    message: '💡 Microsoft Imagine Cup 2023\n• Backend Developer\n• Accessibility tool for visually impaired\n• Regional recognition for innovation',
    options: [
      { label: 'Smart India', emoji: '🇮🇳', nextId: 'hack_sih' },
      { label: 'Google Challenge', emoji: '🌍', nextId: 'hack_google' },
      { label: '← Hackathons', emoji: '🏆', nextId: 'hackathons' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  contact: {
    id: 'contact',
    message: "📬 Open to collaborations, internships & AI/ML opportunities! Reach me here:",
    options: [
      { label: 'Email', emoji: '✉️', nextId: 'contact_email' },
      { label: 'GitHub', emoji: '🐙', nextId: 'contact_github' },
      { label: 'LinkedIn', emoji: '💼', nextId: 'contact_linkedin' },
      { label: 'LeetCode', emoji: '🧩', nextId: 'contact_leetcode' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  contact_email: {
    id: 'contact_email',
    message: '✉️ paul.shervin@example.com\nI usually respond within 24 hours!',
    options: [
      { label: 'GitHub', emoji: '🐙', nextId: 'contact_github' },
      { label: 'LinkedIn', emoji: '💼', nextId: 'contact_linkedin' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  contact_github: {
    id: 'contact_github',
    message: '🐙 github.com/paulshervin\nAll my AI/ML projects & open-source work!',
    options: [
      { label: 'LinkedIn', emoji: '💼', nextId: 'contact_linkedin' },
      { label: 'LeetCode', emoji: '🧩', nextId: 'contact_leetcode' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  contact_linkedin: {
    id: 'contact_linkedin',
    message: "💼 linkedin.com/in/paulshervin\nLet's connect professionally!",
    options: [
      { label: 'Email', emoji: '✉️', nextId: 'contact_email' },
      { label: 'GitHub', emoji: '🐙', nextId: 'contact_github' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
  contact_leetcode: {
    id: 'contact_leetcode',
    message: '🧩 leetcode.com/u/paulshervinp/\n\n📊 247+ Solved • ⭐ 1654 Rating • 🔥 42 Day Streak',
    options: [
      { label: 'Email', emoji: '✉️', nextId: 'contact_email' },
      { label: 'LinkedIn', emoji: '💼', nextId: 'contact_linkedin' },
      { label: '← Menu', emoji: '🏠', nextId: 'root' },
    ],
  },
};

/* ─── Chat message type ─── */
interface ChatMessage {
  id: number;
  type: 'bot' | 'user';
  text: string;
}

/* ─── Floating Chat Widget ─── */
export const ShervinAI = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, type: 'bot', text: chatTree.root.message },
  ]);
  const [currentNode, setCurrentNode] = useState<ChatNode>(chatTree.root);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgCounter = useRef(1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleOptionClick = (option: { label: string; nextId: string }) => {
    const userMsg: ChatMessage = {
      id: msgCounter.current++,
      type: 'user',
      text: option.label,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const nextNode = chatTree[option.nextId];
      if (nextNode) {
        const botMsg: ChatMessage = {
          id: msgCounter.current++,
          type: 'bot',
          text: nextNode.message,
        };
        setMessages((prev) => [...prev, botMsg]);
        setCurrentNode(nextNode);
      }
      setIsTyping(false);
    }, 500 + Math.random() * 300);
  };

  const handleReset = () => {
    msgCounter.current = 1;
    setMessages([{ id: 0, type: 'bot', text: chatTree.root.message }]);
    setCurrentNode(chatTree.root);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-24 left-5 z-[200] w-[320px] h-[440px] flex flex-col
            rounded-[20px] overflow-hidden
            bg-[hsl(var(--card))] border border-border/50
            shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.08)]"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-[hsl(var(--card))]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <img src={portrait} alt="Paul Shervin" className="w-full h-full object-cover rounded-full" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[hsl(var(--card))] rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight">🤖 Shervin AI</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Choose what you'd like to know
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleReset}
                className="px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'bot' && (
                  <div className="shrink-0 w-6 h-6 rounded-full overflow-hidden mt-0.5">
                    <img src={portrait} alt="Paul Shervin" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3 py-2 text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                      : 'bg-muted/30 text-foreground border border-border/20 rounded-2xl rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.type === 'user' && (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 items-start"
              >
                <div className="shrink-0 w-6 h-6 rounded-full overflow-hidden">
                  <img src={portrait} alt="Paul Shervin" className="w-full h-full object-cover" />
                </div>
                <div className="bg-muted/30 border border-border/20 rounded-2xl rounded-bl-sm px-3 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Options ── */}
          {!isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-border/40 px-3 py-2.5 bg-[hsl(var(--card))]"
            >
              <div className="flex flex-wrap gap-1.5">
                {currentNode.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleOptionClick(opt)}
                    className="px-2.5 py-1.5 rounded-lg text-[12px] font-medium
                      bg-background border border-border/50
                      text-foreground/75 hover:text-foreground
                      hover:border-primary/40 hover:bg-primary/5
                      active:scale-95
                      transition-all duration-150"
                  >
                    <span className="mr-1">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Floating launcher button ─── */
export const ShervinAIBubble = ({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) => {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-6 left-5 z-[199] w-[60px] h-[60px] rounded-full
        bg-gradient-to-br from-primary to-accent
        text-primary-foreground
        shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.45)]
        hover:shadow-[0_6px_28px_-4px_hsl(var(--primary)/0.55)]
        flex items-center justify-center
        transition-shadow duration-300
        cursor-pointer"
      aria-label={isOpen ? 'Close Shervin AI' : 'Open Shervin AI'}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="bot"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full rounded-full overflow-hidden"
          >
            <img src={portrait} alt="Paul Shervin" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle ping — only when closed */}
      {!isOpen && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-25 pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[hsl(var(--background))] rounded-full z-10 animate-pulse" />
        </>
      )}
    </motion.button>
  );
};

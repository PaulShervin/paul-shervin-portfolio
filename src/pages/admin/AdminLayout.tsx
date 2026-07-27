import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { publishChanges } from '../../lib/firebaseHelpers';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { 
  LayoutDashboard, 
  FolderGit, 
  Wrench, 
  Trophy, 
  Award, 
  Terminal, 
  UserCircle, 
  Image, 
  LogOut, 
  Globe, 
  CloudUpload,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);

  // Fetch publish metadata
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'metadata', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastPublished) {
          setLastPublished(new Date(data.lastPublished).toLocaleString());
        }
      }
    });
    return () => unsub();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const timestamp = await publishChanges();
      setLastPublished(new Date(timestamp).toLocaleString());
      toast.success('Successfully published all changes to the live portfolio!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to publish changes. Check your console log.');
    } finally {
      setIsPublishing(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Projects', path: '/admin/projects', icon: FolderGit },
    { name: 'Skills', path: '/admin/skills', icon: Wrench },
    { name: 'Achievements', path: '/admin/achievements', icon: Trophy },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Hackathons', path: '/admin/hackathons', icon: Terminal },
    { name: 'Profile', path: '/admin/profile', icon: UserCircle },
    { name: 'Media Manager', path: '/admin/media', icon: Image },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (e) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(75_20%_95%)] flex text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border/70 p-5 space-y-6">
        <div className="flex items-center gap-2 px-2 py-1 select-none">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold tracking-tight text-lg">Paul's Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header bar */}
        <header className="bg-card border-b border-border/60 px-6 py-4 flex items-center justify-between gap-4 relative z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight hidden sm:block">Portfolio Console</h1>
              {lastPublished && (
                <p className="text-[10px] text-muted-foreground">Last Published: {lastPublished}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/', '_blank')}
              className="text-xs text-muted-foreground hover:text-foreground hidden md:flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" /> View Live Site
            </Button>

            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-4 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <CloudUpload className={`w-4 h-4 ${isPublishing ? 'animate-bounce' : ''}`} />
              {isPublishing ? 'Publishing...' : 'Publish Changes'}
            </Button>
          </div>
        </header>

        {/* Content view */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer body */}
          <div className="relative flex flex-col w-64 max-w-[80%] bg-card p-5 h-full z-10 border-r border-border animate-in slide-in-from-left duration-250">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-bold tracking-tight text-md">Admin Panel</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;

import { Egg, Fence, LogOut, LayoutDashboard, Menu, X, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile, user } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Poultry', icon: Egg, path: '/poultry' },
    { label: 'Livestock', icon: Fence, path: '/livestock' },
    { label: 'My Profile', icon: UserIcon, path: '/profile' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between gap-3 px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
            <Egg className="h-5 w-5" />
          </div>
          <span className="text-base font-bold truncate">OurFarmKenya</span>
        </div>
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 hover:bg-sidebar-accent/50"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent/50 transition-colors text-left"
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? 'avatar'} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {profile?.full_name || 'Farmer'}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>
        </button>
        {!isInstalled && (
          <button
            onClick={() => navigate('/install')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <Download className="h-5 w-5" />
            Install app
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-md p-1 hover:bg-sidebar-accent/50"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Egg className="h-5 w-5" />
              <span className="font-bold">OurFarmKenya</span>
            </div>
          </div>
          <button onClick={() => navigate('/profile')} aria-label="Open profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? 'avatar'} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </header>

        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {sidebarContent}
    </aside>
  );
};

export default AppSidebar;

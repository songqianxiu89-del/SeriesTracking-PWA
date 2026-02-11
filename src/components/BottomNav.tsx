import { Home, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on detail pages
  if (location.pathname.startsWith('/show/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 glass-header safe-area-pb">
      <div className="flex h-12 items-center justify-around">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-6 py-1.5 text-[10px] font-medium transition-all duration-200 press-effect rounded-lg',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-transform duration-200', active && 'scale-110')} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getShows } from '@/lib/storage';
import { Show } from '@/types/show';
import ShowCard from '@/components/ShowCard';
import AddShowDialog from '@/components/AddShowDialog';

const Index = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState<Show[]>(() => getShows());
  const [addOpen, setAddOpen] = useState(false);
  const [finishedOpen, setFinishedOpen] = useState(false);

  const refresh = useCallback(() => setShows(getShows()), []);

  const watching = shows
    .filter(s => s.status === 'watching')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const finished = shows
    .filter(s => s.status === 'finished')
    .sort((a, b) => new Date(b.finishedAt || b.createdAt).getTime() - new Date(a.finishedAt || a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/80 glass-header safe-area-pt">
        <div className="flex h-12 items-center justify-between px-4">
          <h1 className="text-lg font-bold tracking-tight text-foreground">追剧记录</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setAddOpen(true)}
            className="press-effect rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 p-4">
        {/* Watching */}
        <section className="animate-fade-in-up">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            正在看
            <Badge variant="secondary" className="text-xs font-medium">{watching.length}</Badge>
          </h2>
          {watching.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              还没有正在追的剧，点击右上角 + 添加
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {watching.map(show => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </section>

        {/* Finished */}
        {finished.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => setFinishedOpen(!finishedOpen)}
              className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest press-effect"
            >
              <span className="transition-transform duration-200" style={{ transform: finishedOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                <ChevronDown className="h-4 w-4" />
              </span>
              已追完
              <Badge variant="secondary" className="text-xs font-medium">{finished.length}</Badge>
            </button>
            {finishedOpen && (
              <div className="space-y-2 stagger-children">
                {finished.map(show => (
                  <div
                    key={show.id}
                    onClick={() => navigate(`/show/${show.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border bg-card p-3 transition-all duration-200 press-effect"
                  >
                    <div className="flex items-center gap-3">
                      {show.coverImage ? (
                        <img src={show.coverImage} alt={show.name} className="h-10 w-7 rounded-md object-cover" />
                      ) : null}
                      <div>
                        <p className="font-medium text-card-foreground">{show.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {show.finishedAt ? new Date(show.finishedAt).toLocaleDateString('zh-CN') : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {show.tags.slice(0, 2).map(t => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <AddShowDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={refresh}
        existingShowsCount={watching.length}
      />
    </div>
  );
};

export default Index;

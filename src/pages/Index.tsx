import { useState, useCallback } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getShows } from '@/lib/storage';
import { Show } from '@/types/show';
import ShowCard from '@/components/ShowCard';
import AddShowDialog from '@/components/AddShowDialog';

const Index = () => {
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
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-12 items-center justify-between px-4">
          <h1 className="text-lg font-bold text-foreground">追剧记录</h1>
          <Button size="icon" variant="ghost" onClick={() => setAddOpen(true)}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 p-4">
        {/* Watching */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            正在看
            <Badge variant="secondary" className="text-xs">{watching.length}</Badge>
          </h2>
          {watching.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              还没有正在追的剧，点击右上角 + 添加
            </div>
          ) : (
            <div className="space-y-2">
              {watching.map(show => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </section>

        {/* Finished */}
        {finished.length > 0 && (
          <section>
            <button
              onClick={() => setFinishedOpen(!finishedOpen)}
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide"
            >
              {finishedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              已追完
              <Badge variant="secondary" className="text-xs">{finished.length}</Badge>
            </button>
            {finishedOpen && (
              <div className="space-y-2">
                {finished.map(show => (
                  <div
                    key={show.id}
                    onClick={() => window.location.href = `/show/${show.id}`}
                    className="flex cursor-pointer items-center justify-between rounded-lg border bg-card p-3 transition-colors active:bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      {show.coverImage ? (
                        <img src={show.coverImage} alt={show.name} className="h-10 w-7 rounded object-cover" />
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

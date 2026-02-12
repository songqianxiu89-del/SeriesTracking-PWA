import { Show } from '@/types/show';
import { Badge } from '@/components/ui/badge';
import { Film, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  show: Show;
  isDraggable?: boolean;
}

export default function ShowCard({ show, isDraggable = false }: Props) {
  const navigate = useNavigate();
  const progress = `S${show.currentSeason}E${show.currentEpisode}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: show.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => navigate(`/show/${show.id}`)}
      className="flex cursor-pointer gap-3 rounded-xl border bg-card p-3 transition-colors duration-200 press-effect"
    >
      {/* Drag handle */}
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-shrink-0 items-center touch-none text-muted-foreground/50"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}
      {/* Cover */}
      <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {show.coverImage ? (
          <img src={show.coverImage} alt={show.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Film className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between overflow-hidden py-0.5">
        <div>
          <h3 className="truncate font-semibold text-card-foreground">{show.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {progress}
            {show.totalEpisodes > 0 && ` / ${show.totalEpisodes}集`}
            <span className="mx-1.5 text-border">·</span>
            {show.platform}
          </p>
        </div>
        {show.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {show.tags.slice(0, 3).map(t => (
              <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {show.totalEpisodes > 0 && (
        <div className="flex flex-shrink-0 items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20">
            <span className="text-xs font-semibold text-primary">
              {Math.round((show.currentEpisode / show.totalEpisodes) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

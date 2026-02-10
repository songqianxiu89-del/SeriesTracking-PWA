import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CheckCircle, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getShowById, updateShow, deleteShow, getNotesByShowId, addNote, updateNote, deleteNote, generateId, fileToBase64 } from '@/lib/storage';
import { Show, Note } from '@/types/show';
import { toast } from '@/hooks/use-toast';

export default function ShowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [show, setShow] = useState<Show | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [progressDialog, setProgressDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>();

  // Progress form
  const [newSeason, setNewSeason] = useState('');
  const [newEpisode, setNewEpisode] = useState('');

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteKeywords, setNoteKeywords] = useState('');
  const [noteHighlights, setNoteHighlights] = useState('');
  const [noteImages, setNoteImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const s = getShowById(id);
    if (s) {
      setShow(s);
      setNotes(getNotesByShowId(id));
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!show) return null;

  const progressPercent = show.totalEpisodes > 0
    ? Math.round((show.currentEpisode / show.totalEpisodes) * 100) : 0;

  const refreshData = () => {
    setShow(getShowById(show.id) || null);
    setNotes(getNotesByShowId(show.id));
  };

  const handleUpdateProgress = () => {
    const s = parseInt(newSeason) || show.currentSeason;
    const e = parseInt(newEpisode) || show.currentEpisode;
    updateShow(show.id, { currentSeason: s, currentEpisode: e });
    setProgressDialog(false);
    refreshData();
    toast({ title: '进度已更新' });
  };

  const handleMarkFinished = () => {
    updateShow(show.id, { status: 'finished', finishedAt: new Date().toISOString() });
    refreshData();
    toast({ title: '已标记为追完' });
  };

  const handleDeleteShow = () => {
    deleteShow(show.id);
    navigate('/');
    toast({ title: '已删除' });
  };

  const handleNoteImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const base64 = await fileToBase64(file);
      setNoteImages(prev => [...prev, base64]);
    }
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;
    const progressSnapshot = `S${show.currentSeason}E${show.currentEpisode}`;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: noteTitle,
        content: noteContent,
        keywords: noteKeywords.split(',').map(k => k.trim()).filter(Boolean),
        highlights: noteHighlights.split(',').map(h => h.trim()).filter(Boolean),
        images: noteImages,
      });
    } else {
      addNote({
        id: generateId(),
        showId: show.id,
        title: noteTitle,
        content: noteContent,
        keywords: noteKeywords.split(',').map(k => k.trim()).filter(Boolean),
        highlights: noteHighlights.split(',').map(h => h.trim()).filter(Boolean),
        images: noteImages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progressSnapshot,
      });
    }
    resetNoteForm();
    setNoteDialog(false);
    refreshData();
    toast({ title: editingNote ? '笔记已更新' : '笔记已添加' });
  };

  const resetNoteForm = () => {
    setNoteTitle(''); setNoteContent(''); setNoteKeywords(''); setNoteHighlights(''); setNoteImages([]); setEditingNote(null);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteKeywords(note.keywords.join(', '));
    setNoteHighlights(note.highlights.join(', '));
    setNoteImages(note.images || []);
    setNoteDialog(true);
  };

  const noteDates = notes.map(n => new Date(n.createdAt).toDateString());
  const selectedDateNotes = calendarDate
    ? notes.filter(n => new Date(n.createdAt).toDateString() === calendarDate.toDateString())
    : [];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="flex-1 truncate font-bold text-foreground">{show.name}</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                <AlertDialogDescription>删除后将无法恢复该作品及相关笔记。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteShow}>删除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4">
        {/* Info Card */}
        <Card>
          <CardContent className="flex gap-4 p-4">
            {show.coverImage ? (
              <img src={show.coverImage} alt={show.name} className="h-28 w-20 rounded-lg object-cover" />
            ) : (
              <div className="flex h-28 w-20 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs">无封面</div>
            )}
            <div className="flex-1 space-y-1.5">
              <h2 className="text-lg font-bold text-card-foreground">{show.name}</h2>
              <p className="text-sm text-muted-foreground">{show.type} · {show.platform}</p>
              <Badge variant={show.status === 'watching' ? 'default' : 'secondary'}>
                {show.status === 'watching' ? '正在看' : '已追完'}
              </Badge>
              <div className="flex flex-wrap gap-1 pt-1">
                {show.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">当前进度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold text-foreground">
              S{show.currentSeason}E{show.currentEpisode}
              {show.totalEpisodes > 0 && <span className="text-sm font-normal text-muted-foreground"> / {show.totalEpisodes}集</span>}
            </div>
            {show.totalEpisodes > 0 && <Progress value={progressPercent} className="h-2" />}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setNewSeason(String(show.currentSeason)); setNewEpisode(String(show.currentEpisode)); setProgressDialog(true); }}>
                <Edit className="mr-1 h-3 w-3" /> 更新进度
              </Button>
              {show.status === 'watching' && (
                <Button size="sm" variant="secondary" onClick={handleMarkFinished}>
                  <CheckCircle className="mr-1 h-3 w-3" /> 标记已追完
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">笔记</CardTitle>
              <Button size="sm" variant="outline" onClick={() => { resetNoteForm(); setNoteDialog(true); }}>
                + 新笔记
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无笔记</p>
            ) : (
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="rounded-md border p-3 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">{note.title || '无标题'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString('zh-CN')} · {note.progressSnapshot}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditNote(note)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { deleteNote(note.id); refreshData(); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {note.content && <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>}
                    {note.images && note.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {note.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="h-20 rounded-md object-cover" />
                        ))}
                      </div>
                    )}
                    {note.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.keywords.map(k => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">日历视图</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={setCalendarDate}
              modifiers={{ hasNote: (date) => noteDates.includes(date.toDateString()) }}
              modifiersStyles={{ hasNote: { fontWeight: 'bold', textDecoration: 'underline', color: 'hsl(var(--primary))' } }}
              className="mx-auto"
            />
            {selectedDateNotes.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedDateNotes.map(note => (
                  <div key={note.id} className="rounded-md border p-2">
                    <p className="text-sm font-medium">{note.title || '无标题'}</p>
                    <p className="text-xs text-muted-foreground">{note.progressSnapshot}</p>
                    {note.content && <p className="text-xs mt-1">{note.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Update Progress Dialog */}
      <Dialog open={progressDialog} onOpenChange={setProgressDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>更新进度</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>季</Label>
              <Input type="number" min="1" value={newSeason} onChange={e => setNewSeason(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>集</Label>
              <Input type="number" min="1" value={newEpisode} onChange={e => setNewEpisode(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleUpdateProgress} className="w-full">确认更新</Button>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader><DialogTitle>{editingNote ? '编辑笔记' : '添加笔记'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>标题</Label>
              <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="笔记标题" />
            </div>
            <div className="space-y-1.5">
              <Label>正文</Label>
              <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="写下你的想法..." rows={4} />
            </div>
            <div className="space-y-1.5">
              <Label>关键词（逗号分隔）</Label>
              <Input value={noteKeywords} onChange={e => setNoteKeywords(e.target.value)} placeholder="如: 剧情转折, 角色发展" />
            </div>
            <div className="space-y-1.5">
              <Label>场景亮点（逗号分隔）</Label>
              <Input value={noteHighlights} onChange={e => setNoteHighlights(e.target.value)} placeholder="如: 开头追逐戏, 结局反转" />
            </div>
            {/* Images */}
            <div className="space-y-1.5">
              <Label>插入图片</Label>
              <div className="flex flex-wrap gap-2">
                {noteImages.map((img, i) => (
                  <div key={i} className="relative h-16 w-16">
                    <img src={img} alt="" className="h-full w-full rounded-md object-cover" />
                    <button onClick={() => setNoteImages(noteImages.filter((_, j) => j !== i))} className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50">
                  <ImagePlus className="h-5 w-5" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleNoteImageUpload} />
                </label>
              </div>
            </div>
            <Button onClick={handleSaveNote} className="w-full">保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

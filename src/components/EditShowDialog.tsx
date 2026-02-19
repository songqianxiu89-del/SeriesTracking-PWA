import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, X } from 'lucide-react';
import StoredImage from '@/components/StoredImage';
import { DEFAULT_TYPES, DEFAULT_PLATFORMS, Show } from '@/types/show';
import { updateShow, addTags, fileToBase64 } from '@/lib/storage';

interface Props {
  show: Show | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export default function EditShowDialog({ show, open, onOpenChange, onSaved }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [customType, setCustomType] = useState('');
  const [platform, setPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [totalEpisodes, setTotalEpisodes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');

  useEffect(() => {
    if (show && open) {
      setName(show.name);
      const isDefaultType = DEFAULT_TYPES.includes(show.type);
      setType(isDefaultType ? show.type : '__custom');
      setCustomType(isDefaultType ? '' : show.type);
      const isDefaultPlatform = DEFAULT_PLATFORMS.includes(show.platform);
      setPlatform(isDefaultPlatform ? show.platform : '__custom');
      setCustomPlatform(isDefaultPlatform ? '' : show.platform);
      setSeason(String(show.currentSeason));
      setEpisode(String(show.currentEpisode));
      setTotalEpisodes(String(show.totalEpisodes || ''));
      setTags([...show.tags]);
      setCoverImage(show.coverImage || '');
      setTagInput('');
    }
  }, [show, open]);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setCoverImage(base64);
    }
  };

  const handleSubmit = () => {
    if (!show || !name.trim()) return;
    const finalType = type === '__custom' ? customType : type;
    const finalPlatform = platform === '__custom' ? customPlatform : platform;

    updateShow(show.id, {
      name: name.trim(),
      type: finalType || '其他',
      platform: finalPlatform || '其他',
      currentSeason: parseInt(season) || 1,
      currentEpisode: parseInt(episode) || 1,
      totalEpisodes: parseInt(totalEpisodes) || 0,
      tags,
      coverImage,
    });

    if (tags.length) addTags(tags);
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑作品信息</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>作品名称 *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="输入剧名" />
          </div>

          <div className="space-y-1.5">
            <Label>封面图</Label>
            <div className="flex items-center gap-3">
              {coverImage ? (
                <div className="relative h-20 w-14 overflow-hidden rounded-md">
                  <StoredImage src={coverImage} alt="cover" className="h-full w-full object-cover" />
                  <button onClick={() => setCoverImage('')} className="absolute right-0 top-0 rounded-bl bg-background/80 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-14 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50">
                  <ImagePlus className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>类型</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
              <SelectContent>
                {DEFAULT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                <SelectItem value="__custom">自定义...</SelectItem>
              </SelectContent>
            </Select>
            {type === '__custom' && <Input value={customType} onChange={e => setCustomType(e.target.value)} placeholder="输入自定义类型" className="mt-1.5" />}
          </div>

          <div className="space-y-1.5">
            <Label>平台</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue placeholder="选择平台" /></SelectTrigger>
              <SelectContent>
                {DEFAULT_PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                <SelectItem value="__custom">自定义...</SelectItem>
              </SelectContent>
            </Select>
            {platform === '__custom' && <Input value={customPlatform} onChange={e => setCustomPlatform(e.target.value)} placeholder="输入自定义平台" className="mt-1.5" />}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label>季</Label>
              <Input type="number" min="1" value={season} onChange={e => setSeason(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>集</Label>
              <Input type="number" min="1" value={episode} onChange={e => setEpisode(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>总集数</Label>
              <Input type="number" min="0" value={totalEpisodes} onChange={e => setTotalEpisodes(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>标签</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="输入标签后按回车"
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>添加</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => setTags(tags.filter(x => x !== t))}>
                    {t} <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!name.trim()}>保存修改</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

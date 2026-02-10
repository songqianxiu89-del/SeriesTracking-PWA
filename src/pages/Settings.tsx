import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Trash2, X } from 'lucide-react';
import { exportAllData, importAllData, getTags, saveTags, getSettings, saveSettings, getShows } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const [settings, setSettings] = useState(() => getSettings());
  const [tags, setTagsList] = useState(() => getTags());

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackshow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '备份成功', description: '数据已导出为JSON文件' });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        importAllData(text);
        setTagsList(getTags());
        setSettings(getSettings());
        toast({ title: '导入成功', description: '数据已恢复' });
      } catch {
        toast({ title: '导入失败', description: '文件格式不正确', variant: 'destructive' });
      }
    };
    input.click();
  };

  const handleCleanup = () => {
    // Already handled by deleteShow removing notes, just refresh tags
    const shows = getShows();
    const usedTags = new Set(shows.flatMap(s => s.tags));
    const cleaned = tags.filter(t => usedTags.has(t));
    saveTags(cleaned);
    setTagsList(cleaned);
    toast({ title: '清理完成', description: '未使用的标签已清除' });
  };

  const handleDeleteTag = (tag: string) => {
    const updated = tags.filter(t => t !== tag);
    saveTags(updated);
    setTagsList(updated);
  };

  const toggleReminders = (enabled: boolean) => {
    const newSettings = { ...settings, enableReminders: enabled };
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex h-12 items-center px-4">
          <h1 className="text-lg font-bold text-foreground">设置</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4">
        {/* Backup */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">数据管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleExport} variant="outline" className="w-full justify-start gap-2">
              <Download className="h-4 w-4" /> 导出备份 (JSON)
            </Button>
            <Button onClick={handleImport} variant="outline" className="w-full justify-start gap-2">
              <Upload className="h-4 w-4" /> 导入备份
            </Button>
            <Button onClick={handleCleanup} variant="outline" className="w-full justify-start gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> 清理无用数据
            </Button>
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">更新提醒</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>开启进度更新提醒</Label>
              <Switch checked={settings.enableReminders} onCheckedChange={toggleReminders} />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">标签管理</CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无标签</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="cursor-pointer gap-1" onClick={() => handleDeleteTag(t)}>
                    {t} <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

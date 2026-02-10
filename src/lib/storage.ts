import { Show, Note, AppSettings } from '@/types/show';

const KEYS = {
  shows: 'trackshow_shows',
  notes: 'trackshow_notes',
  tags: 'trackshow_tags',
  settings: 'trackshow_settings',
};

// Shows
export function getShows(): Show[] {
  const raw = localStorage.getItem(KEYS.shows);
  return raw ? JSON.parse(raw) : [];
}

export function saveShows(shows: Show[]) {
  localStorage.setItem(KEYS.shows, JSON.stringify(shows));
}

export function addShow(show: Show) {
  const shows = getShows();
  shows.push(show);
  saveShows(shows);
}

export function updateShow(id: string, updates: Partial<Show>) {
  const shows = getShows().map(s => s.id === id ? { ...s, ...updates } : s);
  saveShows(shows);
}

export function deleteShow(id: string) {
  saveShows(getShows().filter(s => s.id !== id));
  // Also delete related notes
  saveNotes(getNotes().filter(n => n.showId !== id));
}

export function getShowById(id: string): Show | undefined {
  return getShows().find(s => s.id === id);
}

// Notes
export function getNotes(): Note[] {
  const raw = localStorage.getItem(KEYS.notes);
  return raw ? JSON.parse(raw) : [];
}

export function saveNotes(notes: Note[]) {
  localStorage.setItem(KEYS.notes, JSON.stringify(notes));
}

export function getNotesByShowId(showId: string): Note[] {
  return getNotes().filter(n => n.showId === showId).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addNote(note: Note) {
  const notes = getNotes();
  notes.push(note);
  saveNotes(notes);
}

export function updateNote(id: string, updates: Partial<Note>) {
  const notes = getNotes().map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n);
  saveNotes(notes);
}

export function deleteNote(id: string) {
  saveNotes(getNotes().filter(n => n.id !== id));
}

// Tags
export function getTags(): string[] {
  const raw = localStorage.getItem(KEYS.tags);
  return raw ? JSON.parse(raw) : [];
}

export function saveTags(tags: string[]) {
  localStorage.setItem(KEYS.tags, JSON.stringify([...new Set(tags)]));
}

export function addTags(newTags: string[]) {
  const tags = getTags();
  saveTags([...tags, ...newTags]);
}

// Settings
export function getSettings(): AppSettings {
  const raw = localStorage.getItem(KEYS.settings);
  return raw ? JSON.parse(raw) : { enableReminders: false };
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

// Backup / Restore
export function exportAllData(): string {
  return JSON.stringify({
    shows: getShows(),
    notes: getNotes(),
    tags: getTags(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function importAllData(json: string) {
  const data = JSON.parse(json);
  if (data.shows) saveShows(data.shows);
  if (data.notes) saveNotes(data.notes);
  if (data.tags) saveTags(data.tags);
  if (data.settings) saveSettings(data.settings);
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Image to Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

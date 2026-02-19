import { Show, Note, AppSettings } from '@/types/show';

const KEYS = {
  shows: 'trackshow_shows',
  notes: 'trackshow_notes',
  tags: 'trackshow_tags',
  settings: 'trackshow_settings',
};

const IMAGE_DB_NAME = 'trackshow_assets';
const IMAGE_STORE_NAME = 'images';
const IMAGE_REF_PREFIX = 'idbimg:';

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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('无法打开图片数据库'));
  });
}

async function saveImageBlob(blob: Blob): Promise<string> {
  const db = await openImageDb();
  const id = generateId();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE_NAME);
    const request = store.put(blob, id);

    request.onsuccess = () => resolve(`${IMAGE_REF_PREFIX}${id}`);
    request.onerror = () => reject(request.error || new Error('图片存储失败'));

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
    tx.onabort = () => db.close();
  });
}

async function getImageBlob(id: string): Promise<Blob | null> {
  const db = await openImageDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE_NAME, 'readonly');
    const store = tx.objectStore(IMAGE_STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve((request.result as Blob | undefined) || null);
    request.onerror = () => reject(request.error || new Error('图片读取失败'));

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
    tx.onabort = () => db.close();
  });
}

export function isIndexedImageRef(value: string): boolean {
  return value.startsWith(IMAGE_REF_PREFIX);
}

export async function resolveImageSource(value: string): Promise<string> {
  if (!value || !isIndexedImageRef(value)) return value;

  const id = value.slice(IMAGE_REF_PREFIX.length);
  try {
    const blob = await getImageBlob(id);
    return blob ? URL.createObjectURL(blob) : '';
  } catch {
    return '';
  }
}

// Image to storable string. Prefer IndexedDB for large/unlimited dimensions.
export async function fileToBase64(file: File): Promise<string> {
  try {
    return await saveImageBlob(file);
  } catch {
    return readFileAsDataUrl(file);
  }
}

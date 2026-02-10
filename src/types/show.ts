export interface Show {
  id: string;
  name: string;
  type: string;
  platform: string;
  currentSeason: number;
  currentEpisode: number;
  totalEpisodes: number;
  /** Optional time-based progress like "12:30" */
  timeProgress?: string;
  status: 'watching' | 'finished';
  tags: string[];
  coverImage?: string; // Base64
  createdAt: string;
  finishedAt?: string;
  sortOrder: number;
}

export interface Note {
  id: string;
  showId: string;
  title: string;
  content: string;
  keywords: string[];
  highlights: string[];
  /** Base64 images embedded in note */
  images: string[];
  createdAt: string;
  updatedAt: string;
  /** Progress snapshot when note was created */
  progressSnapshot: string;
}

export interface AppSettings {
  enableReminders: boolean;
}

export const DEFAULT_TYPES = ['电视剧', '电影', '日番', '动漫', '综艺', '纪录片'];
export const DEFAULT_PLATFORMS = ['Netflix', 'Disney+', 'B站', 'HBO Max', 'Apple TV+', '爱奇艺', '优酷', '腾讯视频', '网盘', '其他'];

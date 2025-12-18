
export type ServiceType = 'General' | 'Commercial';

export interface Ticket {
  id: string;
  number: string;
  customerName: string;
  service: ServiceType;
  status: 'waiting' | 'called' | 'completed';
  boxId?: number;
  timestamp: number;
}

export interface Slide {
  id: string;
  imageUrl: string;
  headline: string;
  lines: string[];
}

export interface RssFeedConfig {
  id: number;
  url: string;
  label: string;
  logoUrl: string;
  speed: number;
  active: boolean;
  backgroundColor: string;
  textColor: string;
}

export interface TickerLineConfig {
  id: number;
  text: string;
  active: boolean;
  backgroundColor: string;
  bgOpacity: number; // 0-100
  textColor: string;
  fontSize: 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl';
  speed: number; // seconds
}

export type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ClockConfig {
  visible: boolean;
  position: CornerPosition;
  showTime: boolean;
  showDate: boolean;
  textColor: string;
  backgroundColor: string;
  bgOpacity: number;
  fontFamily: 'Inter' | 'Roboto' | 'Lora' | 'Courier Prime';
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface PlaylistItem {
  url: string;
  duration: number; // seconds
}

export interface AppState {
  lastUpdated: number;
  tickets: Ticket[];
  tickerMode: 'scrolling' | 'slides' | 'rss';
  tickerLines: TickerLineConfig[];
  slides: Slide[];
  rssFeeds: RssFeedConfig[];
  clockConfig: ClockConfig;
  imagePlaylist: PlaylistItem[];
  displayMode: 'image' | 'map' | 'video';
  mapUrl?: string;
  videoPlaylist: PlaylistItem[];
  generatedContent?: string;
}

export enum AppView {
  HOME = 'HOME',
  DISPLAY = 'DISPLAY',
  REGISTRATION = 'REGISTRATION',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN'
}

export const MAX_BOXES = 8;

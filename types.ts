
export interface ProgramItem {
  id: string;
  time: string;
  title: string;
  speaker: string;
  description: string;
}

export type PosterTheme = 'modern' | 'classic' | 'minimal';

export interface PosterStyleSettings {
  backgroundBlur: number; // 0 to 20px
  backgroundDarkness: number; // 0 to 1
  contentOpacity: number; // 0 to 1
}

export interface PosterData {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  eventDescription: string;
  backgroundUrl: string;
  items: ProgramItem[];
  logos: string[];
  theme: PosterTheme;
  styleSettings: PosterStyleSettings;
  // New fields
  contactTitle: string;
  contactDetails: string;
  qrCodeUrl: string | null;
}

export enum AspectRatio {
  PORTRAIT = '3:4',
  LANDSCAPE = '4:3'
}
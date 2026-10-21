export type Scene = {
  id: string;
  title: string;
  image: string;
  caption: string;
  label: string;
  paragraphs: string[];
  gameAfter?: string;
};
export type Chapter = {
  id: string;
  title: string;
  subtitle: string;
  pages: string;
  year: string;
  scenes: Scene[];
};
export type AudioSegment = { file: string; start: number; end: number };
export type Progress = {
  chapter: string;
  scene: number;
  completedGames: string[];
  volume: number;
  positions: Record<string, number>;
  finishedChapters: string[];
  audioTimes: Record<string, number>;
  reducedMotion: boolean;
};

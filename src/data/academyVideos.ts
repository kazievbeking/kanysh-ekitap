export type VideoClip = { file: string; duration: number; poster: string };
const clip = (id: number, duration = 10): VideoClip => ({
  file: `video/academy/clip-${id}.mp4`,
  duration,
  poster: `video/academy/clip-${id}.jpg`,
});
export const academyVideos: Record<string, VideoClip[]> = {
  "academy-01": [clip(5, 9), clip(1)],
  "academy-02": [clip(2), clip(3)],
  "academy-03": [clip(4)],
  "academy-04": [clip(3), clip(5, 9)],
};
// Repeat only the visuals. Narration is never repeated or stretched.
export function videoFrame(clips: VideoClip[], elapsed: number) {
  const total = clips.reduce((sum, c) => sum + c.duration, 0);
  let time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0) % total;
  for (let index = 0; index < clips.length; index++) {
    if (time < clips[index].duration) return { index, time };
    time -= clips[index].duration;
  }
  return { index: 0, time: 0 };
}

const protectClip = (id: number, duration = 10): VideoClip => ({
  file: `video/protect/clip-${id}.mp4`,
  duration,
  poster: `video/protect/clip-${id}.jpg`,
});
export const protectVideos: Record<string, VideoClip[]> = {
  "protect-01": [protectClip(1)],
  "protect-02": [protectClip(2)],
  "protect-03": [protectClip(3)],
  "protect-04": [protectClip(4)],
  // The archive supplies a portrait of Mukhtar Auezov here, not Satbayev.
  // clip-5 is a deterministic camera move made from that portrait.
  "protect-05": [protectClip(5, 85)],
};
const fugitiveClip = (id: number): VideoClip => ({
  file: `video/fugitive/clip-${id}.mp4`,
  duration: 10,
  poster: `video/fugitive/clip-${id}.jpg`,
});
export const fugitiveVideos: Record<string, VideoClip[]> = {
  "fugitive-01": [fugitiveClip(1)],
  "fugitive-02": [fugitiveClip(2)],
  "fugitive-03": [fugitiveClip(3)],
  "fugitive-04": [fugitiveClip(4)],
  "fugitive-05": [fugitiveClip(5)],
};
export const sceneVideos = {
  ...academyVideos,
  ...protectVideos,
  ...fugitiveVideos,
};

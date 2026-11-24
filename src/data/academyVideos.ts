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

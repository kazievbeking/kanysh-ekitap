import { fugitiveHandPose } from "./fugitiveMotion";
import type { FilmShot } from "./storyboards";

// Coordinates are tied to the source illustrations, before cover cropping.
export function handPose(image: string, time: number) {
  if (image === "ceremony") {
    const gesture =
      Math.sin(time * 1.15) * 0.012 + Math.sin(time * 0.47) * 0.006;
    return {
      center: [0.432, 0.552],
      radius: [0.087, 0.166],
      pivot: [0.527, 0.661],
      angle: gesture,
      shift: [0, 0],
    };
  }
  if (image === "scholars") {
    const writing = Math.sin(time * 2.8) * Math.sin(time * 0.45);
    return {
      center: [0.298, 0.651],
      radius: [0.074, 0.082],
      pivot: [0.251, 0.674],
      angle: writing * 0.006,
      shift: [Math.sin(time * 3.2) * 0.0009, writing * 0.0012],
    };
  }
  if (image === "hospital")
    return {
      center: [0.731, 0.632],
      radius: [0.071, 0.091],
      pivot: [0.793, 0.675],
      angle: Math.sin(time * 0.9) * 0.004,
      shift: [0, Math.sin(time * 0.9) * 0.0007],
    };
  return fugitiveHandPose(image, time);
}
export function usesLivingIllustration(sceneId: string, shot: FilmShot) {
  return (
    (sceneId.startsWith("academy-") &&
      (shot.image === "ceremony" || shot.image === "scholars")) ||
    (sceneId.startsWith("protect-") &&
      ["scholars", "hospital"].includes(shot.image)) ||
    (sceneId.startsWith("fugitive-") &&
      ["evening", "warning", "support"].includes(shot.image))
  );
}

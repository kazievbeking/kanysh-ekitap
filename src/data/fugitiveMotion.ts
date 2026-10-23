// Gentle motions are confined to the visible hands in each source image.
export function fugitiveHandPose(image: string, time: number) {
  if (image === "evening")
    return {
      center: [0.322, 0.628],
      radius: [0.064, 0.078],
      pivot: [0.285, 0.653],
      angle: Math.sin(time * 1.7) * 0.004,
      shift: [Math.sin(time * 2.1) * 0.0006, Math.sin(time * 1.7) * 0.0007],
    };
  if (image === "warning")
    return {
      center: [0.385, 0.606],
      radius: [0.127, 0.145],
      pivot: [0.329, 0.697],
      angle: Math.sin(time * 0.85) * 0.007,
      shift: [0, Math.sin(time * 0.85) * 0.0008],
    };
  if (image === "support")
    return {
      center: [0.447, 0.627],
      radius: [0.079, 0.101],
      pivot: [0.493, 0.554],
      angle: Math.sin(time * 1.8) * 0.005,
      shift: [0, Math.sin(time * 1.8) * 0.0011],
    };
  return null;
}

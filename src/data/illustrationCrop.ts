export function illustrationCrop(
  sourceWidth: number,
  sourceHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  focus: string,
) {
  const scale = Math.max(
    viewportWidth / sourceWidth,
    viewportHeight / sourceHeight,
  );
  const width = viewportWidth / scale,
    height = viewportHeight / scale;
  const [x, y] = focus.split(" ").map((v) => parseFloat(v) / 100);
  return {
    x: (sourceWidth - width) * (x ?? 0.5),
    y: (sourceHeight - height) * (y ?? 0.5),
    width,
    height,
  };
}

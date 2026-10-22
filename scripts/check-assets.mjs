import { readFile, access } from "node:fs/promises";
import { parseFile } from "music-metadata";
const manifest = JSON.parse(
  await readFile("src/data/audio-manifest.json", "utf8"),
);
let count = 0;
for (const name of ["academy", "fugitive"]) {
  const scenes = JSON.parse(await readFile(`src/data/${name}.json`, "utf8"));
  let end = 0;
  for (const scene of scenes) {
    await access(`public/images/${scene.image}.webp`);
    const segment = manifest.segments[scene.id];
    if (!segment) throw new Error(`Аудио байланысы жоқ: ${scene.id}`);
    await access(`public/${segment.file}`);
    const { format } = await parseFile(`public/${segment.file}`);
    if (
      segment.start !== end ||
      segment.end <= segment.start ||
      segment.end > format.duration + 0.05
    )
      throw new Error(`Уақыт шекарасы қате: ${scene.id}`);
    end = segment.end;
    count++;
  }
  const first = manifest.segments[scenes[0].id];
  const { format } = await parseFile(`public/${first.file}`);
  if (Math.abs(end - format.duration) > 0.05)
    throw new Error("Бөлімнің аудиосы толық қамтылмаған");
}
await access("public/images/portrait.webp");
for (const image of ["heritage", "manuscript", "warning", "station"])
  await access(`public/images/${image}.webp`);
await access("public/audio/music/LICENSE.txt");
const music = await parseFile("public/audio/music/meditation-impromptu-01.mp3");
if (!music.format.hasAudio || music.format.duration < 200)
  throw new Error("Фондық музыка файлы қате");
console.log(
  `${count} көріністің суреттері, MP3 файлдары және нақты ұзақтықтары тексерілді.`,
);

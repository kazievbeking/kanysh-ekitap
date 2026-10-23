export type FilmEffect =
  | "sunlight"
  | "wind"
  | "ink"
  | "science"
  | "assembly"
  | "curtain"
  | "lamplight"
  | "letter"
  | "departure"
  | "journey"
  | "arrival";
export type FilmShot = {
  at: number;
  image: string;
  effect: FilmEffect;
  focus?: string;
  direction?: number;
};
export const imageDescriptions: Record<string, string> = {
  hospital:
    "Қаныш пен екі әріптестің ауруханадағы әңгімесі — көркем реконструкция",
  "auezov-flight":
    "Мұхтар Әуезовтің студентпен әуежайға келуі — көркем реконструкция",
  academy: "Абай театрының маңындағы ғылыми орта - көркем иллюстрация",
  heritage: "Қаныштың бейнесі, ежелгі тас жазу және даланың символдық көрінісі",
  manuscript: "Ғылыми үстел, ашық дәптер, қалам, кітаптар және жер шары",
  scholars: "Қаныш пен ғылыми ортадағы әріптестердің көркем бейнесі",
  ceremony: "Ғылым академиясының ашылу салтанатының көркем көрінісі",
  evening: "Жолға шығар алдындағы кеш, Қаныш пен дайындалған шабадан",
  warning:
    "Әріптестің Қанышқа хат пен пойыз билеттерін беруі - көркем иллюстрация",
  station: "Ескі вокзал, пойыз және Қаныштың көркем бейнесі",
  train: "Пойыз терезесінен тауларға қарап отырған Қаныштың бейнесі",
  support: "Қанышты вокзалда қарсы алған әріптестердің көркем бейнесі",
};

// Көрініс ішіндегі уақыттар секундпен, сол көріністің аудио басынан есептеледі.
// Кадрлар - көркем интерпретация; жаңа тарихи оқиға немесе диктор мәтіні қосылмайды.
export const storyboards: Record<string, FilmShot[]> = {
  "academy-01": [
    { at: 0, image: "academy", effect: "sunlight", focus: "60% 48%" },
    {
      at: 17,
      image: "heritage",
      effect: "wind",
      focus: "40% 50%",
      direction: -1,
    },
    { at: 36, image: "heritage", effect: "sunlight", focus: "65% 48%" },
  ],
  "academy-02": [
    { at: 0, image: "manuscript", effect: "ink", focus: "48% 65%" },
    {
      at: 20,
      image: "manuscript",
      effect: "ink",
      focus: "60% 70%",
      direction: -1,
    },
    { at: 31, image: "scholars", effect: "science", focus: "42% 58%" },
    { at: 43, image: "heritage", effect: "wind", direction: -1 },
    { at: 56, image: "manuscript", effect: "science", focus: "58% 56%" },
    {
      at: 73,
      image: "scholars",
      effect: "science",
      focus: "44% 58%",
      direction: -1,
    },
    { at: 85, image: "manuscript", effect: "ink", focus: "62% 65%" },
    { at: 91, image: "scholars", effect: "science", focus: "48% 45%" },
  ],
  "academy-03": [
    { at: 0, image: "scholars", effect: "science", focus: "50% 45%" },
    {
      at: 7.5,
      image: "manuscript",
      effect: "ink",
      focus: "50% 60%",
      direction: -1,
    },
  ],
  "academy-04": [
    { at: 0, image: "ceremony", effect: "curtain", focus: "64% 45%" },
    {
      at: 22,
      image: "academy",
      effect: "sunlight",
      focus: "65% 42%",
      direction: -1,
    },
    { at: 44, image: "ceremony", effect: "assembly", focus: "64% 45%" },
    {
      at: 61,
      image: "ceremony",
      effect: "assembly",
      focus: "54% 52%",
      direction: -1,
    },
  ],
  "protect-01": [
    { at: 0, image: "scholars", effect: "science", focus: "48% 45%" },
    { at: 18, image: "manuscript", effect: "ink", focus: "48% 65%" },
    {
      at: 36,
      image: "manuscript",
      effect: "ink",
      focus: "65% 60%",
      direction: -1,
    },
    { at: 52, image: "scholars", effect: "science", focus: "44% 52%" },
  ],
  "protect-02": [
    { at: 0, image: "manuscript", effect: "ink", focus: "48% 60%" },
    {
      at: 19,
      image: "manuscript",
      effect: "lamplight",
      focus: "62% 65%",
      direction: -1,
    },
    { at: 32, image: "manuscript", effect: "ink", focus: "42% 68%" },
  ],
  "protect-03": [
    { at: 0, image: "hospital", effect: "assembly", focus: "50% 48%" },
    {
      at: 22,
      image: "hospital",
      effect: "assembly",
      focus: "64% 47%",
      direction: -1,
    },
    { at: 43, image: "hospital", effect: "assembly", focus: "44% 50%" },
  ],
  "protect-04": [
    { at: 0, image: "hospital", effect: "assembly", focus: "45% 46%" },
    {
      at: 11,
      image: "hospital",
      effect: "assembly",
      focus: "58% 49%",
      direction: -1,
    },
  ],
  "protect-05": [
    { at: 0, image: "manuscript", effect: "ink", focus: "50% 60%" },
    { at: 29, image: "auezov-flight", effect: "wind", focus: "45% 48%" },
    {
      at: 47,
      image: "auezov-flight",
      effect: "sunlight",
      focus: "65% 48%",
      direction: -1,
    },
    { at: 69, image: "scholars", effect: "science", focus: "48% 48%" },
  ],
  "fugitive-01": [
    { at: 0, image: "evening", effect: "lamplight", focus: "39% 48%" },
    { at: 12, image: "manuscript", effect: "letter", direction: -1 },
    {
      at: 26,
      image: "evening",
      effect: "lamplight",
      focus: "33% 61%",
      direction: -1,
    },
    { at: 37.8, image: "evening", effect: "lamplight", focus: "42% 40%" },
  ],
  "fugitive-02": [
    { at: 0, image: "warning", effect: "lamplight", focus: "50% 45%" },
    {
      at: 14,
      image: "warning",
      effect: "letter",
      focus: "46% 65%",
      direction: -1,
    },
    { at: 25, image: "station", effect: "departure", focus: "60% 55%" },
  ],
  "fugitive-03": [
    { at: 0, image: "evening", effect: "lamplight", focus: "40% 47%" },
    {
      at: 23,
      image: "evening",
      effect: "letter",
      focus: "62% 65%",
      direction: -1,
    },
    { at: 41, image: "evening", effect: "lamplight", focus: "28% 55%" },
    {
      at: 53,
      image: "evening",
      effect: "lamplight",
      focus: "65% 55%",
      direction: -1,
    },
    { at: 62, image: "station", effect: "departure", focus: "56% 58%" },
    { at: 77, image: "train", effect: "journey", focus: "38% 44%" },
  ],
  "fugitive-04": [
    { at: 0, image: "train", effect: "journey", focus: "36% 44%" },
    {
      at: 14,
      image: "station",
      effect: "journey",
      focus: "60% 60%",
      direction: -1,
    },
    { at: 27, image: "train", effect: "journey", focus: "45% 48%" },
    {
      at: 38,
      image: "train",
      effect: "journey",
      focus: "66% 48%",
      direction: -1,
    },
  ],
  "fugitive-05": [
    { at: 0, image: "evening", effect: "lamplight", focus: "48% 47%" },
    { at: 22, image: "station", effect: "arrival", focus: "55% 48%" },
    {
      at: 35,
      image: "support",
      effect: "arrival",
      focus: "60% 45%",
      direction: -1,
    },
  ],
};
export function shotAt(shots: FilmShot[], elapsed: number) {
  let index = 0;
  for (let i = 1; i < shots.length; i++) {
    if (elapsed < shots[i].at) break;
    index = i;
  }
  return index;
}

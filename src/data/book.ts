import academy from "./academy.json";
import fugitive from "./fugitive.json";
import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    id: "academy",
    title: "Академияның ашылуы",
    subtitle: "Ұлттың ұлы арманы — ғылымға ашылған жол.",
    pages: "117–119",
    year: "1946",
    scenes: academy,
  },
  {
    id: "fugitive",
    title: "Қашқын академик",
    subtitle: "Сын сағаттағы сабыр, сенім және достық.",
    pages: "289–291",
    year: "1951",
    scenes: fugitive,
  },
];
export const bibliography = {
  title: "Қаныш және ғылыми майдан",
  authors: "С. Керімбай, Ә. Нәби",
  publisher: "«Отбасы» баспа үйі",
  year: "2024",
  city: "Алматы",
  pages: 456,
  isbn: "978-601-81179-2-3",
};
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

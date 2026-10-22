import { JSDOM, VirtualConsole } from "jsdom";
const base = process.argv[2] || "http://127.0.0.1:5173/";
const html = await (await fetch(base)).text();
const script = html.match(/<script[^>]+src="([^"]+)/)?.[1];
if (!script) throw new Error("JavaScript жинағы жоқ");
const response = await fetch(new URL(script, base));
const code = await response.text();
if (!response.ok || code.length < 10000)
  throw new Error("JavaScript жинағы ашылмады");
for (const route of ["#/read/academy/0", "#/read/fugitive/3"]) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e.message));
  const dom = new JSDOM(html, {
    url: base + route,
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole,
  });
  dom.window.scrollTo = () => {};
  dom.window.HTMLMediaElement.prototype.pause = function () {};
  dom.window.HTMLMediaElement.prototype.play = function () {
    return Promise.resolve();
  };
  dom.window.eval(code);
  await new Promise((resolve) => setTimeout(resolve, 250));
  const doc = dom.window.document;
  if (!doc.querySelector(".film-stage") || doc.querySelector(".text-page"))
    throw new Error("Анимациялық көрсетілім ашылмады: " + route);
  if (doc.querySelectorAll(".film-shot").length < 2)
    throw new Error("Жоспарлар жетіспейді");
  if (route.includes("fugitive") && !doc.querySelector(".animated-train"))
    throw new Error("Пойыз қабаты жоқ");
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(
    route,
    "анимациялық сахна көрсетілді, мәтін панелі жоқ, JavaScript қатесі жоқ",
  );
  dom.window.close();
}

"use strict";

function dialogueSteps(cues, scene) {
  const groups = [];
  let group = [];
  for (const cue of cues) {
    group.push(cue);
    if (cue[0] !== "Stage direction") {
      groups.push(group);
      group = [];
    }
  }
  if (group.length && groups.length) groups.at(-1).push(...group);

  return groups.map((lines, step) => ({
    ...scene,
    step,
    earlierLines: groups.slice(0, step).flat(),
    lines,
  }));
}

const sceneSteps = scenes.map((scene, index) => dialogueSteps(scene.slides.flat(), {
  type: "script",
  title: scene.title,
  theme: scene.theme,
  sceneNumber: index + 1,
}));
const slides = [
  { type: "cover", theme: "cover" },
  ...sceneSteps.flat(),
  ...dialogueSteps(closingLines, { type: "end", theme: "end", title: "The End" }),
];

const stage = document.querySelector("#stage");
const slideContent = document.querySelector("#slide");
const slideAnnouncement = document.querySelector("#slide-announcement");
const cover = slideContent.firstElementChild;
const slideCount = document.querySelector("#slide-count");
const sceneProgress = document.querySelector("#scene-progress");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const sceneDialog = document.querySelector("#scene-dialog");
const sceneList = document.querySelector("#scene-list");
const fullscreenButton = document.querySelector("#fullscreen-button");
const fullscreenLabel = document.querySelector("#fullscreen-label");
let current = -1;

function element(tag, className, value) {
  const node = document.createElement(tag);
  node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

const sceneLinks = scenes.map((scene, index) => {
  const number = index + 1;
  const steps = sceneSteps[index];
  const firstSlide = slides.indexOf(steps[0]);
  const item = document.createElement("li");
  const button = element("button", "scene-link");
  button.type = "button";
  const label = element("span", "scene-link-number", `Scene ${number}`);
  label.lang = "en";
  button.append(label, element("span", "scene-link-name", scene.title));
  button.addEventListener("click", () => {
    sceneDialog.close();
    navigate(firstSlide);
  });
  item.append(button);
  sceneList.append(item);
  const tick = element("span", "scene-tick");
  tick.style.flexGrow = steps.length;
  sceneProgress.append(tick);
  return { button, tick, number };
});

function renderLine([speaker, words, direction]) {
  if (speaker === "Stage direction") {
    const cue = element("p", "stage-direction", words);
    cue.prepend(element("span", "sr-only", "Stage direction. "));
    return cue;
  }

  const narrator = speaker === "Narrator";
  const line = element("div", narrator ? "line narrator" : "line");
  const label = element("p", "speaker", speaker);
  if (direction) label.append(element("span", "delivery", ` · ${direction}`));
  const spoken = narrator ? element("mark", "highlight", words) : document.createTextNode(words);
  const dialogue = element("p", "dialogue");
  dialogue.append(spoken);
  line.append(label, dialogue);
  return line;
}

function fitFont(script, property, preferred, fits) {
  const setSize = (size) => script.style.setProperty(property, `${size}px`);
  setSize(preferred);
  if (fits()) return;

  let low = 0;
  let high = preferred;
  while (high - low > 0.2) {
    const mid = (low + high) / 2;
    setSize(mid);
    if (fits()) low = mid;
    else high = mid;
  }
  setSize(low);
}

function fitSlide() {
  const script = slideContent.querySelector(".script");
  const width = stage.clientWidth;
  if (!script || width === 0) return;
  const body = script.querySelector(".script-body");
  const currentLines = script.querySelector(".current-lines");
  const history = script.querySelector(".scene-history");
  const preferredCurrent = width * 0.031;
  const historyHeight = history ? Math.floor(body.clientHeight * 0.6) : 0;
  const historyGap = history ? parseFloat(getComputedStyle(history).marginBottom) : 0;
  const limit = body.clientHeight - historyHeight - historyGap;
  fitFont(script, "--current-size", preferredCurrent, () => (
    currentLines.getBoundingClientRect().height <= limit
  ));

  if (history) {
    const earlierLines = history.firstElementChild;
    const step = slides[current].step;
    const preferred = preferredCurrent * 0.64 / (1 + (step - 1) * 0.044);
    fitFont(script, "--history-size", preferred, () => (
      earlierLines.getBoundingClientRect().height <= Math.min(historyHeight, history.clientHeight)
    ));
  }
}

function render(index) {
  if (index === current) return;
  current = index;
  const slide = slides[index];
  const isCover = slide.type === "cover";
  const isEnd = slide.type === "end";
  const atLastStep = index === slides.length - 1;
  stage.dataset.theme = slide.theme;

  if (isCover) {
    slideContent.replaceChildren(cover);
  } else {
    const script = element("article", isEnd ? "script ending" : "script");
    script.lang = "hi-Latn";
    const heading = element("header", "scene-heading");
    if (!isEnd) {
      const marker = element("p", "scene-number", `Scene ${slide.sceneNumber} of ${scenes.length}`);
      marker.lang = "en";
      heading.append(marker);
    }
    const title = element("h1", "scene-title", slide.title);
    if (isEnd) title.lang = "en";
    heading.append(title);
    const body = element("div", "script-body");
    if (slide.earlierLines?.length) {
      const history = element("section", "scene-history");
      history.setAttribute("aria-label", "Earlier in this scene");
      const earlierLines = element("div", "earlier-lines");
      earlierLines.style.columnCount = slide.earlierLines.length >= 7 ? 2 : 1;
      earlierLines.append(...slide.earlierLines.map(renderLine));
      history.append(earlierLines);
      body.append(history);
    }
    const lines = element("div", "current-lines");
    lines.append(...slide.lines.map(renderLine));
    body.append(lines);
    script.append(heading, body);
    slideContent.replaceChildren(script);
  }
  fitSlide();
  slideAnnouncement.textContent = isCover
    ? "The Last Omen. Aakhri Sanket."
    : `${slide.title}. ${slide.lines.map(([speaker, words]) => `${speaker}. ${words}`).join(" ")}`;

  const display = String(index + 1).padStart(2, "0");
  slideCount.textContent = `${display} / ${slides.length}`;
  previous.disabled = isCover;
  next.disabled = atLastStep;
  next.setAttribute("aria-label", isCover ? "Start show" : atLastStep ? "End of show" : "Next dialogue");
  sceneLinks.forEach(({ button, tick, number }) => {
    const active = slide.sceneNumber === number;
    if (active) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
    tick.dataset.state = active ? "current" : isEnd || slide.sceneNumber > number ? "past" : "future";
  });
}

function readSlide() {
  const hash = location.hash.slice(1);
  const index = /^\d+$/.test(hash) ? Number(hash) - 1 : 0;
  return index >= 0 && index < slides.length ? index : 0;
}

function navigate(index) {
  if (index < 0 || index >= slides.length || index === current) return;
  const hash = index === 0 ? "#" : `#${index + 1}`;
  history.replaceState(null, "", hash);
  render(index);

  if (document.activeElement === document.body) {
    if (next.disabled) previous.focus({ preventScroll: true });
    else if (previous.disabled) next.focus({ preventScroll: true });
  }
  if (window.scrollY > 0) window.scrollTo(0, 0);
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    // A browser may restrict fullscreen when this site is embedded.
  }
}

document.querySelector(".identity").addEventListener("click", (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(0);
});
previous.addEventListener("click", () => navigate(current - 1));
next.addEventListener("click", () => navigate(current + 1));
document.querySelector("#scenes-button").addEventListener("click", () => {
  sceneDialog.showModal();
  sceneList.querySelector("[aria-current]")?.focus();
});
sceneDialog.addEventListener("click", (event) => {
  if (event.target !== sceneDialog) return;
  const { left, right, top, bottom } = sceneDialog.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
    sceneDialog.close();
  }
});

fullscreenButton.hidden = !document.fullscreenEnabled;
fullscreenButton.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  const label = document.fullscreenElement ? "Exit fullscreen" : "Fullscreen";
  fullscreenLabel.textContent = label;
  fullscreenButton.setAttribute("aria-label", label);
});
window.addEventListener("hashchange", () => render(readSlide()));

document.addEventListener("keydown", (event) => {
  if (sceneDialog.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key.toLowerCase() === "f" && document.fullscreenEnabled && !event.repeat) {
    event.preventDefault();
    toggleFullscreen();
    return;
  }

  const onButton = event.target instanceof Element && event.target.closest("button, a");
  const direction = event.key === "ArrowRight" || (event.key === " " && !onButton) ? 1
    : event.key === "ArrowLeft" ? -1 : 0;
  if (direction !== 0) {
    event.preventDefault();
    if (!event.repeat) navigate(current + direction);
  }
});

render(readSlide());
new ResizeObserver(fitSlide).observe(stage);

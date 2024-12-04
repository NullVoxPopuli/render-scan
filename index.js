let overlay = document.createElement('div');
let px = 'px';
let body = document.body;
let styles = `
  .render-perf__container {
    position: fixed;
    pointer-events: none;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    z-index: 1000000000;
    
    .render-perf__box {
      box-sizing: border-box;
      font-family: sans-serif;
      display: block;
      position: fixed;
      pointer-events: none;
      border: 1px solid #aa00ff;
      background-color: rgba(200, 0, 255, 0.05);
      transition: opacity 0.25s;

      .render-perf__title {
        display: inline-block;
        min-width: max-content;
        box-sizing: content-box;
        font-size: 0.75rem;
        border: 1px solid #aa00ff;
        border-bottom: none;
        padding: 0.125rem 0.5rem;
        color: white;
        background-color: rgba(100, 0, 200, 1);
        position: relative;
        top: -1.5rem;
      }
    }
  }
`;
let sheet = document.createElement('style');
sheet.innerHTML = styles;
overlay.appendChild(sheet);
overlay.classList.add('render-perf__container')
body.appendChild(overlay);


class Highlight {
  #element;
  #title;
  constructor(target) {
    this.target = target;

    this.#element = document.createElement('div');
    this.#title = document.createElement('div');
    this.#element.classList.add('render-perf__box');
    this.#title.classList.add('render-perf__title');
    this.#element.appendChild(this.#title);
  }

  #reasons = new Map();
  #totalRerenders = 0;

  notify(why) {
    this.#reasons.set(why, (this.#reasons.get(why) || 0) + 1);
    this.#totalRerenders++;

    this.#render();
  }

  get icon() {
    if (this.#totalRerenders > 5) {
      return "⚠️";
    }

    if (this.#totalRerenders > 20) {
      return "❌";
    }

    return "ℹ️";
  }

  get title() {
    let reasons = [...this.#reasons.entries()].map(([key, count]) => `${key} (${count})`).join(' , ');
    let total = 0;

    this.#reasons.values().forEach(x => total += x);

    return `x${total} | ${reasons}`;
  }

  #fadeOut;
  #frame;
  #render() {
    cancelAnimationFrame(this.#frame);
    clearTimeout(this.#fadeOut);
    this.#frame = requestAnimationFrame(() => {
      let rect = this.#getRect();

      if (!rect) return;
      if (rect.top > window.innerHeight) return;
      if (rect.left > window.innerWidth) return;

      if (!overlay.contains(this.#element)) {
        overlay.appendChild(this.#element);
      }

      this.#title.textContent = this.title;

      Object.assign(this.#element.style, {
        top: rect.y + px,
        left: rect.x + px,
        width: rect.width + px,
        height: rect.height + px,
      });

      this.#element.style.opacity = 1;
      this.#fadeOut = setTimeout(() => {
        this.#element.style.opacity = 0;
        this.#reasons.clear();
      }, 1000);
    })
  }

  #getRect() {
    if (this.target instanceof Element) {
      let rect = this.target.getBoundingClientRect();

      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }
    }

    let range = document.createRange();
    range.selectNodeContents(this.target);
    let rects = range.getClientRects();
    let rect = rects[0];

    if (!rect) {
      console.log(`Could not determine coordinates of `, this.target);
      return;
    }

    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }
  }
}
let cache = new WeakMap();
function highlightNode(element, why) {
  let existing = cache.get(element);

  if (!existing) {
    existing = new Highlight(element);
    cache.set(element, existing);
  }

  existing.notify(why);
}

let mutationObserver = new MutationObserver((mutationList, observer) => {
  for (let mutation of mutationList) {
    if (typeof mutation.target.getAttribute === 'function') {
      let shouldIgnore = mutation.target.getAttribute('class')?.includes('render-perf__')

      if (shouldIgnore) {
        continue;
      }
    }

    switch (mutation.type) {
      case "attributes":
        highlightNode(mutation.target, 'attribute changed');
        break;
      case "childList":
        highlightNode(mutation.target, 'children changed');
        break;
      case "characterData":
        highlightNode(mutation.target, 'text changed');
        break;
      default:
        console.log(`Unhandled mutation type: ${mutation.type}`);
    }
  }
});

mutationObserver.observe(body, {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
});


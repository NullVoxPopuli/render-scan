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

    .render-perf__panel {
      position: fixed;
      right: 0.5rem;
      bottom: 0.5rem;
      pointer-events: auto;
      font-family: monospace;
      font-size: 0.75rem;
      color: white;
      background-color: rgba(40, 0, 80, 0.9);
      border: 1px solid #aa00ff;
      padding: 0.5rem;
      display: grid;
      grid-template-columns: auto auto;
      gap: 0.125rem 0.75rem;

      dd {
        margin: 0;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      label {
        grid-column: 1 / -1;
        display: flex;
        gap: 0.25rem;
        align-items: center;
        margin-top: 0.25rem;
        cursor: pointer;
      }
    }
  }
`;
let sheet = document.createElement('style');
sheet.innerHTML = styles;
overlay.appendChild(sheet);
overlay.classList.add('render-perf__container')

let panel = document.createElement('dl');
panel.classList.add('render-perf__panel');
panel.innerHTML = `
  <dt>FPS</dt><dd data-fps="instant">-</dd>
  <dt>FPS (1s)</dt><dd data-fps="1000">-</dd>
  <dt>FPS (5s)</dt><dd data-fps="5000">-</dd>
  <dt>FPS (10s)</dt><dd data-fps="10000">-</dd>
  <label><input type="checkbox" checked> only show avoidable re-renders</label>
`;
overlay.appendChild(panel);
body.appendChild(overlay);

let avoidableOnly = panel.querySelector('input');
let fpsOutputs = [...panel.querySelectorAll('[data-fps]')];
let frames = [];
let startedAt = performance.now();

function setText(element, text) {
  if (element.textContent !== text) {
    element.textContent = text;
  }
}

function measureFps(now) {
  let previous = frames[frames.length - 1];
  frames.push(now);

  while (frames[0] < now - 10_000) {
    frames.shift();
  }

  for (let output of fpsOutputs) {
    let range = output.dataset.fps;

    if (range === 'instant') {
      if (previous !== undefined) {
        setText(output, String(Math.round(1000 / (now - previous))));
      }
      continue;
    }

    let duration = Math.min(Number(range), now - startedAt);
    let since = now - duration;
    let count = frames.filter(time => time > since).length;

    setText(output, (count / (duration / 1000)).toFixed(1));
  }

  requestAnimationFrame(measureFps);
}

requestAnimationFrame(measureFps);


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

function isSameChildren(removed, added) {
  return removed.length === added.length
    && removed.every((node, i) => node.isEqualNode(added[i]));
}

let mutationObserver = new MutationObserver((mutationList) => {
  let attributes = new Map();
  let text = new Map();
  let children = new Map();

  for (let mutation of mutationList) {
    let { target } = mutation;

    if (overlay.contains(target)) {
      continue;
    }

    switch (mutation.type) {
      case "attributes": {
        let changed = attributes.get(target) ?? new Map();
        if (!changed.has(mutation.attributeName)) {
          changed.set(mutation.attributeName, mutation.oldValue);
        }
        attributes.set(target, changed);
        break;
      }
      case "childList": {
        let changed = children.get(target) ?? { removed: [], added: [] };
        changed.removed.push(...mutation.removedNodes);
        changed.added.push(...mutation.addedNodes);
        children.set(target, changed);
        break;
      }
      case "characterData":
        if (!text.has(target)) {
          text.set(target, mutation.oldValue);
        }
        break;
      default:
        console.log(`Unhandled mutation type: ${mutation.type}`);
    }
  }

  for (let [target, changed] of attributes) {
    for (let [name, oldValue] of changed) {
      if (oldValue === target.getAttribute(name)) {
        highlightNode(target, 'attribute set to same value');
      } else if (!avoidableOnly.checked) {
        highlightNode(target, 'attribute changed');
      }
    }
  }

  for (let [target, { removed, added }] of children) {
    if (isSameChildren(removed, added)) {
      highlightNode(target, 'children replaced with identical nodes');
    } else if (!avoidableOnly.checked) {
      highlightNode(target, 'children changed');
    }
  }

  for (let [target, oldValue] of text) {
    if (oldValue === target.data) {
      highlightNode(target, 'text set to same value');
    } else if (!avoidableOnly.checked) {
      highlightNode(target, 'text changed');
    }
  }
});

mutationObserver.observe(body, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeOldValue: true,
  characterData: true,
  characterDataOldValue: true,
});

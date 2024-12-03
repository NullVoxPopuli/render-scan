let overlay = document.createElement('div');
let px = 'px';
let body = document.body;
let styles = `
  .render-perf__container {
    position: fixed;
    pointerEvents: none;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    .render-perf__box {
      font-size: 0.5rem;
      font-family: sans-serif;
      position: fixed;
      pointer-events: none;
      border: 1px solid #aa00ff;
      background-color: rgba(200, 0, 255, 0.1);
      transition: opacity 1s;
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
  constructor(target) {
    this.target = target;

    this.#element = document.createElement('div');
    this.#element.classList.add('render-perf__box');
    overlay.appendChild(this.#element);
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
    return `${this.icon} Rerender | ${reasons}`;
  }

  #fadeOut;
  #render() {
    clearTimeout(this.#fadeOut);
    let rect = this.target.getBoundingClientRect();

    console.log(rect);

    this.#element.textContent = this.title;
    Object.assign(this.#element.style, {
      opacity: 1,
      top: rect.y + px,
      left: rect.x + px,
      width: rect.wdith + px,
      height: rect.height + px,
    });

    this.#fadeOut = setTimeout(() => {
      this.#element.opacity = 0;
    }, 500);
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
  console.log(mutationList)
  for (let mutation of mutationList) {
    let shouldIgnore = mutation.target?.getAttribute('class')?.includes('render-perf__')
    if (shouldIgnore) {
      continue;
    }

    switch (mutation.type) {
      case "attributes":
        highlightNode(mutation.target, 'attribute changed');
        break;
      case "childList":
        highlightNode(mutation.target, 'children changed');
        break;
      case "characterData":
        // how to get element?
        highlightNode(mutation.target, 'text changed');

    }
  }
});

mutationObserver.observe(body, {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
});

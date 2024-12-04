# render-scan

Visualize performance!

render-scan will show you whenever something in the DOM updates, and what kind of update ocurred.

## Bookmarklet

<details><summary>The easiest way to check render perf is via this bookmarklet.</summary>

```js
javascript:(function()%7Blet%20overlay%20%3D%20document.createElement('div')%3B%0Alet%20px%20%3D%20'px'%3B%0Alet%20body%20%3D%20document.body%3B%0Alet%20styles%20%3D%20%60%0A%20%20.render-perf__container%20%7B%0A%20%20%20%20position%3A%20fixed%3B%0A%20%20%20%20pointer-events%3A%20none%3B%0A%20%20%20%20top%3A%200%3B%0A%20%20%20%20left%3A%200%3B%0A%20%20%20%20right%3A%200%3B%0A%20%20%20%20bottom%3A%200%3B%0A%20%20%20%20box-sizing%3A%20border-box%3B%0A%20%20%20%20z-index%3A%201000000000%3B%0A%20%20%20%20%0A%20%20%20%20.render-perf__box%20%7B%0A%20%20%20%20%20%20box-sizing%3A%20border-box%3B%0A%20%20%20%20%20%20font-family%3A%20sans-serif%3B%0A%20%20%20%20%20%20display%3A%20block%3B%0A%20%20%20%20%20%20position%3A%20fixed%3B%0A%20%20%20%20%20%20pointer-events%3A%20none%3B%0A%20%20%20%20%20%20border%3A%201px%20solid%20%23aa00ff%3B%0A%20%20%20%20%20%20background-color%3A%20rgba(200%2C%200%2C%20255%2C%200.05)%3B%0A%20%20%20%20%20%20transition%3A%20opacity%200.25s%3B%0A%0A%20%20%20%20%20%20.render-perf__title%20%7B%0A%20%20%20%20%20%20%20%20display%3A%20inline-block%3B%0A%20%20%20%20%20%20%20%20min-width%3A%20max-content%3B%0A%20%20%20%20%20%20%20%20box-sizing%3A%20content-box%3B%0A%20%20%20%20%20%20%20%20font-size%3A%200.75rem%3B%0A%20%20%20%20%20%20%20%20border%3A%201px%20solid%20%23aa00ff%3B%0A%20%20%20%20%20%20%20%20border-bottom%3A%20none%3B%0A%20%20%20%20%20%20%20%20padding%3A%200.125rem%200.5rem%3B%0A%20%20%20%20%20%20%20%20color%3A%20white%3B%0A%20%20%20%20%20%20%20%20background-color%3A%20rgba(100%2C%200%2C%20200%2C%201)%3B%0A%20%20%20%20%20%20%20%20position%3A%20relative%3B%0A%20%20%20%20%20%20%20%20top%3A%20-1.5rem%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%60%3B%0Alet%20sheet%20%3D%20document.createElement('style')%3B%0Asheet.innerHTML%20%3D%20styles%3B%0Aoverlay.appendChild(sheet)%3B%0Aoverlay.classList.add('render-perf__container')%0Abody.appendChild(overlay)%3B%0A%0A%0Aclass%20Highlight%20%7B%0A%20%20%23element%3B%0A%20%20%23title%3B%0A%20%20constructor(target)%20%7B%0A%20%20%20%20this.target%20%3D%20target%3B%0A%0A%20%20%20%20this.%23element%20%3D%20document.createElement('div')%3B%0A%20%20%20%20this.%23title%20%3D%20document.createElement('div')%3B%0A%20%20%20%20this.%23element.classList.add('render-perf__box')%3B%0A%20%20%20%20this.%23title.classList.add('render-perf__title')%3B%0A%20%20%20%20this.%23element.appendChild(this.%23title)%3B%0A%20%20%7D%0A%0A%20%20%23reasons%20%3D%20new%20Map()%3B%0A%20%20%23totalRerenders%20%3D%200%3B%0A%0A%20%20notify(why)%20%7B%0A%20%20%20%20this.%23reasons.set(why%2C%20(this.%23reasons.get(why)%20%7C%7C%200)%20%2B%201)%3B%0A%20%20%20%20this.%23totalRerenders%2B%2B%3B%0A%0A%20%20%20%20this.%23render()%3B%0A%20%20%7D%0A%0A%20%20get%20icon()%20%7B%0A%20%20%20%20if%20(this.%23totalRerenders%20%3E%205)%20%7B%0A%20%20%20%20%20%20return%20%22%E2%9A%A0%EF%B8%8F%22%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20if%20(this.%23totalRerenders%20%3E%2020)%20%7B%0A%20%20%20%20%20%20return%20%22%E2%9D%8C%22%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20return%20%22%E2%84%B9%EF%B8%8F%22%3B%0A%20%20%7D%0A%0A%20%20get%20title()%20%7B%0A%20%20%20%20let%20reasons%20%3D%20%5B...this.%23reasons.entries()%5D.map((%5Bkey%2C%20count%5D)%20%3D%3E%20%60%24%7Bkey%7D%20(%24%7Bcount%7D)%60).join('%20%2C%20')%3B%0A%20%20%20%20let%20total%20%3D%200%3B%0A%0A%20%20%20%20this.%23reasons.values().forEach(x%20%3D%3E%20total%20%2B%3D%20x)%3B%0A%0A%20%20%20%20return%20%60x%24%7Btotal%7D%20%7C%20%24%7Breasons%7D%60%3B%0A%20%20%7D%0A%0A%20%20%23fadeOut%3B%0A%20%20%23frame%3B%0A%20%20%23render()%20%7B%0A%20%20%20%20cancelAnimationFrame(this.%23frame)%3B%0A%20%20%20%20clearTimeout(this.%23fadeOut)%3B%0A%20%20%20%20this.%23frame%20%3D%20requestAnimationFrame(()%20%3D%3E%20%7B%0A%20%20%20%20%20%20let%20rect%20%3D%20this.%23getRect()%3B%0A%0A%20%20%20%20%20%20if%20(!rect)%20return%3B%0A%20%20%20%20%20%20if%20(rect.top%20%3E%20window.innerHeight)%20return%3B%0A%20%20%20%20%20%20if%20(rect.left%20%3E%20window.innerWidth)%20return%3B%0A%0A%20%20%20%20%20%20if%20(!overlay.contains(this.%23element))%20%7B%0A%20%20%20%20%20%20%20%20overlay.appendChild(this.%23element)%3B%0A%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20this.%23title.textContent%20%3D%20this.title%3B%0A%0A%20%20%20%20%20%20Object.assign(this.%23element.style%2C%20%7B%0A%20%20%20%20%20%20%20%20top%3A%20rect.y%20%2B%20px%2C%0A%20%20%20%20%20%20%20%20left%3A%20rect.x%20%2B%20px%2C%0A%20%20%20%20%20%20%20%20width%3A%20rect.width%20%2B%20px%2C%0A%20%20%20%20%20%20%20%20height%3A%20rect.height%20%2B%20px%2C%0A%20%20%20%20%20%20%7D)%3B%0A%0A%20%20%20%20%20%20this.%23element.style.opacity%20%3D%201%3B%0A%20%20%20%20%20%20this.%23fadeOut%20%3D%20setTimeout(()%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20this.%23element.style.opacity%20%3D%200%3B%0A%20%20%20%20%20%20%20%20this.%23reasons.clear()%3B%0A%20%20%20%20%20%20%7D%2C%201000)%3B%0A%20%20%20%20%7D)%0A%20%20%7D%0A%0A%20%20%23getRect()%20%7B%0A%20%20%20%20if%20(this.target%20instanceof%20Element)%20%7B%0A%20%20%20%20%20%20let%20rect%20%3D%20this.target.getBoundingClientRect()%3B%0A%0A%20%20%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20x%3A%20rect.x%2C%0A%20%20%20%20%20%20%20%20y%3A%20rect.y%2C%0A%20%20%20%20%20%20%20%20width%3A%20rect.width%2C%0A%20%20%20%20%20%20%20%20height%3A%20rect.height%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%0A%20%20%20%20let%20range%20%3D%20document.createRange()%3B%0A%20%20%20%20range.selectNodeContents(this.target)%3B%0A%20%20%20%20let%20rects%20%3D%20range.getClientRects()%3B%0A%20%20%20%20let%20rect%20%3D%20rects%5B0%5D%3B%0A%0A%20%20%20%20if%20(!rect)%20%7B%0A%20%20%20%20%20%20console.log(%60Could%20not%20determine%20coordinates%20of%20%60%2C%20this.target)%3B%0A%20%20%20%20%20%20return%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20x%3A%20rect.x%2C%0A%20%20%20%20%20%20y%3A%20rect.y%2C%0A%20%20%20%20%20%20width%3A%20rect.width%2C%0A%20%20%20%20%20%20height%3A%20rect.height%2C%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0Alet%20cache%20%3D%20new%20WeakMap()%3B%0Afunction%20highlightNode(element%2C%20why)%20%7B%0A%20%20let%20existing%20%3D%20cache.get(element)%3B%0A%0A%20%20if%20(!existing)%20%7B%0A%20%20%20%20existing%20%3D%20new%20Highlight(element)%3B%0A%20%20%20%20cache.set(element%2C%20existing)%3B%0A%20%20%7D%0A%0A%20%20existing.notify(why)%3B%0A%7D%0A%0Alet%20mutationObserver%20%3D%20new%20MutationObserver((mutationList%2C%20observer)%20%3D%3E%20%7B%0A%20%20for%20(let%20mutation%20of%20mutationList)%20%7B%0A%20%20%20%20if%20(typeof%20mutation.target.getAttribute%20%3D%3D%3D%20'function')%20%7B%0A%20%20%20%20%20%20let%20shouldIgnore%20%3D%20mutation.target.getAttribute('class')%3F.includes('render-perf__')%0A%0A%20%20%20%20%20%20if%20(shouldIgnore)%20%7B%0A%20%20%20%20%20%20%20%20continue%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%0A%20%20%20%20switch%20(mutation.type)%20%7B%0A%20%20%20%20%20%20case%20%22attributes%22%3A%0A%20%20%20%20%20%20%20%20highlightNode(mutation.target%2C%20'attribute%20changed')%3B%0A%20%20%20%20%20%20%20%20break%3B%0A%20%20%20%20%20%20case%20%22childList%22%3A%0A%20%20%20%20%20%20%20%20highlightNode(mutation.target%2C%20'children%20changed')%3B%0A%20%20%20%20%20%20%20%20break%3B%0A%20%20%20%20%20%20case%20%22characterData%22%3A%0A%20%20%20%20%20%20%20%20highlightNode(mutation.target%2C%20'text%20changed')%3B%0A%20%20%20%20%20%20%20%20break%3B%0A%20%20%20%20%20%20default%3A%0A%20%20%20%20%20%20%20%20console.log(%60Unhandled%20mutation%20type%3A%20%24%7Bmutation.type%7D%60)%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)%3B%0A%0AmutationObserver.observe(body%2C%20%7B%0A%20%20subtree%3A%20true%2C%0A%20%20childList%3A%20true%2C%0A%20%20attributes%3A%20true%2C%0A%20%20characterData%3A%20true%2C%0A%7D)%3B%7D)()%3B
```

Copy the text into the URL field of a new bookmark!

Bookmarklet made with [bookmarklet-maker](https://caiorss.github.io/bookmarklet-maker/)

</details>

## Install

```bash
npm add render-scan
```

## Usage

to use in development:


```js
import 'render-scan'
```

to use _only_ in development:

```js
if (import.meta.env.DEV) {
    import('render-scan');
}
```

to use on any site:
- copy the `index.js` contents
- navigate to the site you want to instrument
- open the dev tools and open the console
- paste the contents of your clipboard into the console
- run the pasted code

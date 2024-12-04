# render-scan

Visualize performance!

render-scan will show you whenever something in the DOM updates, and what kind of update ocurred.

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

<h1 align="center">open-window</h1>

<img alt="NPM Version" src="https://img.shields.io/npm/v/open-window">
<img alt="NPM License" src="https://img.shields.io/npm/l/open-window">
<img alt="NPM Unpacked Size" src="https://img.shields.io/npm/unpacked-size/open-window">


<p align="center">
  A library for easy inter-window communication encapsulated in <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/open">Window:open() mehtod</a>.
</p>


## Installation

```sh
npm i open-window --save
```

## Demo

<img src="./assets/demo.gif" alt="demo">

## Import

### ES5 Imports

```js
import { openWindow, OpenerWindow } from 'open-window';
```

### Browserify

```html
<!--publishes one browserified bundles inside the dist/ folder: -->
<script src="lib.iife.js"></script> 
<!-- or -->
<script src="https://cdn.jsdelivr.net/npm/open-window/dist/lib.iife.js"></script> 
```

## Usage

In `opener.html`

```ts
import { openWindow } from 'open-window';

/* like as window.open*/
openWindow('http://localhost:5173/popup.html', 'popup,width=550,height=200,top=100').then(popupWindow => {
  popupWindow.addCloseEventHandler(() => {
    console.log('popupWindow closed');
  });
  popupWindow.addMessageEventHandler(msg => {
    if (msg.type === 'hello') {
      console.log(msg.value);
      popupWindow.sendMsg({ type: 'hello', value: 'from opener.html' });
    }
  });
});
```

In `popup.html`

```ts
import { OpenerWindow } from 'open-window';

OpenerWindow.sendMsg({
  type: 'hello',
  value: 'from popup.html'
});

OpenerWindow.addMessageEventHandler(msg => {
  if (msg.type === 'hello') {
    console.log(msg.value);
    OpenerWindow.closePopup();
  }
});
```

## API Reference

|  function  | return  |
|  ----  | ----  |
| openWindow(url[,feature])   | PopupWindow |
| OpenerWindow.sendMsg  | void |
| OpenerWindow.closePopup  | void |
| OpenerWindow.addMessageEventHandler  | void |
| OpenerWindow.removeMessageEventHandler  | void |
| OpenerWindow.addCloseEventHandler  | void |
| OpenerWindow.removeCloseEventHandler  | void |

|  PopupWindow  | type  |
|  ----  | ----  |
| popupWindow.sendMsg  | function |
| popupWindow.close  | function |
| popupWindow.addMessageEventHandler  | function |
| popupWindow.removeMessageEventHandler  | function |
| popupWindow.addCloseEventHandler  | function |
| popupWindow.removeCloseEventHandler  | function |
| popupWindow.url  | string |
| popupWindow.closed  | boolean |

## License

MIT License.


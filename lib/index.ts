import type {
  Msg,
  VerifyMsg,
  MsgHanlder,
  CloseMsgHandler,
  ClassMethodDecorator
} from './types';
import { nanoid } from 'nanoid';

const messageEventHandlerMap = new Map<string, Set<MsgHanlder>>();
const currentWindow = window;
const openerWindow = window.opener;
currentWindow._verify = currentWindow._verify || nanoid();
currentWindow._isClose = false;
currentWindow._isReady = true;

currentWindow.addEventListener('message', (event: MessageEvent) => {
  if (typeof event.data !== 'object' && !event.data) return;
  if (event.data.verify === currentWindow._verify) {
    const msgHandlerSet = messageEventHandlerMap.get(event.data.handlerVerify);
    if (!msgHandlerSet) return;
    for (const handler of msgHandlerSet) {
      try {
        handler(event.data.msg);
      } catch (error) {
        console.log(error);
      }
    }
  }
});

class PopupWindow {
  private _window: Window;
  private _msgStack: Array<{ verifyMsg: VerifyMsg; targetOrigin: string }>;
  private _timer: null | number;
  private _msgHandlerSet: Set<MsgHanlder>;
  private _closeHandlerSet: Set<CloseMsgHandler>;
  public url: string;
  public closed: boolean;

  constructor(url: string | URL, target?: string, features?: string) {
    const _window = currentWindow.open(url, target, features);
    if (_window === null) {
      throw new Error('can not open window');
    }
    this._window = _window;
    this._window._verify = this._window._verify || nanoid();
    this._msgStack = [];
    this._timer = null;
    this._msgHandlerSet = new Set();
    this._closeHandlerSet = new Set();
    this.url = url instanceof URL ? url.toString() : url;
    this.closed = false;
    messageEventHandlerMap.set(this._window._verify, this._msgHandlerSet);
    this._window.addEventListener('unload', () => {
      if (this._window.location.href.includes(this.url)) {
        this.closed = true;
        for (const handler of this._closeHandlerSet) {
          if (this._window._isClose) {
            handler({ type: 'closed' });
          } else {
            handler({ type: 'closed', error: new Error('closed by user') });
          }
        }
      }
    });
  }
  private _postMsg() {
    if (this._timer) return;
    if (this._window._isReady) {
      this._msgStack.forEach(({ verifyMsg, targetOrigin }) => {
        this._window?.postMessage(verifyMsg, targetOrigin);
      });
      this._msgStack = [];
    } else {
      this._timer = setTimeout(() => {
        this._timer = null;
        this._postMsg();
      }, 100);
    }
  }
  sendMsg(msg: Msg, targetOrigin = '*') {
    const verifyMsg = {
      verify: this._window._verify,
      handlerVerify: currentWindow._verify,
      msg
    };
    this._msgStack.push({ verifyMsg, targetOrigin });
    this._postMsg();
  }

  close() {
    this._window._isClose = true;
    this._window.close();
  }
  addMessageEventHandler(handler: MsgHanlder) {
    this._msgHandlerSet.add(handler);
  }
  removeMessageEventHandler(handler: MsgHanlder) {
    this._msgHandlerSet.delete(handler);
  }
  addCloseEventHandler(handler: CloseMsgHandler) {
    this._closeHandlerSet.add(handler);
  }
  removeCloseEventHandler(handler: CloseMsgHandler) {
    this._closeHandlerSet.delete(handler);
  }
}

const checkOpnerWindow: ClassMethodDecorator = (_target, _propertyKey, descriptor) => {
  const sourceMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    if (!openerWindow) throw new Error('can not find opener window');
    sourceMethod(...args);
  };
};

class OpenerWindow {
  @checkOpnerWindow
  static addMessageEventHandler(handler: MsgHanlder) {
    let msgHandlerSet = messageEventHandlerMap.get(openerWindow._verify);
    if (!msgHandlerSet) {
      msgHandlerSet = new Set();
      messageEventHandlerMap.set(openerWindow._verify, msgHandlerSet);
    }
    msgHandlerSet.add(handler);
  }
  @checkOpnerWindow
  static removeMessageEventHandler(handler: MsgHanlder) {
    const msgHandlerSet = messageEventHandlerMap.get(openerWindow._verify);
    if (msgHandlerSet) {
      msgHandlerSet.delete(handler);
    }
  }
  @checkOpnerWindow
  static sendMsg(msg: Msg, targetOrigin = '*') {
    openerWindow.postMessage(
      {
        verify: openerWindow._verify,
        handlerVerify: currentWindow._verify,
        msg
      },
      targetOrigin
    );
  }

  @checkOpnerWindow
  static closePopup() {
    currentWindow._isClose = true;
    currentWindow.close();
  }
}

const openWindow = (url: string | URL, target?: string, features?: string) => {
  return new Promise<PopupWindow>((resolve, reject) => {
    try {
      const popupWindow = new PopupWindow(url, target, features);
      resolve(popupWindow);
    } catch (error) {
      reject(error);
    }
  });
};

export { openWindow, OpenerWindow, PopupWindow };

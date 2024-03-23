import type { Msg, VerifyMsg, MsgHanlder, CloseMsgHandler, ClassMethodDecorator } from './types';
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

  constructor(url: string | URL, features?: string) {
    const _window = currentWindow.open(url, '_blank', features);
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
    this._window.addEventListener('DOMContentLoaded', () => {
      this._window.addEventListener('unload', () => {
        this.closed = true;
        for (const handler of this._closeHandlerSet) {
          if (this._window._isClose) {
            handler({ type: 'closed' });
          } else {
            handler({ type: 'closed', error: new Error('closed by user') });
          }
        }
      });
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
  /**
   * Sends a message to the specified target window.
   *
   * @param {Msg} msg - The message to be sent.
   * @param {string} targetOrigin - The target origin for the message. Defaults to '*'.
   */
  sendMsg(msg: Msg, targetOrigin = '*') {
    const verifyMsg = {
      verify: this._window._verify,
      handlerVerify: currentWindow._verify,
      msg
    };
    this._msgStack.push({ verifyMsg, targetOrigin });
    this._postMsg();
  }

  /**
   * Close the opened window
   */
  close() {
    this._window._isClose = true;
    this._window.close();
  }
  /**
   * Add a message event handler.
   *
   * @param {MsgHanlder} handler - the message handler to add
   * @return {void}
   */
  addMessageEventHandler(handler: MsgHanlder) {
    this._msgHandlerSet.add(handler);
  }
  /**
   * Remove a message event handler.
   *
   * @param {MsgHanlder} handler - the handler to be removed
   * @return {void}
   */
  removeMessageEventHandler(handler: MsgHanlder) {
    this._msgHandlerSet.delete(handler);
  }
  /**
   * Add a close event handler.
   *
   * @param {CloseMsgHandler} handler - the handler to add
   * @return {void}
   */
  addCloseEventHandler(handler: CloseMsgHandler) {
    this._closeHandlerSet.add(handler);
  }

  /**
   * Removes a close event handler.
   *
   * @param {CloseMsgHandler} handler - The close event handler to be removed
   * @return {void}
   */
  removeCloseEventHandler(handler: CloseMsgHandler) {
    this._closeHandlerSet.delete(handler);
  }
}

/**
 * Decorator for checking the opener window before executing the decorated method.
 *
 * @param {any} _target - the target of the decorator
 * @param {string | symbol} _propertyKey - the key of the property
 * @param {PropertyDescriptor} descriptor - the property descriptor
 * @return {void}
 */
const checkOpnerWindow: ClassMethodDecorator = (_target, _propertyKey, descriptor) => {
  const sourceMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    if (!openerWindow) throw new Error('can not find opener window');
    sourceMethod(...args);
  };
};

/**
 * @class
 * @classdesc The OpenerWindow class represents the window that opened the current window.
 * @name OpenerWindow
 * @example
 * OpenerWindow.sendMsg({ type: 'hello', value: 'hello sendMsgToOpener' });
 */
class OpenerWindow {
  /**
   * Adds a message event handler to the set of handlers for the specified opener window.
   *
   * @param {MsgHanlder} handler - The message event handler to be added.
   */
  @checkOpnerWindow
  static addMessageEventHandler(handler: MsgHanlder) {
    let msgHandlerSet = messageEventHandlerMap.get(openerWindow._verify);
    if (!msgHandlerSet) {
      msgHandlerSet = new Set();
      messageEventHandlerMap.set(openerWindow._verify, msgHandlerSet);
    }
    msgHandlerSet.add(handler);
  }
  /**
   * Remove a message event handler from the message handler set.
   *
   * @param {MsgHanlder} handler - The message handler to be removed.
   * @return {void}
   */
  @checkOpnerWindow
  static removeMessageEventHandler(handler: MsgHanlder) {
    const msgHandlerSet = messageEventHandlerMap.get(openerWindow._verify);
    if (msgHandlerSet) {
      msgHandlerSet.delete(handler);
    }
  }
  /**
   * Send a message to the specified target origin.
   *
   * @param {Msg} msg - the message to be sent
   * @param {string} [targetOrigin='*'] - the target origin for the message
   * @return {void}
   */
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

  /**
   * Close the function of the current window
   */
  @checkOpnerWindow
  static closePopup() {
    currentWindow._isClose = true;
    currentWindow.close();
  }
}

/**
 * Creates a new popup window with the provided URL, target, and features.
 *
 * @param {string | URL} url - The URL to be opened in the popup window.
 * @param {string} [features] - The features of the popup window.
 * @return {Promise<PopupWindow>} A Promise that resolves to the created PopupWindow or rejects with an error.
 */
const openWindow = (url: string | URL, features?: string) => {
  return new Promise<PopupWindow>((resolve, reject) => {
    try {
      const popupWindow = new PopupWindow(url, features);
      resolve(popupWindow);
    } catch (error) {
      reject(error);
    }
  });
};

export { openWindow, OpenerWindow, PopupWindow };

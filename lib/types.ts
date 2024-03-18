declare global {
  interface Window {
    _verify: string;
    _isClose: boolean;
    _isReady: boolean;
  }
}

interface Msg {
  type: string | number;
  value: any;
}

interface CloseMsg {
  type: string;
  error?: any;
}

interface VerifyMsg {
  verify: string;
  handlerVerify: string;
  msg: Msg;
}

interface MsgHanlder {
  (msg: Msg): void;
}
interface CloseMsgHandler {
  (msg: CloseMsg): void;
}

type ClassMethodDecorator = (
  target: any,
  props: string | symbol,
  descriptor: TypedPropertyDescriptor<any>
) => any;

export type { Msg, CloseMsg, VerifyMsg, MsgHanlder, CloseMsgHandler, ClassMethodDecorator };

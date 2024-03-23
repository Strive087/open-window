import { openWindow, OpenerWindow, PopupWindow } from '../lib';

let popupWindows: PopupWindow[] = [];

const msgPanel = document.getElementById('msg-panel');

const showMsgOnPanel = (msg: string) => {
  const p = document.createElement('p');
  p.innerText = msg;
  msgPanel?.appendChild(p);
} 

try {
  OpenerWindow.addMessageEventHandler(msg => {
    if (msg.type === 'hello') {
      showMsgOnPanel(msg.value)
    }
  });
} catch (error) {
  console.log(error);
}

document.getElementById('sendMsgToOpener')?.addEventListener('click', () => {
  try {
    OpenerWindow.sendMsg({
      type: 'hello',
      value: 'hello sendMsgToOpener'
    });
  } catch (error) {
    console.log(error);
  }
});

document.getElementById('sendMsgToPopup')?.addEventListener('click', () => {
  for (const popupWindow of popupWindows) {
    popupWindow.sendMsg({
      type: 'hello',
      value: 'hello sendMsgToPopup'
    });
  }
});

let top = 100;
document.getElementById('popup')?.addEventListener('click', () => {
  openWindow('http://localhost:5173/', `popup,width=550,height=172,left=0,top=${top+=180}`).then(_popupWindow => {
    popupWindows.push(_popupWindow);
    _popupWindow.addCloseEventHandler(() => {
      showMsgOnPanel('popupWindow closed');
    });
    _popupWindow.addMessageEventHandler(msg => {
      if (msg.type === 'hello') {
        showMsgOnPanel(msg.value)
      }
    });
  });
});

document.getElementById('close')?.addEventListener('click', () => {
  for (const popupWindow of popupWindows) {
    popupWindow.close();
  }
  OpenerWindow.closePopup();
});

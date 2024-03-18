import { openWindow, OpenerWindow, PopupWindow } from '../lib';

let popupWindow: PopupWindow;

try {
  OpenerWindow.addMessageEventHandler(msg => {
    if (msg.type === 'hello') {
      console.log(msg.value);
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
})

document.getElementById('sendMsgToPopup')?.addEventListener('click', () => {
  popupWindow.sendMsg({
    type: 'hello',
    value: 'hello sendMsgToPopup'
  });
});

document.getElementById('popup')?.addEventListener('click', () => {
  openWindow('http://localhost:5173/', '_blank', 'popup').then(_popupWindow => {
    popupWindow = _popupWindow;
    popupWindow.addCloseEventHandler(() => {
      console.log('popupWindow closed');
    });
    popupWindow.addMessageEventHandler(msg => {
      if (msg.type === 'hello') {
        console.log(msg.value);
      }
    });
  });
});

document.getElementById('close')?.addEventListener('click', () => {
  popupWindow.close(); // OpenerWindow.closePopup();
});

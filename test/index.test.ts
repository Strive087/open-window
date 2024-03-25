import { expect, describe, it, beforeAll } from '@jest/globals';
import 'jest-puppeteer';
import type { Page } from 'puppeteer';

let openerPage: Page;
let popupPage: Page;

beforeAll(async () => {
  openerPage = await browser.newPage();
  await openerPage.goto('http://localhost:5173/');
  const newPopupPromise = new Promise<Page>((resolve, reject) =>
    openerPage.once('popup', p => {
      if (p) {
        resolve(p);
      } else {
        reject(p);
      }
    })
  );
  await openerPage.click('#popup');
  popupPage = await newPopupPromise;
  await new Promise(resolve => popupPage.on('domcontentloaded', () => resolve(null)));
});

describe('open-window', () => {
  it('should be open a popup-window', async () => {
    await expect(popupPage.url()).toBe('http://localhost:5173/');
  });

  it('send message to popup-window', async () => {
    await openerPage.click('#sendMsgToPopup');
    await popupPage.waitForSelector('#msg-panel p');
    await expect(popupPage.$eval('#msg-panel p', p => p.innerText)).resolves.toBe('hello sendMsgToPopup');
  });

  it('send message to opener-window', async () => {
    await popupPage.click('#sendMsgToOpener');
    await openerPage.waitForSelector('#msg-panel p');
    await expect(openerPage.$eval('#msg-panel p', p => p.innerText)).resolves.toBe('hello sendMsgToOpener');
  });
});

describe('click close on popupWindow', () => {
  it('close popup-window', async () => { 
    // 关闭页面
    await popupPage.click('#close');
    await expect(openerPage.$eval('#msg-panel', msg => msg.textContent)).resolves.toContain('popupWindow closed');
  });
})

describe('click close on openerWindow', () => {
  it('close popup-window', async () => { 
    // 关闭页面
    await openerPage.click('#close');
    await expect(openerPage.$eval('#msg-panel', msg => msg.textContent)).resolves.toContain('popupWindow closed');
  });
})

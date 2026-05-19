const { chromium } = require('playwright');

const USER_INFO = {
  lastName: '原田',
  firstName: '真潤',
  lastKana: 'ハラダ',
  firstKana: 'マヒロ',
  phone: '08058966083'
};

(async () => {

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  try {

    console.log('サイトアクセス');

    await page.goto(
      'https://airrsv.net/sw-omori-reservation/calendar',
      {
        waitUntil: 'domcontentloaded'
      }
    );

    await page.waitForTimeout(3000);

    // CHUNITHM選択
    console.log('CHUNITHM選択');

    await page.locator(
      'a:has-text("CHUNITHM")'
    ).first().click({
      force: true
    });

    await page.waitForTimeout(3000);

    // ○ボタン取得
    console.log('予約ボタン取得');

    const reserveButtons = page.locator(
      'a:has-text("○")'
    );

    const count = await reserveButtons.count();

    console.log(`○ボタン数: ${count}`);

    if (count === 0) {
      throw new Error('○ボタンが見つかりません');
    }

    // 一番最後を押す
    await reserveButtons.last().click({
      force: true
    });

    await page.waitForTimeout(2000);

    // 開始時間20:00
    console.log('開始時間選択');

    await page.click('text=20:00');

    // 終了時間23:00
    console.log('終了時間選択');

    await page.click('text=23:00');

    // リクルートID
    console.log('リクルートID選択');

    await page.click(
      'text=リクルートIDで予約する'
    );

    // ログイン
    console.log('ログイン');

    await page.fill(
      'input[type="email"]',
      process.env.RECRUIT_ID
    );

    await page.fill(
      'input[type="password"]',
      process.env.RECRUIT_PASSWORD
    );

    await page.click(
      'button:has-text("ログイン")'
    );

    await page.waitForLoadState(
      'networkidle'
    );

    await page.waitForTimeout(3000);

    // 予約者情報入力
    console.log('予約者情報入力');

    await page.fill(
      'input[name*="last"]',
      USER_INFO.lastName
    );

    await page.fill(
      'input[name*="first"]',
      USER_INFO.firstName
    );

    await page.fill(
      'input[name*="sei"]',
      USER_INFO.lastKana
    );

    await page.fill(
      'input[name*="mei"]',
      USER_INFO.firstKana
    );

    await page.fill(
      'input[type="tel"]',
      USER_INFO.phone
    );

    // 予約確定
    console.log('予約確定');

    await page.click(
      'text=上記に同意して予約を確定する'
    );

    console.log('予約完了');

    await page.screenshot({
      path: 'success.png',
      fullPage: true
    });

  } catch (e) {

    console.error(e);

    await page.screenshot({
      path: 'error.png',
      fullPage: true
    });

    process.exit(1);

  } finally {

    await browser.close();
  }

})();

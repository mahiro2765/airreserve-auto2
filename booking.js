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

    // 待機
    await page.waitForTimeout(5000);

    // CHUNITHM選択
    console.log('CHUNITHM選択');

    await page.evaluate(() => {

      const links = Array.from(
        document.querySelectorAll('a')
      );

      const target = links.find(
        a => a.textContent.includes('CHUNITHM')
      );

      if (!target) {
        throw new Error('CHUNITHMなし');
      }

      target.click();

    });

    // 待機
    await page.waitForTimeout(5000);

    // ○ボタン取得
    console.log('予約ボタン取得');

    const reserveCount = await page.evaluate(() => {

      const links = Array.from(
        document.querySelectorAll('a')
      );

      return links.filter(
        a => a.textContent.includes('○')
      ).length;

    });

    console.log(`○ボタン数: ${reserveCount}`);

    if (reserveCount === 0) {
      throw new Error('○ボタンが見つかりません');
    }

    // 一番最後の○を押す
    await page.evaluate(() => {

      const links = Array.from(
        document.querySelectorAll('a')
      );

      const targets = links.filter(
        a => a.textContent.includes('○')
      );

      targets[targets.length - 1].click();

    });

    // 待機
    await page.waitForTimeout(3000);

    // 開始時間20:00
    console.log('開始時間20:00');

    await page.evaluate(() => {

      const elements = Array.from(
        document.querySelectorAll('*')
      );

      const target = elements.find(
        e => e.textContent.trim() === '20:00'
      );

      if (target) target.click();

    });

    // 待機
    await page.waitForTimeout(2000);

    // 終了時間23:00
    console.log('終了時間23:00');

    await page.evaluate(() => {

      const elements = Array.from(
        document.querySelectorAll('*')
      );

      const target = elements.find(
        e => e.textContent.trim() === '23:00'
      );

      if (target) target.click();

    });

    // 待機
    await page.waitForTimeout(2000);

    // リクルートID
    console.log('リクルートID選択');

    await page.evaluate(() => {

      const buttons = Array.from(
        document.querySelectorAll('*')
      );

      const target = buttons.find(
        e => e.textContent.includes('リクルートID')
      );

      if (target) target.click();

    });

    // 待機
    await page.waitForTimeout(5000);

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

    await page.evaluate(() => {

      const buttons = Array.from(
        document.querySelectorAll('button')
      );

      const target = buttons.find(
        b => b.textContent.includes('ログイン')
      );

      if (target) target.click();

    });

    await page.waitForLoadState(
      'networkidle'
    );

    await page.waitForTimeout(5000);

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

    await page.evaluate(() => {

      const buttons = Array.from(
        document.querySelectorAll('*')
      );

      const target = buttons.find(
        e => e.textContent.includes(
          '上記に同意して予約を確定する'
        )
      );

      if (target) target.click();

    });

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

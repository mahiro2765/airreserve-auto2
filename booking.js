const { chromium } = require('playwright');

const USER_INFO = {
  lastName: '原田',
  firstName: '真潤',
  lastKana: 'ハラダ',
  firstKana: 'マヒロ',
  phone: '08058966083'
};

// 最終木曜取得
function getLastThursday() {

  const today = new Date();

  // 30日後へ
  today.setDate(today.getDate() + 30);

  // 木曜へ戻す
  while (today.getDay() !== 4) {
    today.setDate(today.getDate() - 1);
  }

  return today;
}

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
        waitUntil: 'networkidle'
      }
    );

    // タイトル選択
    await page.click(
      'text=配信希望タイトルを選択してください'
    );

    await page.waitForTimeout(1000);

    // CHUNITHM選択
    await page.click('text=CHUNITHM');

    console.log('予約監視開始');

    let reserved = false;

    while (!reserved) {

      await page.reload({
        waitUntil: 'networkidle'
      });

      // 一番最後の20:00を押す
      const buttons = page.locator('text=20:00');

      const count = await buttons.count();

      if (count > 0) {

        console.log('予約可能');

        await buttons.last().click();

        reserved = true;

      } else {

        console.log('未解放');

        await page.waitForTimeout(500);
      }
    }

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

    await page.waitForLoadState('networkidle');

    // 予約者情報
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

    // スクショ保存
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

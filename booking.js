const { chromium } = require('playwright');

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

    // 少し待機
    await page.waitForTimeout(5000);

    // HTML全取得
    const html = await page.content();

    console.log(html);

    // スクショ保存
    await page.screenshot({
      path: 'page.png',
      fullPage: true
    });

    console.log('HTML出力完了');

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

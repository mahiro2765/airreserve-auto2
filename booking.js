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

    // HTML確認
    console.log('HTML確認');

    const html = await page.content();

    console.log(html);

    // スクショ保存
    await page.screenshot({
      path: 'page.png',
      fullPage: true
    });

    console.log('確認完了');

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

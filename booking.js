const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://YOUR_SITE_URL", {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(2000);

    console.log("木曜のみ検索");

    const candidates = await page.$$("button, a, div, span");

    let target = null;

    for (const el of candidates) {
      const text = await page.evaluate(e => e.textContent?.trim(), el);

      if (!text) continue;

      // ★ 木曜だけ許可
      const isThursday =
        text.includes("木") ||
        text.includes("Thu") ||
        text.includes("THU");

      if (!isThursday) continue;

      // その中で○を探す
      const hasCircle = text.includes("○");

      if (isThursday && hasCircle) {
        target = el;
        break;
      }
    }

    if (!target) {
      const html = await page.content();
      fs.writeFileSync("debug.html", html);
      throw new Error("木曜の○が見つからない");
    }

    console.log("木曜○クリック");
    await target.click();

    await page.waitForTimeout(1500);

    // 予約確定
    const confirmButtons = await page.$$("button");

    for (const btn of confirmButtons) {
      const t = await page.evaluate(e => e.textContent, btn);

      if (
        t?.includes("予約") ||
        t?.includes("確定") ||
        t?.includes("OK")
      ) {
        console.log("確定押下:", t);
        await btn.click();
        break;
      }
    }

    await page.waitForTimeout(3000);
    console.log("完了");

  } catch (err) {
    console.error(err);

    await page.screenshot({ path: "error.png", fullPage: true });

    const html = await page.content();
    fs.writeFileSync("debug.html", html);
  } finally {
    await browser.close();
  }
})();

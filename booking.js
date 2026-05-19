const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
  });

  const page = await browser.newPage();

  try {
    console.log("サイトアクセス");

    await page.goto("https://YOUR_SITE_URL", {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(2000);

    console.log("木曜のみ探索");

    const elements = await page.$$("button, a, div, span");

    let target = null;

    for (const el of elements) {
      const text = await page.evaluate(e => e.textContent?.trim(), el);

      if (!text) continue;

      // 木曜判定（必要ならここ調整）
      const isThursday =
        text.includes("木") ||
        text.toLowerCase().includes("thu");

      if (!isThursday) continue;

      // ○だけ取る
      if (text.includes("○")) {
        target = el;
        break;
      }
    }

    if (!target) {
      console.log("木曜○が見つからない");

      fs.writeFileSync("debug.html", await page.content());

      await page.screenshot({
        path: "error.png",
        fullPage: true,
      });

      throw new Error("target not found");
    }

    console.log("木曜○クリック");
    await target.click();

    await page.waitForTimeout(1500);

    // 予約確定ボタン探索
    const buttons = await page.$$("button");

    let confirmed = false;

    for (const btn of buttons) {
      const text = await page.evaluate(e => e.textContent?.trim(), btn);

      if (!text) continue;

      if (
        text.includes("予約") ||
        text.includes("確定") ||
        text.includes("OK") ||
        text.includes("決定")
      ) {
        console.log("確定ボタン:", text);
        await btn.click();
        confirmed = true;
        break;
      }
    }

    if (!confirmed) {
      console.log("確定ボタンが見つからない可能性あり");
    }

    await page.waitForTimeout(3000);

    console.log("完了");

  } catch (err) {
    console.error("Error:", err.message);

    fs.writeFileSync("debug.html", await page.content());

    await page.screenshot({
      path: "error.png",
      fullPage: true,
    });

  } finally {
    await browser.close();
  }
})();

const puppeteer = require("puppeteer");
const fs = require("fs");

const sleepUntil = async (targetHour, targetMin) => {
  while (true) {
    const now = new Date();

    // JSTに変換
    const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));

    if (jst.getHours() === targetHour && jst.getMinutes() === targetMin) {
      console.log("0:00到達 → 実行開始");
      return;
    }

    console.log("待機中...", jst.toTimeString().slice(0, 8));

    await new Promise(r => setTimeout(r, 500));
  }
};

(async () => {
  console.log("起動（待機モード）");

  // 0:00 JSTまで待機
  await sleepUntil(0, 0);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    console.log("サイトアクセス");

    await page.goto("https://YOUR_SITE_URL", {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(500);

    // 木曜○だけ取る（あなたのロジック）
    const els = await page.$$("button, a, div, span");

    let target = null;

    for (const el of els) {
      const text = await page.evaluate(e => e.textContent?.trim(), el);

      if (!text) continue;

      if (text.includes("木") && text.includes("○")) {
        target = el;
        break;
      }
    }

    if (!target) {
      throw new Error("対象なし");
    }

    console.log("即クリック");
    await target.click();

    await page.waitForTimeout(500);

    // 確定
    const buttons = await page.$$("button");

    for (const b of buttons) {
      const t = await page.evaluate(e => e.textContent, b);

      if (t?.includes("予約") || t?.includes("確定") || t?.includes("OK")) {
        console.log("確定クリック");
        await b.click();
        break;
      }
    }

    console.log("完了");

  } catch (e) {
    console.error(e.message);

    fs.writeFileSync("debug.html", await page.content());

  } finally {
    await browser.close();
  }
})();

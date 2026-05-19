const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // デバッグ中はfalse推奨
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // API監視（予約成功/失敗チェック用）
  page.on("response", async (res) => {
    const url = res.url();

    if (url.includes("reserve") || url.includes("booking")) {
      console.log("API:", res.status(), url);
    }
  });

  try {
    console.log("サイトアクセス");
    await page.goto("https://YOUR_SITE_URL", {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(2000);

    console.log("CHUNITHM選択");

    // まずボタン系を広く取得
    const candidates = await page.$$("button, a, div, span");

    let target = null;

    for (const el of candidates) {
      const text = await page.evaluate(e => e.textContent?.trim(), el);

      if (text === "○") {
        target = el;
        break;
      }
    }

    // それでもない場合は属性系も見る
    if (!target) {
      for (const el of candidates) {
        const aria = await page.evaluate(e => e.getAttribute("aria-label"), el);
        const data = await page.evaluate(e => e.getAttribute("data-status"), el);

        if (aria === "○" || data === "available") {
          target = el;
          break;
        }
      }
    }

    if (!target) {
      const html = await page.content();
      fs.writeFileSync("debug.html", html);
      throw new Error("○ボタンが見つからない（debug.html確認）");
    }

    console.log("○ボタン発見 → クリック");
    await target.click();

    await page.waitForTimeout(1500);

    // 予約確定ボタン探索（ここが重要）
    const confirmSelectors = [
      "button.confirm",
      "button[type='submit']",
      ".confirm",
      "[data-action='confirm']",
      "button"
    ];

    let confirmed = false;

    for (const sel of confirmSelectors) {
      const btn = await page.$(sel);

      if (btn) {
        const text = await page.evaluate(e => e.textContent, btn);

        if (
          text.includes("予約") ||
          text.includes("確定") ||
          text.includes("OK")
        ) {
          console.log("確定ボタン押下:", text);
          await btn.click();
          confirmed = true;
          break;
        }
      }
    }

    if (!confirmed) {
      console.log("確定ボタンが見つからない可能性あり");
    }

    await page.waitForTimeout(3000);

    console.log("完了");

  } catch (err) {
    console.error("Error:", err.message);

    // 失敗時スクショ
    await page.screenshot({ path: "error.png", fullPage: true });

    // HTML保存
    const html = await page.content();
    fs.writeFileSync("debug.html", html);

  } finally {
    await browser.close();
  }
})();

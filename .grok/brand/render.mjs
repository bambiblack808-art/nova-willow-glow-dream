import { chromium } from "playwright";
import { pathToFileURL } from "node:url";

const shots = [
  {
    html: "/workspace/.grok/brand/og-card.html",
    out: "/workspace/.grok/og-raw.png",
    width: 1200,
    height: 630,
  },
  {
    html: "/workspace/.grok/brand/x-banner.html",
    out: "/workspace/.grok/x-banner-raw.png",
    width: 1200,
    height: 264,
  },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  for (const shot of shots) {
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 2,
    });
    await page.goto(pathToFileURL(shot.html).href, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    await page.screenshot({
      path: shot.out,
      clip: { x: 0, y: 0, width: shot.width, height: shot.height },
      type: "png",
    });
    await page.close();
    console.log("wrote", shot.out);
  }
} finally {
  await browser.close();
}

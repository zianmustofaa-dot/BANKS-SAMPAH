import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const htmlPath = resolve("../laporan-tugas3/Laporan_Tugas3_BankSampah_ZianMustofa_TIF3A_25080960002.html");
const pdfPath = resolve("../laporan-tugas3/Laporan_Tugas3_BankSampah_ZianMustofa_TIF3A_25080960002.pdf");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });

await page.evaluate(async () => {
  await Promise.all(
    Array.from(document.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          }),
    ),
  );
  await document.fonts.ready;
});

await page.waitForTimeout(600);
const imageInfo = await page.evaluate(() =>
  Array.from(document.images).map((img) => ({
    src: img.getAttribute("src"),
    complete: img.complete,
    width: img.naturalWidth,
    height: img.naturalHeight,
    shownWidth: img.clientWidth,
    shownHeight: img.clientHeight,
  })),
);
console.log(imageInfo);

await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate:
    '<div style="width:100%;font-family:Segoe UI,Arial,sans-serif;font-size:8px;color:#6b7280;padding:0 15mm;display:flex;justify-content:space-between;"><span>Bank Sampah Digital &middot; Laporan Tugas 3 &middot; Zian Mustofa</span><span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span></div>',
  margin: { top: "17mm", right: "15mm", bottom: "18mm", left: "15mm" },
});

console.log("PDF written:", pdfPath);
await browser.close();

import * as path from "path";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import {sleep} from "@inithink/utils";
import {Browser, chromium} from "playwright";
import fs from "fs";
import {xlsxToJSON} from "@inithink/xlsx-to-json";
import * as os from "os";
import {Options} from "./Options";
import {login} from "./login";


dayjs.extend(customParseFormat);
dayjs.extend(timezone);

const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), '11st-download'));

export interface Shop11stSellerPointsHistory {
  date: Date;
  value: number;
  title: string;
}

export interface Shop11stSellerPointsResult {
  histories: Shop11stSellerPointsHistory[],
  totalPoints: number
  usedPoints: number
  remainingPoints: number
}

export async function getShop11stSellerPointsHistory(
  {
    showLogs = false,
    headless = true,
    ...options
  }: Options
): Promise<Shop11stSellerPointsResult> {
  const browser: Browser = await chromium.launch({
    headless,
    slowMo: 30,
  });
  try {
    let context = await login(browser, options);
    let page = await context.newPage();
    await page.goto('https://soffice.11st.co.kr/view/8201', {waitUntil: "networkidle"});
    await sleep(500);
    const frame = page.frames().find(frame => {
      return frame.url() === 'https://soffice.11st.co.kr/loyalty/AuthSellerPointCondition.tmall?sellerType=02';
    })!;
    await frame.waitForLoadState("networkidle");
    await frame.selectOption('#searchApplyDt', 'RECENT_MONTH');
    await frame.click('.btn_srh_area button');

    context.on('page', async page => {
      page.on('download', download => download.path().then(console.log));
    });
    await frame.click('a.btn_exceld');
    showLogs && console.log('wait for new page');
    let download = await page.waitForEvent("download");
    let downloadPath = await download.path();
    let dest = options.downloadPath || path.join(downloadDir, download.suggestedFilename());
    fs.copyFileSync(downloadPath!, dest);

    await sleep(1000);
    let json = xlsxToJSON(dest);
    const {content} = json[0];
    const [, header, ...items] = content;

    let dateIndex = header.findIndex(it => it === '거래일시');
    let indexValue = header.findIndex(it => it === '거래금액');
    let titleValue = header.findIndex(it => it === '거래항목');


    let result: Shop11stSellerPointsHistory[] = [];
    for (const item of items) {
      let dateString = item[dateIndex];
      let valueString = item[indexValue].replaceAll(',', '');
      let date = dayjs(dateString, 'YYYY/MM/DD HH:mm:ss', 'Asia/Seoul').toDate();
      let history: Shop11stSellerPointsHistory = {
        title: item[titleValue],
        date,
        value: parseInt(valueString),
      };
      result.push(history);
    }
    let pointStrings: string[] = await frame.evaluate(() => {
      // @ts-ignore
      let totalPoint = document.querySelector('#table1 tbody tr:nth-child(2) td:nth-child(2) span').textContent;
      // @ts-ignore
      let usedPoint = document.querySelector('#table1 tbody tr:nth-child(2) td:nth-child(4) span').textContent;
      // @ts-ignore
      let remainingPoint = document.querySelector('#table1 tbody tr:nth-child(2) td:nth-child(6) span').textContent;
      return Promise.resolve([totalPoint, usedPoint, remainingPoint]);
    });
    let points = pointStrings
      .map(it => it.substring(0, it.indexOf(' Point')))
      .map(it => it.replaceAll(',', ''))
      .map(it => parseInt(it));
    return {
      histories: result,
      totalPoints: points[0],
      usedPoints: points[1],
      remainingPoints: points[2],
    };
  } finally {
    await browser.close();
  }
}

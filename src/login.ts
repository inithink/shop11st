import {Browser} from "playwright";
import {Options} from "./Options";
import {loadCookies} from "./loadCookies";
import {typeCredentialsIfNeeded} from "./typeCredentialsIfNeeded";
import {processOTPLoginIfNeeded} from "./processOTPLoginIfNeeded";
import {saveCookies} from "./saveCookies";

export async function login(browser: Browser, options: Options) {
  let context = await browser.newContext();
  options.showLogs && console.log('쿠키 복구');
  await loadCookies(context, options);
  let page = await context.newPage();
  // 로그인
  await page.goto('https://login.11st.co.kr/auth/front/selleroffice/login.tmall?returnURL=https%3A%2F%2Fsoffice.11st.co.kr%2Fview%2F8201%3FsellerType%3D02');

  await typeCredentialsIfNeeded(page, options);
  await processOTPLoginIfNeeded(page, options);

  options.showLogs && console.log('쿠키 저장');
  await saveCookies(context, options);
  return context;
}

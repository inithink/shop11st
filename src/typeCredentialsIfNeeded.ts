import {processOTPLoginIfNeeded} from "./processOTPLoginIfNeeded";
import {Page} from "playwright";
import {Options} from "./Options";

export async function typeCredentialsIfNeeded(page: Page, options: Options) {
  let url = page.url();

  if (url.startsWith('https://login.11st.co.kr/auth/front/selleroffice/login.tmall')) {
    options.showLogs && console.log('로그인 정보 입력');
    await page.type('#user-id', options.id);
    await page.type('#passWord', options.password);
    await page.click('#loginbutton > span');
    await page.waitForNavigation({
      waitUntil: "networkidle"
    });
    await processOTPLoginIfNeeded(page, options);
  }
}

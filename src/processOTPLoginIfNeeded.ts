import {getEmailAuthCode} from "./getEmailAuthCode";
import {sleep, waitForCondition} from "@inithink/utils";
import {Page} from "playwright";
import {Options} from "./Options";

export async function processOTPLoginIfNeeded(page: Page, options: Options) {
  let url = page.url();
  if (url.startsWith('https://login.11st.co.kr/auth/front/otpLoginForm')) {
    // 인증이 필요한 경우
    options.showLogs && console.log('OTP 처리 입력');
    await page.waitForSelector('#tbodyContacts > tr:nth-child(3) input');
    await page.click('#tbodyContacts > tr:nth-child(3) .radio-style__1');
    await page.click('.c_table_auth_button > button');
    await page.waitForSelector('ul > li:nth-child(2) .radio-style__1');
    await page.click('ul > li:nth-child(2) .radio-style__1');

    page.once('dialog', async dialog => {
      options.showLogs && console.log('확인창: ', dialog.message());
      await dialog.accept();
    });
    await page.click('#auth_email_otp ');
    let code: string | null = null;
    await waitForCondition(async () => {
      options.showLogs && console.log('이메일 확인중...');
      code = await getEmailAuthCode(options.email);
      await sleep(1000);
      return code !== null;
    }, 300);

    await page.evaluate('updateOTPForm()');
    await page.type('#auth_num_email', `${code}`);
    await page.evaluate('login()');
    await page.waitForNavigation({
      waitUntil: "networkidle",
    });
  }
}

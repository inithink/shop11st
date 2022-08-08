import * as fs from "fs";
import * as path from "path";
import {BrowserContext} from "playwright";
import {Options} from "./Options";

export async function loadCookies(context: BrowserContext, options: Options) {
  try {
    let cookiePath = options.cookiePath || path.join(__dirname, '../cookies.json');
    const cookiesString = fs.readFileSync(cookiePath, 'utf-8');
    const cookies = JSON.parse(cookiesString);
    await context.addCookies(cookies);
  } catch (e) {
  }
}

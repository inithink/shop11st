import * as fs from "fs";
import path from "path";
import {BrowserContext} from "playwright";
import {Options} from "./Options";

export async function saveCookies(context: BrowserContext, options: Options) {
  const cookies = await context.cookies();
  let cookiePath = options.cookiePath || path.join(__dirname, '../cookies.json');
  await fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
}

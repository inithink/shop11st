import {getEmails} from "@inithink/get-emails";
import Imap from "imap";

export async function getEmailAuthCode(config: Imap.Config): Promise<string | null> {
  let emails = await getEmails({
    imap: config,
    criteria: ['ALL', ['HEADER', 'FROM', 'admin@11st.co.kr']],
    filterByHeader: header => header.subject.indexOf('[11번가] ') !== -1
  });
  for (const email of emails) {
    if (email.html) {
      const matches = email.html.match(/\[(\d{6})]/);
      if (matches) {
        if (Date.now() - email.header.date.getTime() <= 10 * 60 * 1000) {
          return matches[1];
        }
      }
    }
  }
  return null;
}

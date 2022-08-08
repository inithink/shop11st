import Imap from "imap";

export interface Options {
  id: string,
  password: string,
  email: Imap.Config;
  showLogs?: boolean
  headless?: boolean
  cookiePath?: string
  downloadPath?: string
}

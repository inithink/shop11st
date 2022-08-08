import {getShop11stSellerPointsHistory} from "./index";

require('dotenv').config();

jest.setTimeout(3 * 60 * 1000);

test('test', async () => {
  let result = await getShop11stSellerPointsHistory({
    id: process.env['SHOP_11ST_USERNAME']!,
    password: process.env['SHOP_11ST_PASSWORD']!,
    email: {
      user: process.env['EMAIL_USERNAME']!,
      password: process.env['EMAIL_PASSWORD']!,
      host: process.env['EMAIL_HOST']!,
      port: 993,
      tls: true,
    },
    headless: false,
    showLogs: true,
  });
  console.log(result);
});

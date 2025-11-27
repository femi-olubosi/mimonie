const axios = require("axios");
require("dotenv").config();
const { generateSignature } = require("./palmpayUtil");

// const requestBody = {
//   requestTime: 1726048905583,
//   version: "V1.1",
//   nonceStr: "c9e7c64f2a0245e5814709bfab1b4c61",
//   amount: 10000,
//   notifyUrl: "https://webhook.site/7da52d0e-e021-46a4-a477-b3e8d7a81050",
//   orderId: "300305d48521d11i",
//   currency: "NGN",
//   customerInfo:
//     '{"phone":"23407065413489","firstName":"DAMILARE SAMUEL","lastName":"OGUNNAIKE","email":"n.kerantzakis\\u002Bng@kaizengaming.com"}',
// };

// const requestBody = {
//   bankCode: "044",
//   merchantId: "124072209593191",
//   nonceStr: "xB2qwbm7Ybea6pWj68lomyDdXpM2P9iN",
//   requestTime: 1758101688094,
//   version: "V2.0",
// };
const requestBody = {
  requestTime: 1759912745519,
  version: "V1.1",
  nonceStr: "d1e7663bd09305da054ea900d6ed3470",
  amount: 50,
  currency: "NGN",
  orderId: "gn0lk0aoj1fd6u63qfr3wxyu36pevxu4hfvt",
  title: "BetChief Payment",
  description: "Payment for BetChief services",
  notifyUrl: "",
  callBackUrl: "User Frontend Url",
  goodsDetails: '[{"goodsId":"1"}]',
  customerInfo:
    '{"userId":"11","userName":"OTgxODU1NjM0Nw==","phone":"9818556347","email":"sakumar@gammastack.com"}',
  remark: "BetChief payment",
};
// Wrap it in PEM format
const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${process.env.TEST_PRIVATE_KEY}\n-----END PRIVATE KEY-----`;
const signature = generateSignature(requestBody, privateKeyPEM);

axios
  .post(
    `${process.env.TEST_BASE_URL}/api/v2/payment/merchant/createorder`,
    requestBody,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TEST_APP_ID}`,
        CountryCode: "NG",
        "Accept-Encoding": "gzip",
        Signature: signature,
      },
    }
  )
  .then((res) => {
    console.log(res.data);
  })
  .catch((err) => {
    console.error(err);
  });

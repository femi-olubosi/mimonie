const axios = require('axios');
const crypto = require('crypto');
const { generateSignature } = require('../palmpayConfig/palmpayUtil');

const PALM_PAY_BASE_URL = process.env.PALM_PAY_BASE_URL;
const BILLER_APP_ID = process.env.APP_ID;

const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${process.env.PALM_PAY_PRIVATE_KEY}\n-----END PRIVATE KEY-----`;

const palmpayClient = {
  palmpayRequest: async (endpoint, params = {}) => {
    const body = {
      requestTime: Date.now(),
      nonceStr: crypto.randomBytes(16).toString('hex'),
      version: 'V2',
      ...params,
    };

    const signature = generateSignature(body, privateKeyPEM);

    const response = await axios.post(`${PALM_PAY_BASE_URL}${endpoint}`, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BILLER_APP_ID}`,
        CountryCode: 'NG',
        Signature: signature,
      },
    });

    return response.data;
  },
};

module.exports = palmpayClient;

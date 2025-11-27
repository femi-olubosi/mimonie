const axios = require('axios');
const crypto = require('crypto');
const { generateEaseIdSignature } = require('../utils/helper');

const EASE_ID_BASE_URL = process.env.EASE_ID_BASE_URL;
const EASE_ID_PRIVATE_KEY = process.env.EASE_ID_PRIVATE_KEY;
const EASE_ID_APP_ID = process.env.EASE_ID_APP_ID;

const easeIdService = {
  async inquireNIN(nin) {
    try {
      if (!nin) throw new Error('NIN is required');
      if (!EASE_ID_BASE_URL || !EASE_ID_PRIVATE_KEY || !EASE_ID_APP_ID) {
        throw new Error('Missing EaseID environment variables');
      }

      const url = `${EASE_ID_BASE_URL}/validator-service/open/nin/inquire`;

      const payload = {
        version: 'V1.1',
        nonceStr: crypto.randomBytes(16).toString('hex'),
        requestTime: Date.now(),
        nin,
      };

      // Generate signature
      const signature = generateEaseIdSignature(payload, EASE_ID_PRIVATE_KEY);

      // Send request
      const { data } = await axios.post(url, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          CountryCode: 'NG',
          Authorization: `Bearer ${EASE_ID_APP_ID}`,
          Signature: signature,
        },
        timeout: 90000,
      });

      return data;
    } catch (error) {
      const msg = error.response
        ? `[${error.response.status}] ${JSON.stringify(error.response.data)}`
        : error.message;

      console.error('❌ NIN Inquiry Failed:', msg);
      throw new Error(msg);
    }
  },

  async compareFace(sourceImageBase64, targetImageBase64) {
    try {
      if (!sourceImageBase64) throw new Error('sourceImage is required');
      if (!targetImageBase64) throw new Error('targetImage is required');
      if (!EASE_ID_BASE_URL || !EASE_ID_PRIVATE_KEY || !EASE_ID_APP_ID) {
        throw new Error('Missing EaseID environment variables');
      }

      const url = `${EASE_ID_BASE_URL}/easeid-kyc-service/facecapture/compare`;

      const payload = {
        version: 'V1.1',
        nonceStr: crypto.randomBytes(16).toString('hex'),
        requestTime: Date.now(),
        appId: EASE_ID_APP_ID,
        sourceImage: sourceImageBase64,
        targetImage: targetImageBase64,
      };

      const signature = generateEaseIdSignature(payload, EASE_ID_PRIVATE_KEY);

      const { data } = await axios.post(url, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          CountryCode: 'NG',
          Authorization: `Bearer ${EASE_ID_APP_ID}`,
          Signature: signature,
        },
        timeout: 90000,
      });

      return data;
    } catch (error) {
      const msg = error.response
        ? `[${error.response.status}] ${JSON.stringify(error.response.data)}`
        : error.message;

      console.error('❌ Face Compare Failed:', msg);
      throw new Error(msg);
    }
  },
};

module.exports = easeIdService;

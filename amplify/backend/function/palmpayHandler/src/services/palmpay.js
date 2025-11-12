const { signRequest } = require('../utils/helper');
const axios = require('axios');

const PALMPAY_API_BASE = process.env.BASE_URL;
const MERCHANT_ID = process.env.PALMPAY_MERCHANT_ID;

const palmpayService = {
  fetchAllBillers: async () => {
    const url = `${PALMPAY_API_BASE}/queryBiller`;
    const payload = signRequest({ merchantId: MERCHANT_ID });
    const response = await axios.post(url, payload);
    return response.data;
  },

  fetchBillerById: async (billerId) => {
    const url = `${PALMPAY_API_BASE}/queryBiller`;
    const payload = signRequest({ merchantId: MERCHANT_ID, billerId });
    const response = await axios.post(url, payload);
    return response.data;
  },

  fetchBillerItems: async (billerId) => {
    const url = `${PALMPAY_API_BASE}/queryItem`;
    const payload = signRequest({ merchantId: MERCHANT_ID, billerId });
    const response = await axios.post(url, payload);
    return response.data;
  },
};

module.exports = palmpayService;

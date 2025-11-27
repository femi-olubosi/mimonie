const { signRequest } = require('../utils/helper');
const axios = require('axios');

const BILLER_BASE_URL = process.env.BILLER_BASE_URL;
const BILLER_MERCHANT_ID = process.env.BILLER_MERCHANT_ID;

const billerService = {
  fetchAllBillers: async () => {
    const url = `${BILLER_BASE_URL}/queryBiller`;
    const payload = signRequest({ merchantId: BILLER_MERCHANT_ID });
    const response = await axios.post(url, payload);
    return response.data;
  },

  fetchBillerById: async (billerId) => {
    const url = `${BILLER_BASE_URL}/queryBiller`;
    const payload = signRequest({ merchantId: BILLER_MERCHANT_ID, billerId });
    const response = await axios.post(url, payload);
    return response.data;
  },

  fetchBillerItems: async (billerId) => {
    const url = `${BILLER_BASE_URL}/queryItem`;
    const payload = signRequest({ merchantId: BILLER_MERCHANT_ID, billerId });
    const response = await axios.post(url, payload);
    return response.data;
  },
};

module.exports = billerService;

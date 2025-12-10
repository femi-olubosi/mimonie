const palmpayClient = require('../api/palmpayClient');

const billerService = {
  fetchAllBillers: () =>
    palmpayClient.palmpayRequest('/bill-payment/biller/query', {
      sceneCode: 'airtime',
    }),

  fetchBillerItemByBillerId: (billerId) =>
    palmpayClient.palmpayRequest('/bill-payment/item/query', {
      billerId,
      sceneCode: 'airtime',
    }),
};

module.exports = billerService;

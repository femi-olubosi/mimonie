const palmpayService = require('../services/palmpay');

const billerController = {
  getAllBillers: async (req, res) => {
    try {
      const billers = await palmpayService.fetchAllBillers();
      res.json(billers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch billers' });
    }
  },

  getBillerById: async (req, res) => {
    try {
      const { billerId } = req.params;
      const biller = await palmpayService.fetchBillerById(billerId);
      res.json(biller);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch biller' });
    }
  },

  getBillerItems: async (req, res) => {
    try {
      const { billerId } = req.params;
      const items = await palmpayService.fetchBillerItems(billerId);
      res.json(items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  },
};

module.exports = billerController;

const billerService = require('../services/biller');

const billerController = {
  getAllBillers: async (req, res) => {
    try {
      const billers = await billerService.fetchAllBillers();
      res.json(billers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch billers' });
    }
  },

  getBillerById: async (req, res) => {
    try {
      const { billerId } = req.params;
      const biller = await billerService.fetchBillerById(billerId);
      res.json(biller);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch biller' });
    }
  },

  getBillerItems: async (req, res) => {
    try {
      const { billerId } = req.params;
      const items = await billerService.fetchBillerItems(billerId);
      res.json(items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  },
};

module.exports = billerController;

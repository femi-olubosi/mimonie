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

  getBillerItem: async (req, res) => {
    const { billerId } = req.query;

    if (!billerId) {
      return res
        .status(400)
        .json({ error: 'billerId query parameter is required' });
    }

    try {
      const billers = await billerService.fetchBillerItem(billerId);
      res.json(billers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch billers' });
    }
  },
};

module.exports = billerController;

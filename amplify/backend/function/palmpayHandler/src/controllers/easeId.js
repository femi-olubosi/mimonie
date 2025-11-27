const easeIdService = require('../services/easeId');

const easeIdController = {
  async inquireNIN(req, res) {
    try {
      const { nin } = req.body;

      if (!nin) {
        return res.status(400).json({ error: 'nin is required' });
      }

      const result = await easeIdService.inquireNIN(nin);
      return res.json(result);
    } catch (error) {
      console.error('❌ [Controller] Failed to inquire nin:', error.message);
      return res.status(500).json({ error: 'Failed to inquire nin' });
    }
  },

  async compareFace(req, res) {
    try {
      const { sourceImage, targetImage } = req.body;

      if (!sourceImage || !targetImage) {
        return res.status(400).json({
          error: 'sourceImage and targetImage are required',
        });
      }

      const result = await easeIdService.compareFace(sourceImage, targetImage);
      return res.json(result);
    } catch (error) {
      console.error('❌ [Controller] Face compare failed:', error.message);
      return res.status(500).json({ error: 'Face comparison failed' });
    }
  },
};

module.exports = easeIdController;

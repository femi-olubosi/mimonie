const fs = require('fs');
const path = require('path');

module.exports = function withSmileIdentity(config) {
  // Read the smile_config.json file
  const smileConfigPath = path.resolve(__dirname, 'smile_config.json');
  const smileConfig = JSON.parse(fs.readFileSync(smileConfigPath, 'utf8'));

  // Add the smileConfig to the app.json configuration
  config.extra = config.extra || {};
  config.extra.smileIdentity = smileConfig;

  return config;
};

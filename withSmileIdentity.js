// withSmileIdentity.js
const fs = require('fs');
const path = require('path');

module.exports = function withSmileIdentity(config) {
  // Read the smile_config.json file
  const smileConfigPath = path.resolve(__dirname, 'smile_config.json');
  const smileConfig = JSON.parse(fs.readFileSync(smileConfigPath, 'utf8'));

  return {
    ...config,
    extra: {
      ...config.extra,
      smileIdentity: smileConfig,
    },
  };
};

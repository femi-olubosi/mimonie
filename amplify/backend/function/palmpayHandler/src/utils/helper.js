const forge = require('node-forge');

const PRIVATE_KEY = process.env.PALMPAY_PRIVATE_KEY;

/**
 * Signs a payload with RSA SHA256
 * @param {Object} payload - request payload
 * @returns {Object} - original payload + signature
 */
const signRequest = (payload) => {
  const payloadString = JSON.stringify(payload);

  // Convert PEM private key to forge private key
  const privateKey = forge.pki.privateKeyFromPem(PRIVATE_KEY);

  // Create SHA256 signature
  const md = forge.md.sha256.create();
  md.update(payloadString, 'utf8');
  const signature = forge.util.encode64(privateKey.sign(md));

  // Return payload with signature field (PalmPay expects "signature")
  return {
    ...payload,
    signature,
  };
};

module.exports = {
  signRequest,
};

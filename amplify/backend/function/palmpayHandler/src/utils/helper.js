const crypto = require('crypto');
const md5 = require('md5');
const fs = require('fs');
const path = require('path');

/**
 * Generate RSA-based signature for PalmPay API request
 * @param {Object} params - Request body or query parameters
 * @returns {Object} - { payload: signedPayload, signature: base64Signature }
 */
function signRequest(params) {
  // 1️⃣ Add required meta fields
  const fullPayload = {
    ...params,
    requestTime: Date.now(),
    nonceStr: crypto.randomBytes(16).toString('hex'),
    version: 'V2.0',
  };

  // 2️⃣ Read private key from file
  const privateKey = fs.readFileSync(
    path.resolve(__dirname, '../palmpay-private.pem'),
    'utf8'
  );

  // 3️⃣ Sort parameters alphabetically by key
  const sortedKeys = Object.keys(fullPayload).sort();
  const sortedParams = sortedKeys
    .map((key) => `${key}=${fullPayload[key]}`)
    .join('&');

  // 4️⃣ Sign with RSA-SHA256
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(sortedParams);
  signer.end();

  const signature = signer.sign(privateKey, 'base64');

  return { payload: fullPayload, signature };
}

// function generateEaseIdSignature(params, privateKey) {
//   const formattedKey = formatPrivateKey(privateKey);

//   const sortedKeys = Object.keys(params).sort();

//   const formattedString = sortedKeys
//     .map(key => `${key}=${params[key]}`)
//     .join("&");

//   const md5Hash = crypto
//     .createHash("md5")
//     .update(formattedString, "utf8")
//     .digest("hex");

//   const signature = crypto.privateEncrypt(
//     {
//       key: formattedKey,
//       padding: crypto.constants.RSA_PKCS1_PADDING,
//     },
//     Buffer.from(md5Hash)
//   );

//   return signature.toString("base64");
// }

function generateEaseIdSignature(body, privateKeyPEM) {
  // 1. Sort and format
  const sorted = Object.keys(body)
    .sort()
    .map((key) => `${key}=${body[key]}`)
    .join('&');

  console.log('Sorted Params:', sorted);

  // 2. MD5 (uppercase)
  const hash = md5(sorted).toUpperCase();
  console.log('MD5 Digest:', hash);

  // 3. RSA-SHA1 sign
  const signer = crypto.createSign('RSA-SHA1');
  signer.update(hash);
  signer.end();

  const signature = signer.sign(formatPrivateKey(privateKeyPEM), 'base64');
  return signature;
}

function formatPrivateKey(key) {
  if (key.includes('BEGIN RSA PRIVATE KEY')) return key;

  const formatted = [
    '-----BEGIN RSA PRIVATE KEY-----',
    key.match(/.{1,64}/g).join('\n'),
    '-----END RSA PRIVATE KEY-----',
  ].join('\n');

  return formatted;
}

module.exports = { signRequest, generateEaseIdSignature };

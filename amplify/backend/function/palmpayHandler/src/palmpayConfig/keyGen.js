const crypto = require("crypto");
const fs = require("fs");

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki", // X.509 standard
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8", // PKCS#8 standard
    format: "pem",
  },
});

// Write keys to files
fs.writeFileSync("private_key.pem", privateKey);
fs.writeFileSync("public_key.pem", publicKey);

console.log("Keys written to private_key.pem and public_key.pem");

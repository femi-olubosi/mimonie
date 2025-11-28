const { verifySignature } = require('./palmpayUtil');
require('dotenv').config();

const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\n${process.env.PALMPAY_TEST_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;

const notifyData = {
  accountReference: 'SEILJBYI',
  orderNo: 'MI1968609598957031424',
  payerAccountNo: '8108080730',
  orderStatus: 1,
  payerBankName: 'PALMPAY_INNER',
  updateTime: 1758188078046,
  sessionId: '100033250918093437040000000008PP',
  virtualAccountName: '',
  reference: 'JOSHUA THOMPSONBROWN ISAAC:8108080730',
  orderAmount: 100000,
  createdTime: 1758188078046,
  currency: 'NGN',
  payerAccountName: 'JOSHUA THOMPSONBROWN ISAAC',
  virtualAccountNo: '6647071850',
  appId: 'L231204055835021842101',
  sign: 'NIuilgw1BHU4xi%2FGm1gpUIX%2BWfYJYUCnOqRPOgOEc%2FYVq6ONZ3WjYo%2BLabAJ9xUxXHCCyzcDWdpiuE07fyHgT3YzfrMH%2Fzr0tWU6CM%2By7bx4VaqK0cVI7LKRdU9yGgMc%2Fnkoav%2BGf%2FK1lyA4DP18wdZ0AkypM23d8lXggcCjWcY%3D',
};
const isVerified = verifySignature(notifyData, publicKeyPEM);

console.log('Signature Verification: ', isVerified);

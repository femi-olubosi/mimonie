const PAYSTACK_SECRET_KEY_LIVE = process.env.PAYSTACK_SECRET_KEY_LIVE;
const https = require('https');

async function makePaystackRequest(endpoint, method, data) {
  const url = `https://api.paystack.co${endpoint}`;
  const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY_LIVE}`,
    'Content-Type': 'application/json',
  };

  const options = {
    method,
    headers,
    hostname: 'api.paystack.co',
    path: endpoint,
    port: 443,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (!res.statusCode || res.statusCode >= 400) {
            throw new Error(result.message || 'Something went wrong');
          }
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST' || method === 'PUT') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function chargeAndSplitPayment(subaccount_code, payer, amount) {
  const transactionCharge = Math.round(amount * 0.045);
  const adjustedAmount = amount + transactionCharge;

  const data = {
    email: payer.email,
    amount: `${adjustedAmount * 100}`,
    authorization_code: payer.auth_url,
    subaccount: subaccount_code,
    transaction_charge: `${transactionCharge * 100}`,
    bearer: 'account',
    metadata: JSON.stringify({
      custom_fields: [
        {
          display_name: 'Purpose',
          variable_name: 'purpose',
          value: 'Contribution',
        },
      ],
    }),
  };

  try {
    return await makePaystackRequest('/transaction/charge_authorization', 'POST', data);
  } catch (error) {
    return error.message || 'Error processing payment. Please try again';
  }
}

async function chargeCardForPersonalContribution(payer, amount) {
  const transactionCharge = Math.round(amount * 0.035);
  const adjustedAmount = amount + transactionCharge;

  const data = {
    email: payer.email,
    amount: `${adjustedAmount * 100}`,
    authorization_code: payer.auth_url,
    bearer: 'account',
    metadata: JSON.stringify({
      custom_fields: [
        {
          display_name: 'Purpose',
          variable_name: 'purpose',
          value: 'Contribution',
        },
      ],
    }),
  };

  try {
    return await makePaystackRequest('/transaction/charge_authorization', 'POST', data);
  } catch (error) {
    console.log('charge error', error);
    return error.message || 'Error processing payment. Please try again';
  }
}

async function transferToBank(recipient_code, amount, contribution) {
  const data = {
    recipient: recipient_code,
    amount: amount * 100,
    source: 'balance',
    reason: `owner's fee for ${contribution.name}`,
  };

  return await makePaystackRequest('/transfer', 'POST', data);
}

module.exports = {
  makePaystackRequest,
  chargeAndSplitPayment,
  chargeCardForPersonalContribution,
  transferToBank
};
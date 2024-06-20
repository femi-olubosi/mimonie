export const verifyBVN = async (customer_codes, datas) => {
  const customer_code = 'CUS_vt4djmq0rc6qpbx';
  const data = {
    country: 'NG',
    type: 'bank_account',
    account_number: '0111111111',
    bvn: '222222222221',
    bank_code: '007',
    first_name: 'Uchenna',
    last_name: 'Okoro',
  };

  const url = `https://api.paystack.co/customer/${customer_code}/identification`;
  const authorization = 'Bearer YOUR_SECRET_KEY';
  const contentType = 'application/json';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': contentType,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }

    console.log(result);
    return result;
  } catch (error) {
    console.error('Error verifying BVN:', error);
    throw error;
  }
};

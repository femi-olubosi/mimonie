import { DataStore } from 'aws-amplify/datastore';
import { Contribution, UserActivity, UserCardDetails } from '../src/models';

const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PRIVATE_KEY_TEST;
const PAYSTACK_SECRET_KEY_LIVE = process.env.EXPO_PUBLIC_PAYSTACK_PRIVATE_KEY;

const makePaystackRequest = async (endpoint, method, data) => {
  const url = `https://api.paystack.co${endpoint}`;
  const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY_LIVE}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    return result;
  } catch (error) {
    console.error(`Error making ${method} request to ${endpoint}:`, error);
    throw error;
  }
};

export const calculateDifference = (startDate, variant) => {
  const start = new Date(startDate);
  const now = new Date();
  let difference;

  switch (variant) {
    case 'days':
      difference = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      break;
    case 'weeks':
      difference = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7));
      break;
    case 'months':
      difference =
        (now.getFullYear() - start.getFullYear()) * 12 +
        now.getMonth() -
        start.getMonth();
      break;
    default:
      difference = 0;
  }

  return difference;
};

export const processContributions = async () => {
  try {
    // Fetch all contributions
    const contributions = await DataStore.query(Contribution, (c) =>
      c.status.eq('running')
    );

    // Iterate through each contribution
    for (const contribution of contributions) {
      const currentCount = calculateDifference(
        contribution.start_date,
        contribution.variant
      );

      if (contribution.current_count !== contribution.num_of_month) {
        await DataStore.save(
          Contribution.copyOf(contribution, (updated) => {
            updated.current_count = currentCount;
          })
        );
      }

      // Convert currently_at to an integer if it is not already
      const currentAt = parseInt(contribution.currently_at) || 0;
      // Skip if currently_at matches currentCount or if currentCount is 0 (same day as start date)
      if (currentAt === currentCount || currentCount === 0) continue;

      const participants = JSON.parse(contribution?.participant || ['[]']);
      // console.log(currentCount);
      // console.log(participants);
      // return;
      const inProgressParticipant = participants.find(
        (p) => p.status === 'in progress'
      );

      if (!inProgressParticipant) {
        console.error(
          `No participant with status 'in progress' found for contribution ${contribution.id}`
        );
        continue;
      }

      let allPaymentsSuccessful = true;
      let paymentsProcessed = false;
      // Process payments for each participant
      for (const participant of participants) {
        if (
          participant.status !== 'in progress' &&
          participant.last_successful_round !== currentCount
        ) {
          // console.log(
          //   'update',
          //   participant.name,
          //   participant.last_successful_round
          // );

          const flow = await chargeAndSplitPayment(
            inProgressParticipant.subaccount_code,
            participant,
            contribution.amount
          );

          if (flow.data.status === 'success') {
            // if (true) {
            participant.contributions = (participant.contributions || 0) + 1;
            participant.last_successful_round = currentCount;
            paymentsProcessed = true;

            // Save user activity for Contribution
            await DataStore.save(
              new UserActivity({
                userId: participant.userId,
                type: 'contribution',
                amount: contribution.amount,
                description: `Paid ${inProgressParticipant.name} for ${contribution.name}`,
              })
            );

            // Save user activity for Receiver
            await DataStore.save(
              new UserActivity({
                userId: inProgressParticipant.userId,
                type: 'collection',
                amount: contribution.amount,
                description: `Received payment from ${participant.name} for ${contribution.name}`,
              })
            );

            await DataStore.save(
              Contribution.copyOf(contribution, (updated) => {
                updated.participant = participants;
              })
            );
          } else {
            await DataStore.save(
              new UserActivity({
                userId: participant.userId,
                type: 'contribution',
                amount: contribution.amount,
                description: `Failed to make payment to ${inProgressParticipant.name} for ${contribution.name}. Please fund your account`,
              })
            );
            // console.error(
            //   `Failed to deduct amount from participant ${participant.name}`
            // );
            allPaymentsSuccessful = false;
          }
        }
      }

      if (allPaymentsSuccessful && paymentsProcessed) {
        // Save user activity for final Collection
        await DataStore.save(
          new UserActivity({
            userId: inProgressParticipant.userId,
            type: 'collection',
            amount: contribution.amount * (participants.length - 1),
            description: `Final collection for ${contribution.name}`,
          })
        );

        for (const participant of participants[0]) {
          participant.last_successful_round = currentCount;
        }

        // Update in-progress participant's status to received
        inProgressParticipant.status = 'received';

        // Update other participants' statuses for the next cycle
        const nextParticipant = participants.find(
          (p) => p.status === 'pending'
        );
        if (nextParticipant) {
          nextParticipant.status = 'in progress';
        }

        const allReceived = participants.every(
          (participant) => participant.status === 'received'
        );
        // Save the updated participants
        await DataStore.save(
          Contribution.copyOf(contribution, (updated) => {
            updated.participant = participants;
            updated.currently_at = currentCount;
            if (allReceived) {
              updated.status = 'completed';
            }
          })
        );
      }
    }
  } catch (error) {
    console.error('Error processing contributions:', error);
  }
};

export const chargeAndSplitPayment = async (subaccount_code, payer, amount) => {
  const data = {
    email: payer.email,
    amount: `${amount * 100}`,
    // amount: 10000,
    authorization_code: payer.auth_url,
    subaccount: subaccount_code,
    transaction_charge: 500,
    // bearer: 'subaccount',
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
  return await makePaystackRequest(
    '/transaction/charge_authorization',
    'POST',
    data
  );
};

export const verifyTransaction = async (reference, currentUser) => {
  try {
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY_LIVE}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData = await verificationResponse.json();
    console.log('veri', responseData);
    if (responseData.status && responseData.data) {
      const { authorization, customer } = responseData.data;
      const previousCards = await DataStore.query(UserCardDetails, (c) =>
        c.userId.eq(currentUser.userId)
      );

      await Promise.all(
        previousCards.map(async (card) => {
          await DataStore.save(
            UserCardDetails.copyOf(card, (updated) => {
              updated.status = 'inactive';
            })
          );
        })
      );

      // Store the card details using DataStore
      await DataStore.save(
        new UserCardDetails({
          bank: authorization.bank,
          last4: authorization.last4,
          userId: currentUser.userId,
          type: authorization.card_type,
          expiry: `${authorization.exp_month}/${authorization.exp_year}`,
          authorization_code: authorization.authorization_code,
          status: 'active',
        })
      );

      const userContributions = await DataStore.query(Contribution, (c) =>
        c.participant_ids.contains(currentUser.userId)
      );

      if (userContributions.length > 0) {
        await Promise.all(
          userContributions.map(async (contribution) => {
            const participants = JSON.parse(contribution.participant);

            const updatedParticipants = participants.map((participant) =>
              participant.userId === currentUser.userId
                ? { ...participant, auth_url: authorization.authorization_code }
                : participant
            );

            await DataStore.save(
              Contribution.copyOf(contribution, (updated) => {
                updated.participant = JSON.stringify(updatedParticipants);
              })
            );
          })
        );
      }

      return authorization;
    } else {
      console.error('Verification failed:', responseData.message);
      return responseData.message;
    }
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return error;
  }
};

export const createPaystackCustomer = async (
  email,
  first_name,
  last_name,
  phone
) => {
  const data = { email, first_name, last_name, phone };
  return await makePaystackRequest('/customer', 'POST', data);
};

export const getPaystackCustomer = async (customer_code) => {
  return await makePaystackRequest(`/customer/${customer_code}`, 'GET');
};

export const verifyBVN = async (input, userProfile) => {
  const customer_code = userProfile.customer_code;
  const first_name = userProfile.name.split(' ')[0];
  const last_name = userProfile.name.split(' ')[1];

  const data = {
    country: 'NG',
    type: 'bank_account',
    account_number: input.accountNumber,
    bvn: input.bvn,
    bank_code: input.bank_code,
    first_name,
    last_name,
  };
  console.log({ data });
  return await makePaystackRequest(
    `/customer/${customer_code}/identification`,
    'POST',
    data
  );
};

export const createSubAccount = async (userProfile) => {
  const data = {
    business_name: `${userProfile.name}`,
    settlement_bank: userProfile.bank_details.bank_code,
    account_number: userProfile.bank_details.account_number,
    percentage_charge: 20,
  };

  return await makePaystackRequest('/subaccount', 'POST', data);
};

export const fetchBanks = async () => {
  try {
    const { data } = await makePaystackRequest(`/bank`, 'GET');
    return data.map((bank) => ({
      value: bank.code,
      label: bank.name,
    }));
  } catch (error) {
    console.error('Error fetching banks:', error);
    throw error;
  }
};

export const fetchCountries = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const countries = await response.json();
    const countryNames = countries
      .map((country) => country.name.common)
      .sort((a, b) => (a > b ? 1 : -1));

    return countryNames.map((e) => ({ label: e, value: e }));
  } catch (error) {
    console.error('Error fetching country names:', error);
    return [];
  }
};

export const fetchCards = async (setUserCards, currentUser) => {
  await DataStore.start();
  try {
    const userCards = await DataStore.query(UserCardDetails, (c) =>
      c.userId.eq(currentUser.userId)
    );
    setUserCards(userCards);
    return userCards;
  } catch (error) {
    console.error('Error fetching user user cards:', error);
    return [];
  }
};

export const deleteCards = async (id, setUserCards, currentUser) => {
  try {
    // Query for the contribution to be deleted
    const toDelete = await DataStore.query(UserCardDetails, id);

    // Check if the contribution exists
    if (toDelete) {
      // Delete the contribution

      await DataStore.delete(toDelete);
      console.log(`Card with ID ${id} deleted successfully.`);
      await fetchCards(setUserCards, currentUser);
    } else {
      console.log(`card with ID ${id} not found.`);
    }
  } catch (error) {
    console.error(`Error deleting card with ID ${id}:`, error);
  }
};

export const createDedicatedVirtualAccount = async (customer_code) => {
  const data = {
    preferred_bank: 'wema-bank',
    customer: customer_code,
  };
  return await makePaystackRequest('/dedicated_account', 'POST', data);
};

export const fetchTransferRecipient = async (account_number) => {
  const { data: recipients } = await makePaystackRequest('/transferrecipient');

  const dvaRecipient = recipients.find(
    (recipient) => recipient.details.account_number === account_number
  );
  if (!dvaRecipient) {
    throw new Error('DVA recipient not found');
  }
  return dvaRecipient.recipient_code;
};

export const createTransferRecipientForDVA = async (details) => {
  const data = {
    type: 'nuban',
    name: details.account_name,
    account_number: details.account_number,
    bank_code: '035',
    currency: 'NGN',
  };
  const response = await makePaystackRequest(
    '/transferrecipient',
    'POST',
    data
  );
  return response.data.recipient_code;
};

export const createTransferRecipientForBank = async (userProfile) => {
  const data = {
    type: 'nuban',
    name: userProfile.name,
    account_number: userProfile.bank_details.account_number,
    bank_code: userProfile.bank_details.bank_code,
    currency: 'NGN',
  };
  const response = await makePaystackRequest(
    '/transferrecipient',
    'POST',
    data
  );
  return response.data.recipient_code;
};

export const fetchTransferRecipients = async (account_number) => {
  return await makePaystackRequest('/transferrecipient');
};

export const chargeAndTransferToDva = async (
  customer,
  dvaRecipientCode,
  amount
) => {
  const data = {
    email: customer.email,
    amount: `${amount * 100}`,
    authorization_code: customer.auth_url,
    metadata: JSON.stringify({
      custom_fields: [
        {
          display_name: 'Purpose',
          variable_name: 'purpose',
          value: 'Personal Contribution',
        },
      ],
    }),
  };

  try {
    const { data: chargeResponse } = await makePaystackRequest(
      '/transaction/charge_authorization',
      'POST',
      data
    );
    console.log('chargeResponse', chargeResponse);
    if (chargeResponse.status !== 'success') {
      throw new Error('Card charge failed');
    }

    const transferData = {
      source: 'balance',
      amount: `${amount * 100}`,
      recipient: dvaRecipientCode,
      reason: 'Transfer to DVA for contribution',
    };

    const { data: transferResponse } = await makePaystackRequest(
      '/transfer',
      'POST',
      transferData
    );
    console.log('transferResponse', transferResponse);
    if (transferResponse.status !== 'success') {
      throw new Error('Transfer to DVA failed');
    }

    return {
      chargeResponse,
      transferResponse,
    };
  } catch (error) {
    console.error('Error charging card and transferring to DVA:', error);
    throw error;
  }
};

export const initiateBankTransfer = async (email, amount, subaccount_code, callback_url) => {
  const data = {
    email,
    amount: amount * 100,
    subaccount_code: subaccount_code,
    currency: 'NGN',
    channels: ['bank_transfer'],
    callback_url
  };

  const result = await makePaystackRequest('/transaction/initialize', 'POST', data);
  return result.data;
};

export const verifyTransfer = async (reference) => {
  const result = await makePaystackRequest(`/transaction/verify/${reference}`, 'GET');
  return result.data;
};

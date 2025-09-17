import { DataStore } from 'aws-amplify/datastore';
import {
  Contribution,
  UserActivity,
  UserBankDetails,
  UserCardDetails,
} from '../src/models';
import { createUserActivity } from './activities.service';
import { triggerNotificationForUser } from './pushNotification.service';
import { countries } from '@/data/countries';
import {
  updateContribution,
  updatePersonalContribution,
} from './contributions.service';

const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PRIVATE_KEY_TEST;
// const PAYSTACK_SECRET_KEY_LIVE = process.env.EXPO_PUBLIC_PAYSTACK_PRIVATE_KEY;
const PAYSTACK_SECRET_KEY_LIVE =
  'sk_live_018197960c67614111a22568257da65f67191fb3';

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
  const transactionCharge = Math.round(amount * 0.03);

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
  const customer_code = userProfile?.customer_code;
  const first_name = userProfile.name?.split(' ')[0];
  const last_name = userProfile.name?.split(' ')[1];

  const data = {
    country: 'NG',
    type: 'bank_account',
    account_number: input.accountNumber,
    bvn: input.bvn,
    bank_code: input.bank_code,
    first_name,
    last_name,
  };

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
    return data.map((bank, index) => ({
      value: bank.code,
      label: bank.name,
      id: index,
    }));
  } catch (error) {
    console.error('Error fetching banks:', error);
    throw error;
  }
};

export const fetchCountries = async () => {
  try {
    return countries.map((e, idx) => ({ label: e, value: e, id: idx }));
  } catch (error) {
    console.error('Error fetching country names:', error);
    return [];
  }
};

export const fetchCards = async (setUserCards, currentUser) => {
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

export const fetchBankDetails = async (setBankDetails, currentUser) => {
  try {
    const bankDetails = await DataStore.query(UserBankDetails, (c) =>
      c.userId.eq(currentUser.userId)
    );
    setBankDetails(bankDetails);
    return bankDetails;
  } catch (error) {
    console.error('Error fetching user banks:', error);
    return [];
  }
};

export const createBankDetails = async (bankDetails, userProfile) => {
  try {
    const newBankDetails = await DataStore.save(
      new UserBankDetails({
        userId: userProfile.userId,
        bank_code: bankDetails.bank_code,
        bank_number: bankDetails.account_number,
        bank_name: bankDetails.bank_name,
        status: bankDetails.status,
        index: bankDetails.recipient_code,
      })
    );

    return newBankDetails;
  } catch (error) {
    console.error('Error creating bank details:', error);
    throw new Error('Could not create bank details');
  }
};

export const updateBankDetails = async (selectedBankId, currentUser) => {
  try {
    const bankDetails = await DataStore.query(UserBankDetails, (c) =>
      c.userId.eq(currentUser.userId)
    );

    const updatedBankDetails = bankDetails.map((bank) => {
      return DataStore.save(
        UserBankDetails.copyOf(bank, (updated) => {
          updated.status = bank.id === selectedBankId ? 'active' : 'inactive';
        })
      );
    });

    await Promise.all(updatedBankDetails);

    return { success: true, message: 'Bank details updated successfully.' };
  } catch (error) {
    console.error('Error updating bank details:', error);
    return { success: false, message: error.message };
  }
};

export const deleteBankDetails = async (bankId) => {
  try {
    const bankDetail = await DataStore.query(UserBankDetails, bankId);

    if (!bankDetail) {
      throw new Error('Bank details not found');
    }

    await DataStore.delete(bankDetail);

    return { success: true, message: 'Bank details deleted successfully.' };
  } catch (error) {
    console.error('Error deleting bank details:', error);
    return { success: false, message: error.message };
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

export const createTransferRecipientForBank = async (data) => {
  const request_data = {
    type: 'nuban',
    name: data.name,
    account_number: data.account_number,
    bank_code: data.bank_code,
    currency: 'NGN',
  };
  const response = await makePaystackRequest(
    '/transferrecipient',
    'POST',
    request_data
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

export const initiateBankTransfer = async (
  email,
  amount,
  subaccount_code,
  callback_url
) => {
  const data = {
    email,
    amount: amount * 100,
    subaccount_code: subaccount_code,
    currency: 'NGN',
    channels: ['bank_transfer', 'bank', 'ussd', 'mobile_money'],
    callback_url,
  };

  const result = await makePaystackRequest(
    '/transaction/initialize',
    'POST',
    data
  );
  console.log('init', result);
  return result.data;
};

export const verifyTransfer = async (reference) => {
  const result = await makePaystackRequest(
    `/transaction/verify/${reference}`,
    'GET'
  );
  return result.data;
};

const transferToBank = async (recipient_code, amount, contribution) => {
  const data = {
    recipient: recipient_code,
    amount: amount * 100,
    source: 'balance',
    reason: `${contribution.name} contribution payout`,
  };

  return await makePaystackRequest('/transfer', 'POST', data);
};

export const withdrawFunds = async (
  userProfile,
  contributionId,
  amountToWithdraw,
  recipientCode
) => {
  try {
    // Query the contribution from DataStore
    const contribution = await DataStore.query(Contribution, contributionId);

    if (!contribution) {
      throw new Error('Contribution not found');
    }

    const userId = userProfile?.userId;
    const participants = JSON.parse(contribution?.participant || '[]');

    // Check if the participant exists
    const participant = participants?.find((p) => p?.userId === userId);

    if (!participant) {
      throw new Error('User is not part of this contribution');
    }

    // Ensure participant balance exists and is a valid number
    const participantBalance = Number(participant?.balance || 0);
    const amount = Number(amountToWithdraw);

    if (amount > participantBalance) {
      throw new Error('Insufficient balance');
    }

    const isEarlyWithdrawal =
      contribution?.currently_at < contribution?.num_of_month;
    let penalty = 0;
    let withdrawalAmount = amount;

    // Apply penalty if early withdrawal
    if (isEarlyWithdrawal) {
      penalty = amount * 0.1; // 10% penalty on withdrawal amount
      withdrawalAmount = amount - penalty;
    }

    // Execute bank transfer
    const flow = await transferToBank(
      recipientCode,
      withdrawalAmount,
      contribution
    );

    if (flow?.data?.status !== 'pending') {
      return {
        success: false,
        message: flow?.data?.gateway_response || 'Transfer failed',
      };
    }

    if (isEarlyWithdrawal) {
      participant.balance = 0;
    } else {
      const participantBalanceAfterWithdrawal = participantBalance - amount;
      participant.balance = participantBalanceAfterWithdrawal;
    }

    // Record activity for withdrawal
    await createUserActivity(userId, {
      type: 'collection',
      amount: withdrawalAmount,
      description: `Fund withdrawal from ${contribution.name} savings`,
      extra: contribution.id,
    });

    // await createUserActivity(userId, {
    //   type: 'Personal Savings',
    //   amount: withdrawalAmount,
    //   description: `Fund withdrawal from ${contribution?.name}`,
    //   extra: JSON.stringify(contribution.id)
    // });

    // Notify participant of successful withdrawal
    await triggerNotificationForUser(
      participant?.push_token,
      `Withdrawal Processed for ${contribution?.name}`,
      `You successfully withdrew ${withdrawalAmount} from ${contribution?.name}`
    );

    // If early withdrawal, record penalty
    if (isEarlyWithdrawal) {
      await createUserActivity(userId, {
        type: 'Personal Savings',
        amount: penalty,
        description: `Penalty of 10% applied for early withdrawal from ${contribution?.name}`,
        extra: contribution.id,
      });

      await triggerNotificationForUser(
        participant?.push_token,
        'Penalty Applied',
        `A 10% penalty was applied for early withdrawal from ${contribution?.name}`
      );
    }

    // Use versioning to prevent concurrent overwrites
    await DataStore.save(
      Contribution.copyOf(contribution, (updated) => {
        updated.participant = participants;
        updated.status =
          participant.balance === 0 ? 'closed' : contribution?.status;
      })
    );

    return { success: true, message: 'Withdrawal successful', penalty };
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return { success: false, message: error?.message || 'An error occurred' };
  }
};

export const resolveBankAccount = async (
  account_number,
  bank_code,
  userProfile
) => {
  const endpoint = `/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;

  const result = await makePaystackRequest(endpoint, 'GET');

  const cleanName = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z ]/g, '')
      .split(' ')
      .filter(Boolean)
      .join(' ');
  };

  const resolvedAccountName = cleanName(result.data.account_name);
  const userProfileName = cleanName(userProfile.name);

  if (resolvedAccountName === userProfileName) {
    return { success: true, message: 'verified' };
  } else {
    return {
      success: false,
      message: 'Invalid account details or account mismatch',
    };
  }
};

export const chargeCardForPersonalContribution = async (payer, amount) => {
  // Calculate the transaction charge (3.5% of the base contribution amount)
  const transactionCharge = Math.round(amount * 0.035); // 3.5% of the contribution amount

  // Adjust the amount to include the transaction charge
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
    const result = await makePaystackRequest(
      '/transaction/charge_authorization',
      'POST',
      data
    );

    return result;
  } catch (error) {
    console.log('charge error', error);
    return error.message || 'Error processing payment. Please try again';
  }
};

export const processFirstSavings = async (
  participant,
  contribution,
  userProfile,
  start_date
) => {
  try {
    const flow = await chargeCardForPersonalContribution(
      participant,
      contribution.amount
    );

    if (flow?.data?.status === 'success') {
      await updatePersonalContribution(contribution, userProfile, start_date);
      return { success: true, message: 'Card charged successfully.' };
    } else {
      return { success: false, message: flow?.data?.gateway_response };
    }
  } catch (error) {
    console.log('first savings error', error);
    throw error;
  }
};

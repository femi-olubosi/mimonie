import { DataStore } from 'aws-amplify/datastore';
import { Contribution, UserActivity, UserCardDetails } from '../src/models';

const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PRIVATE_KEY_TEST;
const PAYSTACK_SECRET_KEY_LIVE = process.env.EXPO_PUBLIC_PAYSTACK_PRIVATE_KEY;

const makePaystackRequest = async (endpoint, method, data) => {
  const url = `https://api.paystack.co${endpoint}`;
  const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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

// export const processContributions = async () => {
//   try {
//     // Fetch all contributions
//     const contributions = await DataStore.query(Contribution);

//     // Iterate through each contribution
//     for (const contribution of contributions) {
//       const participants = contribution.participant.map(
//         (p) => JSON.parse(p)[0]
//       );
//       const inProgressParticipant = participants.find(
//         (p) => p.status === 'in progress'
//       );

//       if (!inProgressParticipant) {
//         console.error(
//           `No participant with status 'in progress' found for contribution ${contribution.id}`
//         );
//         continue;
//       }

//       // Process payments for each participant
//       for (const participant of participants) {
//         if (participant.status !== 'in progress') {
//           // Deduct amount from participant
//           const deductionSuccess = await processPayment(
//             participant.authId,
//             contribution.amount
//           );

//           if (deductionSuccess) {
//             // Update participant's contributions
//             participant.contributions.push({
//               type: 'debit',
//               amount: contribution.amount,
//               status: 'success',
//             });

//             // Save user activity for deduction
//             await DataStore.save(
//               new UserActivity({
//                 userId: participant.id,
//                 type: 'deduction',
//                 amount: contribution.amount,
//               })
//             );
//           } else {
//             console.error(
//               `Failed to deduct amount from participant ${participant.id}`
//             );
//           }
//         }
//       }

//       // Credit the amount to the in-progress participant
//       const creditSuccess = await processPayment(
//         inProgressParticipant.authId,
//         contribution.amount,
//         true
//       );

//       if (creditSuccess) {
//         // Update in-progress participant's contributions
//         inProgressParticipant.contributions.push({
//           type: 'credit',
//           amount: contribution.amount,
//           status: 'success',
//         });

//         // Save user activity for credit
//         await DataStore.save(
//           new UserActivity({
//             userId: inProgressParticipant.id,
//             type: 'collection',
//             amount: contribution.amount,
//           })
//         );

//         // Update in-progress participant's status to received
//         inProgressParticipant.status = 'received';

//         // Update other participants' statuses for the next cycle
//         const nextParticipant = participants.find(
//           (p) => p.status === 'pending'
//         );
//         if (nextParticipant) {
//           nextParticipant.status = 'in progress';
//         }

//         // Save the updated participants
//         await DataStore.save(
//           Contribution.copyOf(contribution, (updated) => {
//             updated.participant = participants.map((p) => JSON.stringify([p]));
//           })
//         );
//       } else {
//         console.error(
//           `Failed to credit amount to participant ${inProgressParticipant.id}`
//         );
//       }
//     }
//   } catch (error) {
//     console.error('Error processing contributions:', error);
//   }
// };

// const processPayment = async (authId, amount, isCredit = false) => {
//   try {
//     const url = isCredit
//       ? 'https://api.paystack.co/transaction/charge_authorization'
//       : 'https://api.paystack.co/transaction/debit_authorization';
//     const response = await axios.post(
//       url,
//       {
//         authorization_code: authId,
//         amount: amount * 100, // Paystack expects the amount in kobo (Nigerian Naira subunit)
//         email: 'user@example.com', // Replace with the participant's email
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     if (response.data.status === 'success') {
//       console.log(
//         `${
//           isCredit ? 'Credited' : 'Debited'
//         } ${amount} to/from authId: ${authId}`
//       );
//       return true;
//     } else {
//       console.error(
//         `Failed to ${isCredit ? 'credit' : 'debit'}: ${response.data.message}`
//       );
//       return false;
//     }
//   } catch (error) {
//     console.error('Error processing payment:', error);
//     return false;
//   }
// };

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

      await Promise.all(
        userContributions.map(async (contribution) => {
          const participants = JSON.parse(contribution.participant);

          const updatedParticipants = participants.map((participant) =>
            participant.userId === currentUser.userId
              ? { ...participant, auth_url: newCard.authorization_code }
              : participant
          );

          await DataStore.save(
            Contribution.copyOf(contribution, (updated) => {
              updated.participant = JSON.stringify(updatedParticipants);
            })
          );
        })
      );

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
    account_number: input.account_number,
    bvn: input.bvn,
    bank_code: input.bank_code,
    first_name: 'Uchenna',
    last_name: 'Okoro',
  };

  return await makePaystackRequest(
    `/customer/${customer_code}/identification`,
    'POST',
    data
  );
};

export const createSubAccount = async (userProfile) => {
  const data = {
    business_name: `${userProfile.preferred_username}${userProfile.phone_number}`,
    bank_code: userProfile.bank_details.bank_code,
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

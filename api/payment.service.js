import { DataStore } from 'aws-amplify';
import axios from 'axios';
import { Contribution, UserActivity, UserCardDetails } from '../src/models'; // Adjust the import paths according to your project structure

const PAYSTACK_SECRET_KEY = 'your_paystack_secret_key';

export const processContributions = async () => {
  try {
    // Fetch all contributions
    const contributions = await DataStore.query(Contribution);

    // Iterate through each contribution
    for (const contribution of contributions) {
      const participants = contribution.participant.map(
        (p) => JSON.parse(p)[0]
      );
      const inProgressParticipant = participants.find(
        (p) => p.status === 'in progress'
      );

      if (!inProgressParticipant) {
        console.error(
          `No participant with status 'in progress' found for contribution ${contribution.id}`
        );
        continue;
      }

      // Process payments for each participant
      for (const participant of participants) {
        if (participant.status !== 'in progress') {
          // Deduct amount from participant
          const deductionSuccess = await processPayment(
            participant.authId,
            contribution.amount
          );

          if (deductionSuccess) {
            // Update participant's contributions
            participant.contributions.push({
              type: 'debit',
              amount: contribution.amount,
              status: 'success',
            });

            // Save user activity for deduction
            await DataStore.save(
              new UserActivity({
                userId: participant.id,
                type: 'deduction',
                amount: contribution.amount,
              })
            );
          } else {
            console.error(
              `Failed to deduct amount from participant ${participant.id}`
            );
          }
        }
      }

      // Credit the amount to the in-progress participant
      const creditSuccess = await processPayment(
        inProgressParticipant.authId,
        contribution.amount,
        true
      );

      if (creditSuccess) {
        // Update in-progress participant's contributions
        inProgressParticipant.contributions.push({
          type: 'credit',
          amount: contribution.amount,
          status: 'success',
        });

        // Save user activity for credit
        await DataStore.save(
          new UserActivity({
            userId: inProgressParticipant.id,
            type: 'collection',
            amount: contribution.amount,
          })
        );

        // Update in-progress participant's status to received
        inProgressParticipant.status = 'received';

        // Update other participants' statuses for the next cycle
        const nextParticipant = participants.find(
          (p) => p.status === 'pending'
        );
        if (nextParticipant) {
          nextParticipant.status = 'in progress';
        }

        // Save the updated participants
        await DataStore.save(
          Contribution.copyOf(contribution, (updated) => {
            updated.participant = participants.map((p) => JSON.stringify([p]));
          })
        );
      } else {
        console.error(
          `Failed to credit amount to participant ${inProgressParticipant.id}`
        );
      }
    }
  } catch (error) {
    console.error('Error processing contributions:', error);
  }
};

const processPayment = async (authId, amount, isCredit = false) => {
  try {
    const url = isCredit
      ? 'https://api.paystack.co/transaction/charge_authorization'
      : 'https://api.paystack.co/transaction/debit_authorization';
    const response = await axios.post(
      url,
      {
        authorization_code: authId,
        amount: amount * 100, // Paystack expects the amount in kobo (Nigerian Naira subunit)
        email: 'user@example.com', // Replace with the participant's email
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'success') {
      console.log(
        `${
          isCredit ? 'Credited' : 'Debited'
        } ${amount} to/from authId: ${authId}`
      );
      return true;
    } else {
      console.error(
        `Failed to ${isCredit ? 'credit' : 'debit'}: ${response.data.message}`
      );
      return false;
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return false;
  }
};

export const verifyTransaction = async (reference, currentUser) => {
  try {
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer sk_test_e25336dc047bf8b1752588da9f2f5beb0a8ab7ad`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (verificationResponse.data.status && verificationResponse.data.data) {
      const { authorization, customer } = verificationResponse.data.data;
      console.log({ authorization, customer });
      // Store the card details using DataStore
      await DataStore.save(
        new UserCardDetails({
          bankName: authorization.bank,
          last4: authorization.last4,
          userId: currentUser.userId,
          type: authorization.card_type,
          expiry: `${authorization.exp_month}/${authorization.exp_year}`,
          authorizationCode: authorization.authorization_code,
        })
      );

      return true;
    } else {
      console.error('Verification failed:', verificationResponse.data.message);
      return false;
    }
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
};

import { DataStore } from 'aws-amplify/datastore';
import { Contribution, ContributionParticipant } from '../src/models';

export const updateContributionOwners = async () => {
  try {
    const contributions = await DataStore.query(Contribution);

    for (const contribution of contributions) {
      const participantIds = contribution.participant_ids;

      // Skip if no participant_ids or already set
      if (!participantIds || participantIds.length === 0) continue;

      const firstId = participantIds[0];
      console.log('first', firstId);
      // Update contribution.owner_id if not already set
      if (contribution.owner_id !== firstId) {
        await DataStore.save(
          Contribution.copyOf(contribution, (updated) => {
            updated.owner_id = firstId;
          })
        );
      }

      // Update all related ContributionParticipant records
      const participants = await DataStore.query(ContributionParticipant, (p) =>
        p.contributionID.eq(contribution.id)
      );

      for (const participant of participants) {
        if (participant.contribution_owner_id !== firstId) {
          await DataStore.save(
            ContributionParticipant.copyOf(participant, (updated) => {
              updated.contribution_owner_id = firstId;
            })
          );
        }
      }
    }

    console.log('All contributions and participants updated.');
  } catch (error) {
    console.error('Error updating contribution owners:', error);
  }
};

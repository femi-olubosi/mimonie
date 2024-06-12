// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { UserProfile, UserCardDetails, Contribution, ContributionGroups } = initSchema(schema);

export {
  UserProfile,
  UserCardDetails,
  Contribution,
  ContributionGroups
};
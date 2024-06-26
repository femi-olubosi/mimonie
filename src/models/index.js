// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { UserNotifications, UserProfile, UserCardDetails, Contribution, ContributionGroups } = initSchema(schema);

export {
  UserNotifications,
  UserProfile,
  UserCardDetails,
  Contribution,
  ContributionGroups
};
// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { UserActivity, UserNotifications, UserProfile, UserCardDetails, Contribution, ContributionGroups } = initSchema(schema);

export {
  UserActivity,
  UserNotifications,
  UserProfile,
  UserCardDetails,
  Contribution,
  ContributionGroups
};
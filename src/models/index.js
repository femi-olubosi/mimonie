// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { PersonalContribution, UserActivity, UserNotifications, UserProfile, UserCardDetails, Contribution, ContributionGroups } = initSchema(schema);

export {
  PersonalContribution,
  UserActivity,
  UserNotifications,
  UserProfile,
  UserCardDetails,
  Contribution,
  ContributionGroups
};
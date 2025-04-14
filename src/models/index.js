// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { UserBankDetails, PersonalContribution, UserActivity, UserNotifications, UserProfile, UserCardDetails, Contribution, ContributionGroups, Request, UserConnections, ContributionParticipant } = initSchema(schema);

export {
  UserBankDetails,
  PersonalContribution,
  UserActivity,
  UserNotifications,
  UserProfile,
  UserCardDetails,
  Contribution,
  ContributionGroups,
  Request,
  UserConnections,
  ContributionParticipant
};
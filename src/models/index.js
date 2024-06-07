// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Contribution, ContributionGroups } = initSchema(schema);

export {
  Contribution,
  ContributionGroups
};
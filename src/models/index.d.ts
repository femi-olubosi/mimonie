import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";





type EagerUserActivity = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserActivity, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly type?: string | null;
  readonly amount?: number | null;
  readonly description?: string | null;
  readonly userId?: string | null;
  readonly status?: string | null;
  readonly extra?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserActivity = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserActivity, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly type?: string | null;
  readonly amount?: number | null;
  readonly description?: string | null;
  readonly userId?: string | null;
  readonly status?: string | null;
  readonly extra?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserActivity = LazyLoading extends LazyLoadingDisabled ? EagerUserActivity : LazyUserActivity

export declare const UserActivity: (new (init: ModelInit<UserActivity>) => UserActivity) & {
  copyOf(source: UserActivity, mutator: (draft: MutableModel<UserActivity>) => MutableModel<UserActivity> | void): UserActivity;
}

type EagerUserNotifications = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserNotifications, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly type?: string | null;
  readonly content?: string | null;
  readonly title?: string | null;
  readonly read?: boolean | null;
  readonly userId?: string | null;
  readonly global?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserNotifications = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserNotifications, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly type?: string | null;
  readonly content?: string | null;
  readonly title?: string | null;
  readonly read?: boolean | null;
  readonly userId?: string | null;
  readonly global?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserNotifications = LazyLoading extends LazyLoadingDisabled ? EagerUserNotifications : LazyUserNotifications

export declare const UserNotifications: (new (init: ModelInit<UserNotifications>) => UserNotifications) & {
  copyOf(source: UserNotifications, mutator: (draft: MutableModel<UserNotifications>) => MutableModel<UserNotifications> | void): UserNotifications;
}

type EagerUserProfile = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserProfile, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly preferred_username?: string | null;
  readonly phone_number?: string | null;
  readonly birthdate?: string | null;
  readonly address?: string | null;
  readonly income_from?: number | null;
  readonly income_to?: number | null;
  readonly occupation?: string | null;
  readonly country_of_residence?: string | null;
  readonly country_of_origin?: string | null;
  readonly email?: string | null;
  readonly auth_url?: string | null;
  readonly invites?: (string | null)[] | null;
  readonly is_bvn_verified?: boolean | null;
  readonly is_nin_verified?: boolean | null;
  readonly device_id?: string | null;
  readonly userId?: string | null;
  readonly customer_code?: string | null;
  readonly verification_in_progress?: boolean | null;
  readonly subaccount_code?: string | null;
  readonly bank_details?: string | null;
  readonly device_name?: string | null;
  readonly device_brand?: string | null;
  readonly verification_in_progress_id?: boolean | null;
  readonly connections?: (string | null)[] | null;
  readonly phone_verified?: boolean | null;
  readonly push_token?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserProfile = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserProfile, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly preferred_username?: string | null;
  readonly phone_number?: string | null;
  readonly birthdate?: string | null;
  readonly address?: string | null;
  readonly income_from?: number | null;
  readonly income_to?: number | null;
  readonly occupation?: string | null;
  readonly country_of_residence?: string | null;
  readonly country_of_origin?: string | null;
  readonly email?: string | null;
  readonly auth_url?: string | null;
  readonly invites?: (string | null)[] | null;
  readonly is_bvn_verified?: boolean | null;
  readonly is_nin_verified?: boolean | null;
  readonly device_id?: string | null;
  readonly userId?: string | null;
  readonly customer_code?: string | null;
  readonly verification_in_progress?: boolean | null;
  readonly subaccount_code?: string | null;
  readonly bank_details?: string | null;
  readonly device_name?: string | null;
  readonly device_brand?: string | null;
  readonly verification_in_progress_id?: boolean | null;
  readonly connections?: (string | null)[] | null;
  readonly phone_verified?: boolean | null;
  readonly push_token?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserProfile = LazyLoading extends LazyLoadingDisabled ? EagerUserProfile : LazyUserProfile

export declare const UserProfile: (new (init: ModelInit<UserProfile>) => UserProfile) & {
  copyOf(source: UserProfile, mutator: (draft: MutableModel<UserProfile>) => MutableModel<UserProfile> | void): UserProfile;
}

type EagerUserCardDetails = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserCardDetails, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly last4?: string | null;
  readonly bank?: string | null;
  readonly userId?: string | null;
  readonly type?: string | null;
  readonly expiry?: string | null;
  readonly authorization_code?: string | null;
  readonly status?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserCardDetails = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserCardDetails, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly last4?: string | null;
  readonly bank?: string | null;
  readonly userId?: string | null;
  readonly type?: string | null;
  readonly expiry?: string | null;
  readonly authorization_code?: string | null;
  readonly status?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserCardDetails = LazyLoading extends LazyLoadingDisabled ? EagerUserCardDetails : LazyUserCardDetails

export declare const UserCardDetails: (new (init: ModelInit<UserCardDetails>) => UserCardDetails) & {
  copyOf(source: UserCardDetails, mutator: (draft: MutableModel<UserCardDetails>) => MutableModel<UserCardDetails> | void): UserCardDetails;
}

type EagerContribution = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Contribution, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly title?: string | null;
  readonly category?: string | null;
  readonly start_date?: string | null;
  readonly invite_link?: string | null;
  readonly contributiongroupsID: string;
  readonly participant?: (string | null)[] | null;
  readonly owner: string;
  readonly target: number;
  readonly amount: number;
  readonly num_of_month: number;
  readonly status?: string | null;
  readonly participant_ids?: (string | null)[] | null;
  readonly currently_at?: number | null;
  readonly variant?: string | null;
  readonly current_count?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyContribution = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Contribution, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly title?: string | null;
  readonly category?: string | null;
  readonly start_date?: string | null;
  readonly invite_link?: string | null;
  readonly contributiongroupsID: string;
  readonly participant?: (string | null)[] | null;
  readonly owner: string;
  readonly target: number;
  readonly amount: number;
  readonly num_of_month: number;
  readonly status?: string | null;
  readonly participant_ids?: (string | null)[] | null;
  readonly currently_at?: number | null;
  readonly variant?: string | null;
  readonly current_count?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Contribution = LazyLoading extends LazyLoadingDisabled ? EagerContribution : LazyContribution

export declare const Contribution: (new (init: ModelInit<Contribution>) => Contribution) & {
  copyOf(source: Contribution, mutator: (draft: MutableModel<Contribution>) => MutableModel<Contribution> | void): Contribution;
}

type EagerContributionGroups = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ContributionGroups, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly description?: string | null;
  readonly status: string;
  readonly target: number;
  readonly title?: string | null;
  readonly body_color?: string | null;
  readonly side_color?: string | null;
  readonly amount: number;
  readonly name: string;
  readonly num_of_month?: number | null;
  readonly Contributions?: (Contribution | null)[] | null;
  readonly variant: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyContributionGroups = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ContributionGroups, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly description?: string | null;
  readonly status: string;
  readonly target: number;
  readonly title?: string | null;
  readonly body_color?: string | null;
  readonly side_color?: string | null;
  readonly amount: number;
  readonly name: string;
  readonly num_of_month?: number | null;
  readonly Contributions: AsyncCollection<Contribution>;
  readonly variant: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ContributionGroups = LazyLoading extends LazyLoadingDisabled ? EagerContributionGroups : LazyContributionGroups

export declare const ContributionGroups: (new (init: ModelInit<ContributionGroups>) => ContributionGroups) & {
  copyOf(source: ContributionGroups, mutator: (draft: MutableModel<ContributionGroups>) => MutableModel<ContributionGroups> | void): ContributionGroups;
}
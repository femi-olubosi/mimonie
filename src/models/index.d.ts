import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";





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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ContributionGroups = LazyLoading extends LazyLoadingDisabled ? EagerContributionGroups : LazyContributionGroups

export declare const ContributionGroups: (new (init: ModelInit<ContributionGroups>) => ContributionGroups) & {
  copyOf(source: ContributionGroups, mutator: (draft: MutableModel<ContributionGroups>) => MutableModel<ContributionGroups> | void): ContributionGroups;
}
import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";





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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ContributionGroups = LazyLoading extends LazyLoadingDisabled ? EagerContributionGroups : LazyContributionGroups

export declare const ContributionGroups: (new (init: ModelInit<ContributionGroups>) => ContributionGroups) & {
  copyOf(source: ContributionGroups, mutator: (draft: MutableModel<ContributionGroups>) => MutableModel<ContributionGroups> | void): ContributionGroups;
}
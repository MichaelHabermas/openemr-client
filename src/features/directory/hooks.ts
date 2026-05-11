import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import {
  fetchGroups,
  fetchLocations,
  fetchOrganizations,
  fetchPersons,
  type DirectoryApiError,
} from './api';
import {
  normalizeGroupBundle,
  normalizeLocationBundle,
  normalizeOrganizationBundle,
  normalizePersonBundle,
} from './normalizers';
import type { GroupRow, LocationRow, OrganizationRow, PersonRow } from './types';

export type DirectoryQuery<T> = UseQueryResult<T, DirectoryApiError>;

export const directoryKeys = {
  locations: ['directory', 'locations'] as const,
  organizations: ['directory', 'organizations'] as const,
  persons: ['directory', 'persons'] as const,
  groups: ['directory', 'groups'] as const,
};

export function useLocations(): DirectoryQuery<LocationRow[]> {
  return useQuery({
    queryKey: directoryKeys.locations,
    queryFn: async () => normalizeLocationBundle(await fetchLocations()),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

export function useOrganizations(): DirectoryQuery<OrganizationRow[]> {
  return useQuery({
    queryKey: directoryKeys.organizations,
    queryFn: async () => normalizeOrganizationBundle(await fetchOrganizations()),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

export function usePersons(): DirectoryQuery<PersonRow[]> {
  return useQuery({
    queryKey: directoryKeys.persons,
    queryFn: async () => normalizePersonBundle(await fetchPersons()),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

export function useGroups(): DirectoryQuery<GroupRow[]> {
  return useQuery({
    queryKey: directoryKeys.groups,
    queryFn: async () => normalizeGroupBundle(await fetchGroups()),
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

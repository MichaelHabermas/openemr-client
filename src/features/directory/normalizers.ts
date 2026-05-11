import type { FhirLocation, FhirOrganization } from '@/types/fhir';
import {
  bundleEntriesOf,
  displayCodeableConcept,
  displayReference,
} from '@/features/patients/normalizers';
import type { LocationRow, OrganizationRow } from './types';

const UNKNOWN = 'Unknown';
const NOT_RECORDED = 'Not recorded';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function hasMeaningfulValue(value: string): boolean {
  return value !== UNKNOWN && value !== NOT_RECORDED;
}

function resourceId(resource: { id?: string }, fallbackPrefix: string): string {
  return resource.id ?? `${fallbackPrefix}-unknown`;
}

function isResourceType<T extends { resourceType: string }>(
  value: unknown,
  resourceType: T['resourceType'],
): value is T {
  return isRecord(value) && value.resourceType === resourceType;
}

function formatAddress(addr: {
  text?: string;
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
}): string {
  if (addr.text) return addr.text;
  const lines = Array.isArray(addr.line) ? addr.line.join(', ') : '';
  const parts = [lines, addr.city, addr.state, addr.postalCode].filter(Boolean);
  return parts.join(', ') || NOT_RECORDED;
}

function extractPhone(
  telecoms: Array<{ system?: string; value?: string; use?: string }> | undefined,
): string {
  if (!Array.isArray(telecoms)) return NOT_RECORDED;
  const phone = telecoms.find((t) => t.system === 'phone');
  return stringValue(phone?.value) ?? stringValue(telecoms[0]?.value) ?? NOT_RECORDED;
}

export function normalizeLocation(value: unknown): LocationRow | null {
  if (!isResourceType<FhirLocation>(value, 'Location')) return null;
  const type = Array.isArray(value.type)
    ? value.type
        .map((item) => displayCodeableConcept(item, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const address = value.address ? formatAddress(value.address) : NOT_RECORDED;
  const name = stringValue(value.name) ?? UNKNOWN;
  const row = {
    id: resourceId(value, 'location'),
    name,
    status: stringValue(value.status) ?? UNKNOWN,
    type: type || NOT_RECORDED,
    phone: extractPhone(value.telecom),
    address,
    managingOrg: displayReference(value.managingOrganization, NOT_RECORDED),
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name),
  };
}

export function normalizeOrganization(value: unknown): OrganizationRow | null {
  if (!isResourceType<FhirOrganization>(value, 'Organization')) return null;
  const type = Array.isArray(value.type)
    ? value.type
        .map((item) => displayCodeableConcept(item, ''))
        .filter(Boolean)
        .join(', ')
    : '';
  const addresses = Array.isArray(value.address) ? value.address : [];
  const address = addresses.length > 0 ? formatAddress(addresses[0]) : NOT_RECORDED;
  const name = stringValue(value.name) ?? UNKNOWN;
  const row = {
    id: resourceId(value, 'organization'),
    name,
    active: value.active === true ? 'Active' : value.active === false ? 'Inactive' : UNKNOWN,
    type: type || NOT_RECORDED,
    phone: extractPhone(value.telecom),
    address,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name),
  };
}

export function normalizeLocationBundle(bundle: unknown): LocationRow[] {
  return bundleEntriesOf<FhirLocation>(bundle, 'Location').flatMap((item) => {
    const row = normalizeLocation(item);
    return row ? [row] : [];
  });
}

export function normalizeOrganizationBundle(bundle: unknown): OrganizationRow[] {
  return bundleEntriesOf<FhirOrganization>(bundle, 'Organization').flatMap((item) => {
    const row = normalizeOrganization(item);
    return row ? [row] : [];
  });
}

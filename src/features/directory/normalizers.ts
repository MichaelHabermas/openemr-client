import type { FhirGroup, FhirLocation, FhirOrganization, FhirPerson } from '@/types/fhir';
import {
  bundleEntriesOf,
  displayCodeableConcept,
  displayReference,
} from '@/features/patients/normalizers';
import type { GroupRow, LocationRow, OrganizationRow, PersonRow } from './types';

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
  const firstAddr = addresses.find((a) => a != null);
  const address = firstAddr ? formatAddress(firstAddr) : NOT_RECORDED;
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

function formatHumanName(names: FhirPerson['name']): string {
  if (!Array.isArray(names) || names.length === 0) return UNKNOWN;
  const first = names[0];
  if (!first || !isRecord(first)) return UNKNOWN;
  const text = stringValue(first.text);
  if (text) return text;
  const given = Array.isArray(first.given) ? first.given.filter(Boolean).join(' ') : '';
  const family = stringValue(first.family) ?? '';
  const full = [given, family].filter(Boolean).join(' ');
  return full || UNKNOWN;
}

export function normalizePerson(value: unknown): PersonRow | null {
  if (!isResourceType<FhirPerson>(value, 'Person')) return null;
  const addresses = Array.isArray(value.address) ? value.address : [];
  const firstAddr = addresses.find((a) => a != null);
  const name = formatHumanName(value.name);
  const row = {
    id: resourceId(value, 'person'),
    name,
    gender: stringValue(value.gender) ?? NOT_RECORDED,
    birthDate: stringValue(value.birthDate) ?? NOT_RECORDED,
    phone: extractPhone(value.telecom),
    address: firstAddr ? formatAddress(firstAddr) : NOT_RECORDED,
    active: value.active === true ? 'Active' : value.active === false ? 'Inactive' : UNKNOWN,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name),
  };
}

export function normalizeGroup(value: unknown): GroupRow | null {
  if (!isResourceType<FhirGroup>(value, 'Group')) return null;
  const name = stringValue(value.name) ?? UNKNOWN;
  const memberCount =
    typeof value.quantity === 'number'
      ? String(value.quantity)
      : Array.isArray(value.member)
        ? String(value.member.length)
        : '0';
  const row = {
    id: resourceId(value, 'group'),
    name,
    type: stringValue(value.type) ?? NOT_RECORDED,
    memberCount,
    managingEntity: displayReference(value.managingEntity, NOT_RECORDED),
    active: value.active === true ? 'Active' : value.active === false ? 'Inactive' : UNKNOWN,
  };
  return {
    ...row,
    hasPartialData: !hasMeaningfulValue(row.name),
  };
}

export function normalizePersonBundle(bundle: unknown): PersonRow[] {
  return bundleEntriesOf<FhirPerson>(bundle, 'Person').flatMap((item) => {
    const row = normalizePerson(item);
    return row ? [row] : [];
  });
}

export function normalizeGroupBundle(bundle: unknown): GroupRow[] {
  return bundleEntriesOf<FhirGroup>(bundle, 'Group').flatMap((item) => {
    const row = normalizeGroup(item);
    return row ? [row] : [];
  });
}

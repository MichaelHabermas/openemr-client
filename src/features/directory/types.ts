export interface LocationRow {
  id: string;
  name: string;
  status: string;
  type: string;
  phone: string;
  address: string;
  managingOrg: string;
  hasPartialData: boolean;
}

export interface OrganizationRow {
  id: string;
  name: string;
  active: string;
  type: string;
  phone: string;
  address: string;
  hasPartialData: boolean;
}

export interface PersonRow {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  phone: string;
  address: string;
  active: string;
  hasPartialData: boolean;
}

export interface GroupRow {
  id: string;
  name: string;
  type: string;
  memberCount: string;
  managingEntity: string;
  active: string;
  hasPartialData: boolean;
}

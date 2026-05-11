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

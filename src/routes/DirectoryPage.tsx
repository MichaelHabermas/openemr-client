import { GroupsTable } from '@/features/directory/components/GroupsTable';
import { LocationsTable } from '@/features/directory/components/LocationsTable';
import { OrganizationsTable } from '@/features/directory/components/OrganizationsTable';
import { PersonsTable } from '@/features/directory/components/PersonsTable';
import { useGroups, useLocations, useOrganizations, usePersons } from '@/features/directory/hooks';

export function DirectoryPage() {
  const locationsState = useLocations();
  const organizationsState = useOrganizations();
  const personsState = usePersons();
  const groupsState = useGroups();

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-primary text-xs font-semibold tracking-wide uppercase'>
          OpenEMR facility index
        </p>
        <h1 className='mt-1 text-2xl font-semibold tracking-tight'>Facility Directory</h1>
      </div>

      <LocationsTable state={locationsState} />
      <OrganizationsTable state={organizationsState} />
      <PersonsTable state={personsState} />
      <GroupsTable state={groupsState} />
    </div>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/AppLayout';
import { DirectoryPage } from '@/routes/DirectoryPage';
import { EncounterDetailPage } from '@/routes/EncounterDetailPage';
import { HomePage } from '@/routes/HomePage';
import { LoginRedirectPage } from '@/routes/LoginRedirectPage';
import { MedicationCatalogPage } from '@/routes/MedicationCatalogPage';
import { PatientDashboardPage } from '@/routes/PatientDashboardPage';
import { PatientsPage } from '@/routes/PatientsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/login' element={<LoginRedirectPage />} />
            <Route path='/patients' element={<PatientsPage />} />
            <Route path='/patients/:patientId' element={<PatientDashboardPage />} />
            <Route
              path='/patients/:patientId/encounters/:encounterId'
              element={<EncounterDetailPage />}
            />
            <Route path='/directory' element={<DirectoryPage />} />
            <Route path='/medications' element={<MedicationCatalogPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

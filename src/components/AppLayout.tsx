import { NavLink, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className='flex min-h-dvh flex-col'>
      <a
        href='#main-content'
        className='focus:bg-card focus:text-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:shadow-md'>
        Skip to main content
      </a>
      <header className='bg-card/90 sticky top-0 z-20 border-b backdrop-blur-sm'>
        <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4'>
          <NavLink
            to='/'
            className='text-foreground text-sm font-semibold tracking-wide transition-colors hover:text-primary'>
            OpenEMR Client
          </NavLink>
          <nav aria-label='Primary navigation' className='flex items-center gap-1'>
            <NavLink
              to='/patients'
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')
              }>
              Patients
            </NavLink>
          </nav>
        </div>
      </header>
      <main id='main-content' className='mx-auto w-full max-w-6xl flex-1 p-4 md:p-8'>
        <Outlet />
      </main>
    </div>
  );
}

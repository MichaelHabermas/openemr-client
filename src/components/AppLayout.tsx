import { Link, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className='min-h-screen flex flex-col'>
      <header className='border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10'>
        <div className='mx-auto flex h-14 max-w-4xl items-center justify-between px-4'>
          <Link
            to='/'
            className='font-semibold text-foreground hover:text-primary transition-colors'>
            OpenEMR Client
          </Link>
        </div>
      </header>
      <main className='mx-auto w-full max-w-4xl flex-1 p-4 md:p-8'>
        <Outlet />
      </main>
    </div>
  );
}

export function OpenEmrNavBar() {
  return (
    <div className='bg-[#1a354b] text-white'>
      <div className='mx-auto flex h-10 max-w-6xl items-center gap-6 px-4 text-xs'>
        <span className='font-bold tracking-wide'>OpenEMR</span>
        <nav aria-label='OpenEMR navigation' className='flex items-center gap-4'>
          <span className='text-white/70'>Patient</span>
          <span className='text-white/70'>Fees</span>
          <span className='text-white/70'>Modules</span>
          <span className='text-white/70'>Procedures</span>
          <span className='text-white/70'>Admin</span>
          <span className='text-white/70'>Reports</span>
          <span className='text-white/70'>Miscellaneous</span>
          <span className='text-white/70'>About</span>
        </nav>
      </div>
    </div>
  );
}

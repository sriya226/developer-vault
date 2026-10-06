import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Logo from '../components/Logo';
import PageLoader from '../components/PageLoader';
import IconButton from '../components/IconButton';
import { VaultProvider, useVault } from '../context/VaultContext';

function Shell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { openAdd } = useVault();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="min-h-screen">
      {/* Desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><Sidebar /></aside>

      {/* Tablet/mobile: collapsible drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl"><Sidebar onNavigate={() => setOpen(false)} /></aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-3 backdrop-blur dark:border-navy-700 dark:bg-navy-900/90 lg:hidden">
          <IconButton icon={Menu} label="Open menu" onClick={() => setOpen(true)} className="h-11 w-11" />
          <Logo to="/dashboard" />
          <IconButton icon={Plus} label="Add resource" onClick={openAdd} className="h-11 w-11" />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return <VaultProvider><Shell /></VaultProvider>;
}

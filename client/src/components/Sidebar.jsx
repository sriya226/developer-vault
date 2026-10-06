import { NavLink } from 'react-router-dom';
import { CreditCard, Folder, LayoutDashboard, Library, Settings, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import UserMenu from './UserMenu';
import { cn } from '../utils/helpers';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resources', label: 'All Resources', icon: Library, end: true },
  { to: '/favorites', label: 'Favorites', icon: Star },
  { to: '/categories', label: 'Categories', icon: Folder },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth();
  return (
    <nav aria-label="Main" className="flex h-full flex-col border-r border-slate-200 bg-white p-4 dark:border-navy-700 dark:bg-navy-900">
      <Logo to="/dashboard" className="px-2 py-2" />
      <ul className="mt-8 flex-1 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-white'
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mb-3 rounded-xl bg-indigo-50 p-3 text-sm dark:bg-indigo-500/10">
        {user.effectivePlan === 'free' ? (
          <>
            <p className="font-semibold text-slate-900 dark:text-white">Free plan</p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">Get more resources, unlimited tags and custom categories.</p>
            <Link to="/billing" onClick={onNavigate} className="btn-primary mt-3 min-h-[36px] w-full py-1.5">View plans</Link>
          </>
        ) : (
          <p className="font-semibold capitalize text-slate-900 dark:text-white">{user.effectivePlan} plan <Link to="/billing" onClick={onNavigate} className="ml-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-300">Manage</Link></p>
        )}
      </div>
      <UserMenu />
    </nav>
  );
}

import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IconButton from './IconButton';
import ThemeToggle from './ThemeToggle';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-navy-700">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold uppercase text-white" aria-hidden="true">
        {user?.name?.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
      </div>
      <ThemeToggle />
      <IconButton icon={LogOut} label="Log out" onClick={handleLogout} />
    </div>
  );
}

import { Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900 dark:text-white ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Bookmark className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      Developer Vault
    </Link>
  );
}

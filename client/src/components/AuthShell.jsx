import { Link } from 'react-router-dom';
import { CircleAlert, Search, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const POINTS = [
  { icon: Sparkles, text: 'Paste a link and the title, description and preview are filled in for you.' },
  { icon: Search, text: 'Search across titles, descriptions, websites and tags in milliseconds.' },
  { icon: ShieldCheck, text: 'Your vault is private. Only you can see what you save.' },
];

export default function AuthShell({ title, subtitle, error, footer, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-navy-900 p-12 text-slate-200 lg:flex">
        <Logo className="!text-white" />
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">Every tutorial, doc and repo you'll want again, in one place.</h2>
          <ul className="mt-8 max-w-md space-y-5">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm text-slate-300">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" aria-hidden="true" />{text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">Developer Vault</p>
      </aside>
      <main className="relative flex items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4 flex items-center gap-2"><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          {error && (
            <div role="alert" className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
            </div>
          )}
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>
          <p className="mt-4 text-center text-sm"><Link to="/" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Back to home</Link></p>
        </div>
      </main>
    </div>
  );
}

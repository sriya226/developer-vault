import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-10" />
      <p className="font-mono text-sm text-indigo-600 dark:text-indigo-300">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-secondary">Go home</Link>
        <Link to="/dashboard" className="btn-primary">Open dashboard</Link>
      </div>
    </div>
  );
}

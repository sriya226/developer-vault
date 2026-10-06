import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '../utils/helpers';

export function Favicon({ src, name, className = 'h-5 w-5' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold uppercase text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300', className)}>
        {(name || '?').charAt(0)}
      </span>
    );
  }
  return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={cn('shrink-0 rounded', className)} />;
}

export function PreviewImage({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-navy-700 dark:to-navy-900 dark:text-slate-500', className)} aria-hidden="true">
        <Globe className="h-7 w-7" />
        <span className="max-w-[80%] truncate font-mono text-xs">{name}</span>
      </div>
    );
  }
  return <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={cn('object-cover', className)} />;
}

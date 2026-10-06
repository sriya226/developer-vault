import { cn } from '../utils/helpers';

// Icon-only button/link with an accessible label and a CSS tooltip.
export default function IconButton({ icon: Icon, label, onClick, href, active, danger, className, ...rest }) {
  const cls = cn(
    'group relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-navy-700',
    active ? 'text-amber-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
    danger && 'hover:!text-red-600 dark:hover:!text-red-400',
    className
  );
  const content = (
    <>
      <Icon className={cn('h-[18px] w-[18px]', active && 'fill-current')} aria-hidden="true" />
      <span role="tooltip" className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-600">
        {label}
      </span>
    </>
  );
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={cls} {...rest}>{content}</a>;
  }
  return <button type="button" aria-label={label} aria-pressed={active === undefined ? undefined : !!active} onClick={onClick} className={cls} {...rest}>{content}</button>;
}

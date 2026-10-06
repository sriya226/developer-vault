import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  const ActionIcon = action?.icon;
  const inner = (<>{ActionIcon && <ActionIcon className="h-4 w-4" aria-hidden="true" />}{action?.label}</>);
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-navy-600">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && (action.to
        ? <Link to={action.to} className="btn-primary mt-6">{inner}</Link>
        : <button type="button" onClick={action.onClick} className="btn-primary mt-6">{inner}</button>)}
    </div>
  );
}

import { CATEGORY_ICONS, TYPE_ICONS } from '../utils/constants';

export function TypeBadge({ type }) {
  const Icon = TYPE_ICONS[type] || TYPE_ICONS.Other;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
      <Icon className="h-3 w-3" aria-hidden="true" />{type}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
      <Icon className="h-3 w-3" aria-hidden="true" />{category}
    </span>
  );
}

export function TagList({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-1" aria-label="Tags">
      {tags.map((t) => <li key={t} className="font-mono text-xs text-slate-500 dark:text-slate-400">#{t}</li>)}
    </ul>
  );
}

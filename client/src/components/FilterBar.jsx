import { Star, X } from 'lucide-react';
import { CATEGORIES, RESOURCE_TYPES, SORT_OPTIONS, TYPE_LABELS } from '../utils/constants';
import { cn } from '../utils/helpers';

const chip = (active) =>
  cn(
    'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
    active
      ? 'border-indigo-600 bg-indigo-600 text-white'
      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-navy-600 dark:bg-navy-800 dark:text-slate-300 dark:hover:border-navy-600 dark:hover:bg-navy-700'
  );

export default function FilterBar({ categories = CATEGORIES, type, category, sort, favorite, showFavorite, hasActive, onType, onCategory, onSort, onFavorite, onClear }) {
  return (
    <div className="space-y-3">
      <div role="group" aria-label="Filter by resource type" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {['', ...RESOURCE_TYPES].map((t) => (
          <button key={t || 'all'} type="button" aria-pressed={type === t} onClick={() => onType(t)} className={chip(type === t)}>
            {t ? TYPE_LABELS[t] || t : 'All'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-auto">
          <label htmlFor="filter-category" className="sr-only">Category</label>
          <select id="filter-category" value={category} onChange={(e) => onCategory(e.target.value)} className="input sm:w-48">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="filter-sort" className="sr-only">Sort by</label>
          <select id="filter-sort" value={sort} onChange={(e) => onSort(e.target.value)} className="input sm:w-48">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
          </select>
        </div>
        {showFavorite && (
          <button type="button" aria-pressed={favorite} onClick={() => onFavorite(!favorite)} className={cn(chip(favorite), 'inline-flex items-center gap-1.5')}>
            <Star className={cn('h-4 w-4', favorite && 'fill-current')} aria-hidden="true" /> Favorites only
          </button>
        )}
        {hasActive && (
          <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
            <X className="h-4 w-4" aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

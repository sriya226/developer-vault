import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search resources...' }) {
  return (
    <div className="relative">
      <label htmlFor="resource-search" className="sr-only">Search resources</label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input id="resource-search" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" className="input h-12 pl-11 pr-10 text-base sm:text-sm [&::-webkit-search-cancel-button]:hidden" />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

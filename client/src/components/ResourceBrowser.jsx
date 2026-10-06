import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CircleAlert, ChevronLeft, ChevronRight, Plus, SearchX, Star } from 'lucide-react';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import ResourceGrid from './ResourceGrid';
import EmptyState from './EmptyState';
import useBookmarks from '../hooks/useBookmarks';
import useDebounce from '../hooks/useDebounce';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';

const PAGE_SIZE = 12;

// Search + filters + sorted, paginated grid. Used by Dashboard, All Resources and Favorites.
export default function ResourceBrowser({ favoritesOnly = false }) {
  const { openAdd, openEdit, askDelete, toggleFavorite, refresh } = useVault();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const category = urlCategory ? urlCategory.slice(0, 40) : '';
  const categoryOptions = [...new Set([...CATEGORIES, ...(user.customCategories || []), ...(category ? [category] : [])])];

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [filters, setFilters] = useState({ resourceType: '', favorite: false, sort: 'newest', page: 1 });

  const params = useMemo(() => ({
    search: debouncedSearch,
    category,
    resourceType: filters.resourceType,
    favorite: favoritesOnly || filters.favorite,
    sort: filters.sort,
    page: filters.page,
    limit: PAGE_SIZE,
  }), [debouncedSearch, category, filters, favoritesOnly]);

  const { items, total, pages, loading, error, patchItem } = useBookmarks(params);
  const visible = favoritesOnly ? items.filter((b) => b.favorite) : items;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const setCategory = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('category', value); else next.delete('category');
      return next;
    }, { replace: true });
    setFilters((f) => ({ ...f, page: 1 }));
  };
  const onSearch = (value) => { setSearch(value); setFilters((f) => (f.page === 1 ? f : { ...f, page: 1 })); };
  const clearAll = () => {
    setSearch('');
    setSearchParams({}, { replace: true });
    setFilters((f) => ({ ...f, resourceType: '', favorite: false, page: 1 }));
  };

  const hasActive = !!(search || category || filters.resourceType || (!favoritesOnly && filters.favorite));

  const onToggleFavorite = useCallback((b) => toggleFavorite(b, (fav) => patchItem(b.id, { favorite: fav })), [toggleFavorite, patchItem]);

  let body;
  if (error) {
    body = (
      <EmptyState icon={CircleAlert} title="Couldn't load your resources" description={error} action={{ label: 'Try again', onClick: refresh }} />
    );
  } else if (!loading && visible.length === 0) {
    if (hasActive) {
      body = <EmptyState icon={SearchX} title="No resources found" description="Nothing matches your search and filters. Try different keywords or clear the filters." action={{ label: 'Clear filters', onClick: clearAll }} />;
    } else if (favoritesOnly) {
      body = <EmptyState icon={Star} title="No favorites yet" description="Star a resource to keep it within easy reach. Your favorites will show up here." action={{ label: 'Browse resources', to: '/resources' }} />;
    } else {
      body = <EmptyState title="No resources yet" description="You haven't saved any developer resources. Add your first resource to start building your vault." action={{ label: 'Add Resource', icon: Plus, onClick: openAdd }} />;
    }
  } else {
    body = (
      <>
        {!loading && <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">{total} {total === 1 ? 'resource' : 'resources'}</p>}
        <ResourceGrid items={visible} loading={loading} onToggleFavorite={onToggleFavorite} onEdit={openEdit} onDelete={askDelete} />
        {pages > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-center gap-4 pt-2">
            <button type="button" className="btn-secondary" disabled={filters.page <= 1 || loading} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">Page {filters.page} of {pages}</span>
            <button type="button" className="btn-secondary" disabled={filters.page >= pages || loading} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </>
    );
  }

  return (
    <section className="space-y-5" aria-label="Resources">
      <SearchBar value={search} onChange={onSearch} />
      <FilterBar
        categories={categoryOptions} type={filters.resourceType} category={category} sort={filters.sort} favorite={filters.favorite}
        showFavorite={!favoritesOnly} hasActive={hasActive}
        onType={(v) => setFilter({ resourceType: v })} onCategory={setCategory}
        onSort={(v) => setFilter({ sort: v })} onFavorite={(v) => setFilter({ favorite: v })} onClear={clearAll}
      />
      {body}
    </section>
  );
}

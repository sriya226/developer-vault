import { useCallback, useEffect, useState } from 'react';
import { listBookmarks } from '../services/bookmarkService';
import { getErrorMessage } from '../services/api';
import { useVault } from '../context/VaultContext';

// Fetches a page of bookmarks whenever the params (or vault data) change.
export default function useBookmarks(params) {
  const { version } = useVault();
  const key = JSON.stringify(params);
  const [state, setState] = useState({ items: [], total: 0, pages: 1, loading: true, error: '' });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    listBookmarks(JSON.parse(key))
      .then((data) => !cancelled && setState({ items: data.items, total: data.total, pages: data.pages, loading: false, error: '' }))
      .catch((err) => !cancelled && setState((s) => ({ ...s, loading: false, error: getErrorMessage(err, 'Could not load your resources.') })));
    return () => { cancelled = true; };
  }, [key, version]);

  // Local (optimistic) change to one item without refetching.
  const patchItem = useCallback((id, changes) => {
    setState((s) => ({ ...s, items: s.items.map((b) => (b.id === id ? { ...b, ...changes } : b)) }));
  }, []);

  return { ...state, patchItem };
}

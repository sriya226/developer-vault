import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AddResourceModal from '../components/AddResourceModal';
import EditResourceModal from '../components/EditResourceModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { deleteBookmark, setFavorite } from '../services/bookmarkService';
import { getErrorMessage } from '../services/api';
import { useToast } from './ToastContext';

const VaultContext = createContext(null);

// Hosts the add / edit / delete dialogs and tells pages when data changed.
export function VaultProvider({ children }) {
  const toast = useToast();
  const [version, setVersion] = useState(0);          // bump => lists & details refetch
  const [statsVersion, setStatsVersion] = useState(0); // bump => dashboard stats refetch
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null); // { bookmark, onDeleted }
  const [deleteBusy, setDeleteBusy] = useState(false);

  const refresh = useCallback(() => { setVersion((v) => v + 1); setStatsVersion((v) => v + 1); }, []);
  const openAdd = useCallback(() => setAdding(true), []);
  const openEdit = useCallback((bookmark) => setEditing(bookmark), []);
  const askDelete = useCallback((bookmark, onDeleted) => setDeleting({ bookmark, onDeleted }), []);

  // Optimistic: `apply(bool)` updates the caller's local state immediately; reverted on failure.
  const toggleFavorite = useCallback(async (bookmark, apply) => {
    const next = !bookmark.favorite;
    apply(next);
    try {
      await setFavorite(bookmark.id, next);
      setStatsVersion((v) => v + 1);
      toast.success(next ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      apply(!next);
      toast.error(getErrorMessage(err, 'Could not update favorite.'));
    }
  }, [toast]);

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await deleteBookmark(deleting.bookmark.id);
      toast.success('Resource deleted');
      const cb = deleting.onDeleted;
      setDeleting(null);
      refresh();
      cb?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete this resource.'));
    } finally {
      setDeleteBusy(false);
    }
  };

  const value = useMemo(
    () => ({ version, statsVersion, refresh, openAdd, openEdit, askDelete, toggleFavorite }),
    [version, statsVersion, refresh, openAdd, openEdit, askDelete, toggleFavorite]
  );

  return (
    <VaultContext.Provider value={value}>
      {children}
      {adding && <AddResourceModal onClose={() => setAdding(false)} onSaved={refresh} />}
      {editing && <EditResourceModal bookmark={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
      {deleting && (
        <ConfirmDeleteModal bookmark={deleting.bookmark} busy={deleteBusy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </VaultContext.Provider>
  );
}

export const useVault = () => useContext(VaultContext);

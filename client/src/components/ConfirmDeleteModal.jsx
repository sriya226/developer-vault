import { LoaderCircle, Trash2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDeleteModal({ bookmark, busy, onConfirm, onCancel }) {
  return (
    <Modal title="Delete resource?" size="sm" onClose={busy ? () => {} : onCancel}>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white">{bookmark.title}</span> will be permanently removed from your vault. This cannot be undone.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" data-autofocus onClick={onCancel} disabled={busy} className="btn-secondary">Cancel</button>
        <button type="button" onClick={onConfirm} disabled={busy} className="btn-danger">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
        </button>
      </div>
    </Modal>
  );
}

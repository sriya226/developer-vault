import { useState } from 'react';
import Modal from './Modal';
import ResourceForm from './ResourceForm';
import { updateBookmark } from '../services/bookmarkService';
import { Link } from 'react-router-dom';
import { getErrorCode, getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function EditResourceModal({ bookmark, onClose, onSaved }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  const submit = async (payload) => {
    setBusy(true);
    setError('');
    setCode('');
    try {
      await updateBookmark(bookmark.id, payload);
      toast.success('Changes saved');
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save your changes.'));
      setCode(getErrorCode(err) || '');
      setBusy(false);
    }
  };

  return (
    <Modal title="Edit resource" onClose={onClose}>
      <ResourceForm mode="edit" initial={bookmark} submitting={busy} error={error} errorExtra={code === 'PLAN_LIMIT' ? <Link to="/billing" onClick={onClose} className="ml-1 font-semibold underline">View plans</Link> : null} onSubmit={submit} onCancel={onClose} />
    </Modal>
  );
}

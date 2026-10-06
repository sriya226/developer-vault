import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const SIZES = { sm: 'sm:max-w-md', lg: 'sm:max-w-2xl' };

// Accessible dialog: Esc / backdrop closes, body scroll locked, focus restored. Bottom sheet on mobile.
export default function Modal({ title, onClose, children, size = 'lg' }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const panelRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('[data-autofocus]')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`card flex max-h-[92vh] w-full flex-col rounded-b-none shadow-xl sm:rounded-2xl ${SIZES[size]}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-navy-700">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

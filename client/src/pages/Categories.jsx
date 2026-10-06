import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, Folder, LoaderCircle, Lock, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import IconButton from '../components/IconButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useVault } from '../context/VaultContext';
import { addCategory, getCategories, removeCategory } from '../services/bookmarkService';
import { getErrorMessage } from '../services/api';
import { CATEGORY_ICONS } from '../utils/constants';
import { cn } from '../utils/helpers';

export default function Categories() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { version, openAdd, refresh } = useVault();
  const [state, setState] = useState({ categories: null, error: '' });
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((data) => !cancelled && setState({ categories: data.categories, error: '' }))
      .catch((err) => !cancelled && setState({ categories: null, error: getErrorMessage(err, 'Could not load categories.') }));
    return () => { cancelled = true; };
  }, [version]);

  const canAdd = user.limits?.maxCustomCategories !== 0;
  const applyList = (data) => {
    setState({ categories: data.categories, error: '' });
    updateUser({ ...user, customCategories: data.customCategories });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      applyList(await addCategory(name.trim()));
      setName('');
      toast.success('Category added');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not add this category.'));
    } finally {
      setAdding(false);
    }
  };

  const remove = async (c) => {
    const note = c.count ? ` Its ${c.count} ${c.count === 1 ? 'resource' : 'resources'} will move to "Other".` : '';
    if (!window.confirm(`Delete the category "${c.name}"?${note}`)) return;
    try {
      applyList(await removeCategory(c.name));
      refresh();
      toast.success('Category deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete this category.'));
    }
  };

  const { categories, error } = state;
  const empty = categories && categories.every((c) => c.count === 0 && !c.custom);

  let body;
  if (error) body = <EmptyState icon={CircleAlert} title="Couldn't load categories" description={error} action={{ label: 'Try again', onClick: refresh }} />;
  else if (!categories) {
    body = (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading categories">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="card h-40 animate-pulse" />)}
      </div>
    );
  } else if (empty) {
    body = <EmptyState icon={Folder} title="No categories yet" description="Categories fill up as you save resources. Add your first resource to get started." action={{ label: 'Add Resource', icon: Plus, onClick: openAdd }} />;
  } else {
    body = (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => {
          const Icon = CATEGORY_ICONS[c.name] || Folder;
          return (
            <div key={c.name} className={cn('card flex flex-col p-5', c.count === 0 && 'opacity-70')}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-slate-900 dark:text-white">{c.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{c.count} {c.count === 1 ? 'resource' : 'resources'}{c.custom && ' · custom'}</p>
                </div>
                {c.custom && <IconButton icon={Trash2} label="Delete category" danger onClick={() => remove(c)} />}
              </div>
              <Link to={`/resources?category=${encodeURIComponent(c.name)}`} className="btn-secondary mt-5">Open category</Link>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Categories" subtitle="Browse your vault by topic." />
      <section className="card mb-6 p-5" aria-label="Custom categories">
        {canAdd ? (
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="new-category" className="label">Create a custom category</label>
              <input id="new-category" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="e.g. System Design" className="input" />
            </div>
            <button type="submit" disabled={adding || !name.trim()} className="btn-primary">
              {adding ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" aria-hidden="true" />} Add category
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Custom categories are a Pro feature</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create your own categories like "System Design" or "Interview Prep".</p>
              </div>
            </div>
            <Link to="/billing" className="btn-primary shrink-0">View plans</Link>
          </div>
        )}
      </section>
      {body}
    </>
  );
}

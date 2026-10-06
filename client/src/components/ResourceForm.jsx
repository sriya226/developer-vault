import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, LoaderCircle, WandSparkles } from 'lucide-react';
import MetadataPreview from './MetadataPreview';
import { TagList } from './Badges';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { fetchMetadata } from '../services/bookmarkService';
import { getErrorMessage } from '../services/api';
import { CATEGORIES, RESOURCE_TYPES } from '../utils/constants';
import { hostnameOf, isProbablyUrl, parseTags } from '../utils/helpers';

const EMPTY = { url: '', title: '', description: '', website: '', previewImage: '', favicon: '', category: 'Other', resourceType: 'Other', tagsInput: '' };
const USER_FIELDS = ['title', 'description', 'category', 'resourceType'];

// Shared by Add and Edit. In "add" mode, entering a URL auto-fills metadata (without overwriting what the user typed).
export default function ResourceForm({ initial, mode, submitting, error, errorExtra, onSubmit, onCancel }) {
  const { user } = useAuth();
  const [form, setForm] = useState(() => (initial ? { ...EMPTY, ...initial, tagsInput: (initial.tags || []).join(', ') } : EMPTY));
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaNote, setMetaNote] = useState('');
  const [urlError, setUrlError] = useState('');
  const touched = useRef(new Set(mode === 'edit' ? USER_FIELDS : []));
  const lastFetched = useRef(mode === 'edit' ? form.url : '');
  const requestId = useRef(0);
  const debouncedUrl = useDebounce(form.url, 700);
  const [tagsError, setTagsError] = useState('');
  const maxTags = user?.limits?.maxTagsPerResource ?? null; // null = unlimited
  const canCustomCategories = user?.limits?.maxCustomCategories !== 0;
  const categoryOptions = [...new Set([...CATEGORIES, ...(user?.customCategories || []), form.category])];

  const loadMetadata = useCallback(async (url, force = false) => {
    const id = ++requestId.current;
    setMetaLoading(true);
    setMetaNote('');
    setUrlError('');
    try {
      const meta = await fetchMetadata(url);
      if (id !== requestId.current) return; // a newer request superseded this one
      if (force) { touched.current.delete('title'); touched.current.delete('description'); }
      setForm((f) => {
        const next = { ...f, website: meta.website, previewImage: meta.previewImage, favicon: meta.favicon };
        if (!touched.current.has('title')) next.title = meta.title;
        if (!touched.current.has('description')) next.description = meta.description;
        if (meta.suggestedType && (force || !touched.current.has('resourceType'))) next.resourceType = meta.suggestedType;
        return next;
      });
      if (!meta.fetched) setMetaNote("We couldn't read details from this site. You can fill them in manually.");
    } catch (err) {
      if (id === requestId.current) setUrlError(getErrorMessage(err, 'Could not check that URL.'));
    } finally {
      if (id === requestId.current) setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isProbablyUrl(debouncedUrl) || debouncedUrl === lastFetched.current) return;
    lastFetched.current = debouncedUrl;
    loadMetadata(debouncedUrl);
  }, [debouncedUrl, loadMetadata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (USER_FIELDS.includes(name)) touched.current.add(name);
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isProbablyUrl(form.url)) {
      setUrlError('Enter a valid URL, for example https://react.dev');
      return;
    }
    setUrlError('');
    const parsedTags = parseTags(form.tagsInput);
    if (maxTags !== null && parsedTags.length > maxTags && parsedTags.length > (initial?.tags?.length || 0)) {
      setTagsError(`Your ${user.effectivePlan} plan allows up to ${maxTags} tags per resource.`);
      return;
    }
    setTagsError('');
    onSubmit({
      url: form.url.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      website: form.website || hostnameOf(form.url.startsWith('http') ? form.url : `https://${form.url}`),
      previewImage: form.previewImage.trim(),
      favicon: form.favicon,
      category: form.category,
      resourceType: form.resourceType,
      tags: parsedTags,
    });
  };

  const p = `${mode}-`;
  const showPreview = metaLoading || isProbablyUrl(form.url);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <div>{error}{errorExtra}</div>
        </div>
      )}

      <div>
        <label htmlFor={`${p}url`} className="label">URL <span className="text-red-500" aria-hidden="true">*</span></label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input id={`${p}url`} name="url" data-autofocus type="text" inputMode="url" autoComplete="off" required placeholder="https://react.dev/learn" value={form.url} onChange={handleChange} aria-invalid={!!urlError} aria-describedby={urlError ? `${p}url-error` : undefined} className={`input ${urlError ? '!border-red-500' : ''}`} />
          </div>
          <button type="button" onClick={() => isProbablyUrl(form.url) ? loadMetadata(form.url, true) : setUrlError('Enter a valid URL first.')} disabled={metaLoading} className="btn-secondary shrink-0" title="Fetch title, description and image from the page">
            {metaLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
            <span className="hidden sm:inline">Fetch details</span>
          </button>
        </div>
        {urlError && <p id={`${p}url-error`} className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{urlError}</p>}
        {metaNote && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{metaNote}</p>}
      </div>

      {showPreview && <MetadataPreview data={form} loading={metaLoading} />}

      <div>
        <label htmlFor={`${p}title`} className="label">Title</label>
        <input id={`${p}title`} name="title" type="text" maxLength={200} placeholder="Filled in automatically" value={form.title} onChange={handleChange} className="input" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${p}category`} className="label">Category</label>
          <select id={`${p}category`} name="category" value={form.category} onChange={handleChange} className="input">
            {categoryOptions.map((c) => <option key={c}>{c}</option>)}
          </select>
          {!canCustomCategories && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Want your own categories? <Link to="/billing" onClick={onCancel} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">Upgrade to Pro</Link>
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${p}resourceType`} className="label">Resource type</label>
          <select id={`${p}resourceType`} name="resourceType" value={form.resourceType} onChange={handleChange} className="input">
            {RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`${p}tagsInput`} className="label">Tags</label>
        <input id={`${p}tagsInput`} name="tagsInput" type="text" placeholder="react, hooks, javascript" value={form.tagsInput} onChange={handleChange} aria-describedby={`${p}tags-hint`} className="input" />
        <p id={`${p}tags-hint`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {maxTags === null ? 'Separate tags with commas. Unlimited on your plan.' : `Separate tags with commas. Your ${user.effectivePlan} plan allows up to ${maxTags}.`}
          {maxTags !== null && <> <Link to="/billing" onClick={onCancel} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">Upgrade for unlimited</Link></>}
        </p>
        {tagsError && <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{tagsError}</p>}
        <div className="mt-2"><TagList tags={parseTags(form.tagsInput)} /></div>
      </div>

      <div>
        <label htmlFor={`${p}description`} className="label">Description</label>
        <textarea id={`${p}description`} name="description" rows={3} maxLength={1000} placeholder="What is this resource good for?" value={form.description} onChange={handleChange} className="input resize-y" />
      </div>

      <div>
        <label htmlFor={`${p}previewImage`} className="label">Preview image URL</label>
        <input id={`${p}previewImage`} name="previewImage" type="url" placeholder="Optional" value={form.previewImage} onChange={handleChange} className="input" />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-navy-700 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={submitting} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {mode === 'add' ? 'Save resource' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

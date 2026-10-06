import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, ExternalLink, Pencil, Star, Trash2 } from 'lucide-react';
import { CategoryBadge, TagList, TypeBadge } from '../components/Badges';
import { Favicon, PreviewImage } from '../components/media';
import EmptyState from '../components/EmptyState';
import PageLoader from '../components/PageLoader';
import { useVault } from '../context/VaultContext';
import { getBookmark } from '../services/bookmarkService';
import { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/helpers';

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { version, openEdit, askDelete, toggleFavorite } = useVault();
  const [state, setState] = useState({ bookmark: null, error: '', notFound: false });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getBookmark(id)
      .then((bookmark) => !cancelled && setState({ bookmark, error: '', notFound: false }))
      .catch((err) => !cancelled && setState({ bookmark: null, notFound: err.response?.status === 404, error: getErrorMessage(err, 'Could not load this resource.') }));
    return () => { cancelled = true; };
  }, [id, version]);

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/resources'));
  const { bookmark: b, error, notFound } = state;

  if (notFound || error) {
    return <EmptyState title={notFound ? 'Resource not found' : "Couldn't load this resource"} description={notFound ? 'It may have been deleted, or the link is incorrect.' : error} action={{ label: 'Back to resources', to: '/resources' }} />;
  }
  if (!b || b.id !== id) return <PageLoader />;

  const copy = async () => {
    try { await navigator.clipboard.writeText(b.url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  const onFav = () => toggleFavorite(b, (fav) => setState((s) => ({ ...s, bookmark: { ...s.bookmark, favorite: fav } })));

  return (
    <article className="mx-auto max-w-3xl">
      <button type="button" onClick={goBack} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
      </button>
      <div className="card overflow-hidden">
        <PreviewImage src={b.previewImage} name={b.website} className="h-56 w-full sm:h-72" />
        <div className="space-y-5 p-5 sm:p-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Favicon src={b.favicon} name={b.website} className="h-5 w-5" />
            <span className="font-mono">{b.website}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{b.title}</h1>
          <a href={b.url} target="_blank" rel="noopener noreferrer" className="block break-all text-sm text-indigo-600 hover:underline dark:text-indigo-300">{b.url}</a>
          <p className="max-w-prose text-slate-600 dark:text-slate-300">{b.description || 'No description added.'}</p>
          <div className="flex flex-wrap gap-2"><CategoryBadge category={b.category} /><TypeBadge type={b.resourceType} /></div>
          <TagList tags={b.tags} />
          <dl className="grid gap-4 border-t border-slate-200 pt-5 text-sm dark:border-navy-700 sm:grid-cols-2">
            <div><dt className="text-slate-500 dark:text-slate-400">Added</dt><dd className="font-medium text-slate-900 dark:text-white">{formatDate(b.createdAt)}</dd></div>
            <div><dt className="text-slate-500 dark:text-slate-400">Last updated</dt><dd className="font-medium text-slate-900 dark:text-white">{formatDate(b.updatedAt)}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5 dark:border-navy-700">
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="btn-primary"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Open Website</a>
            <button type="button" onClick={onFav} aria-pressed={b.favorite} className="btn-secondary">
              <Star className={`h-4 w-4 ${b.favorite ? 'fill-amber-400 text-amber-400' : ''}`} aria-hidden="true" /> {b.favorite ? 'Favorited' : 'Favorite'}
            </button>
            <button type="button" onClick={copy} className="btn-secondary">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy URL'}</button>
            <button type="button" onClick={() => openEdit(b)} className="btn-secondary"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</button>
            <button type="button" onClick={() => askDelete(b, () => navigate('/resources', { replace: true }))} className="btn-secondary !text-red-600 dark:!text-red-400"><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</button>
          </div>
        </div>
      </div>
    </article>
  );
}

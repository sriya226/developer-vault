import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, ExternalLink, Pencil, Star, Trash2 } from 'lucide-react';
import IconButton from './IconButton';
import { CategoryBadge, TagList, TypeBadge } from './Badges';
import { Favicon, PreviewImage } from './media';
import { formatDate } from '../utils/helpers';

function ResourceCard({ bookmark: b, onToggleFavorite, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(b.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <article className="card flex flex-col transition-shadow hover:shadow-md">
      <Link to={`/resources/${b.id}`} tabIndex={-1} aria-hidden="true" className="block overflow-hidden rounded-t-2xl">
        <PreviewImage src={b.previewImage} name={b.website} className="h-40 w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Favicon src={b.favicon} name={b.website} />
          <span className="truncate font-mono">{b.website}</span>
        </div>
        <div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-white">
            <Link to={`/resources/${b.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-300">{b.title}</Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{b.description || 'No description added.'}</p>
        </div>
        <div className="flex flex-wrap gap-2"><CategoryBadge category={b.category} /><TypeBadge type={b.resourceType} /></div>
        <TagList tags={b.tags} />
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 dark:border-navy-700">
        <span className="pl-1 text-xs text-slate-400">{formatDate(b.createdAt)}</span>
        <div className="flex">
          <IconButton icon={ExternalLink} label="Open website" href={b.url} />
          <IconButton icon={copied ? Check : Copy} label={copied ? 'Copied' : 'Copy URL'} onClick={copy} />
          <IconButton icon={Star} label={b.favorite ? 'Remove favorite' : 'Add favorite'} active={b.favorite} onClick={() => onToggleFavorite(b)} />
          <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(b)} />
          <IconButton icon={Trash2} label="Delete" danger onClick={() => onDelete(b)} />
        </div>
      </div>
    </article>
  );
}

export default memo(ResourceCard);

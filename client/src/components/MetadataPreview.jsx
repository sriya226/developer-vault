import { LoaderCircle } from 'lucide-react';
import { Favicon, PreviewImage } from './media';

export default function MetadataPreview({ data, loading }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-navy-700 dark:bg-navy-900" aria-live="polite">
      <PreviewImage src={data.previewImage} name={data.website} className="h-32 w-full sm:h-40" />
      <div className="space-y-1 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Favicon src={data.favicon} name={data.website} className="h-4 w-4" />
          <span className="truncate font-mono">{data.website}</span>
        </div>
        <p className="line-clamp-2 font-semibold text-slate-900 dark:text-white">{data.title || 'Untitled resource'}</p>
        {data.description && <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{data.description}</p>}
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/80 text-sm font-medium text-slate-700 dark:bg-navy-900/80 dark:text-slate-200">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Fetching page details...
        </div>
      )}
    </div>
  );
}

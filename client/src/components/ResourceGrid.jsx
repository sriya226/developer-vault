import ResourceCard from './ResourceCard';
import LoadingSkeleton from './LoadingSkeleton';

export default function ResourceGrid({ items, loading, onToggleFavorite, onEdit, onDelete }) {
  if (loading) return <LoadingSkeleton />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((b) => (
        <ResourceCard key={b.id} bookmark={b} onToggleFavorite={onToggleFavorite} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

import { LoaderCircle } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <LoaderCircle className="h-7 w-7 animate-spin text-indigo-500" />
    </div>
  );
}

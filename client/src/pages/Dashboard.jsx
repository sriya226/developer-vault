import { useEffect, useState } from 'react';
import { Clock, Folder, Library, Plus, Star } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import ResourceBrowser from '../components/ResourceBrowser';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { getStats } from '../services/bookmarkService';
import { greeting } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const { openAdd, statsVersion } = useVault();
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((s) => { if (!cancelled) { setStats(s); setFailed(false); } })
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, [statsVersion]);

  const val = (k) => (failed ? '-' : stats?.[k]);
  const loading = !stats && !failed;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        subtitle="Manage and organize your developer resources."
        actions={<button type="button" onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> Add Resource</button>}
      />
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard icon={Library} label="Total Resources" value={val('total')} loading={loading} />
        <StatsCard icon={Star} label="Favorites" value={val('favorites')} loading={loading} />
        <StatsCard icon={Folder} label="Categories" value={val('categories')} loading={loading} hint="In use" />
        <StatsCard icon={Clock} label="Recently Added" value={val('recent')} loading={loading} hint="Last 7 days" />
      </div>
      <ResourceBrowser />
    </>
  );
}

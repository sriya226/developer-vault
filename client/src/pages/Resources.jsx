import { Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ResourceBrowser from '../components/ResourceBrowser';
import { useVault } from '../context/VaultContext';

export default function Resources() {
  const { openAdd } = useVault();
  return (
    <>
      <PageHeader title="All Resources" subtitle="Everything you've saved, searchable and filterable."
        actions={<button type="button" onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> Add Resource</button>} />
      <ResourceBrowser />
    </>
  );
}

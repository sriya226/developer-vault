import PageHeader from '../components/PageHeader';
import ResourceBrowser from '../components/ResourceBrowser';

export default function Favorites() {
  return (
    <>
      <PageHeader title="Favorites" subtitle="Your starred resources." />
      <ResourceBrowser favoritesOnly />
    </>
  );
}

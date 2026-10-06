import { useState } from 'react';
import { Download, LoaderCircle, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../services/authService';
import { exportBookmarks } from '../services/bookmarkService';
import { getErrorMessage } from '../services/api';
import { downloadBlob } from '../utils/helpers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Section({ title, description, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      updateUser(await updateProfile({ name: form.name.trim(), email: form.email.trim() }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update your profile.'));
    } finally {
      setSaving(false);
    }
  };

  const doExport = async () => {
    setExporting(true);
    try {
      downloadBlob(await exportBookmarks(), 'bookmarks.json');
      toast.success('Exported bookmarks.json');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not export your bookmarks.'));
    } finally {
      setExporting(false);
    }
  };

  const themeBtn = (value, Icon, label) => (
    <button type="button" aria-pressed={theme === value} onClick={() => setTheme(value)}
      className={`btn flex-1 border ${theme === value ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-navy-600 dark:text-slate-300 dark:hover:bg-navy-700'}`}>
      <Icon className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, appearance and data." />
      <div className="max-w-2xl space-y-6">
        <Section title="Profile">
          <form onSubmit={saveProfile} noValidate className="space-y-4">
            <FormField id="name" label="Name" autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
            <FormField id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} />
            <button type="submit" disabled={saving} className="btn-primary">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />} Save profile</button>
          </form>
        </Section>
        <Section title="Appearance" description="Choose how Developer Vault looks on this device.">
          <div className="flex gap-3">{themeBtn('light', Sun, 'Light mode')}{themeBtn('dark', Moon, 'Dark mode')}</div>
        </Section>
        <Section title="Data" description="Download every resource in your vault as a JSON file.">
          <button type="button" onClick={doExport} disabled={exporting} className="btn-secondary">
            {exporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" aria-hidden="true" />} Export bookmarks as JSON
          </button>
        </Section>
        <Section title="Account">
          <button type="button" onClick={() => { logout(); navigate('/', { replace: true }); }} className="btn-secondary"><LogOut className="h-4 w-4" aria-hidden="true" /> Log out</button>
        </Section>
      </div>
    </>
  );
}

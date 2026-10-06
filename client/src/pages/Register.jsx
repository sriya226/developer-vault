import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = 'Include at least one letter and one number.';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setServerError('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, confirmPassword: form.confirmPassword });
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not create your account. Please try again.'));
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your vault" subtitle="Start saving developer resources in under a minute." error={serverError}
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">Log in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField id="name" label="Name" autoComplete="name" value={form.name} onChange={onChange} error={errors.name} />
        <FormField id="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} error={errors.email} />
        <FormField id="password" label="Password" type="password" autoComplete="new-password" hint="At least 8 characters with a letter and a number." value={form.password} onChange={onChange} error={errors.password} />
        <FormField id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={onChange} error={errors.confirmPassword} />
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Create account
        </button>
      </form>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setServerError('');
    try {
      await login({ email: form.email.trim(), password: form.password });
      // PublicRoute redirects to the dashboard once the user is set.
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not log you in. Please try again.'));
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to open your vault." error={serverError}
      footer={<>New here? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">Create an account</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField id="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} error={errors.email} />
        <FormField id="password" label="Password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} error={errors.password} />
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Log in
        </button>
      </form>
    </AuthShell>
  );
}

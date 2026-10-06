import { useCallback, useEffect, useState } from 'react';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder, getBillingStatus, loadRazorpay, verifyPayment } from '../services/billingService';
import { getErrorMessage } from '../services/api';
import { PLAN_DAYS, PLAN_LIST, PLAN_RANK } from '../utils/plans';
import { cn, formatDate } from '../utils/helpers';

function UsageRow({ label, used, limit }) {
  const unlimited = limit === null;
  const none = limit === 0;
  const pct = unlimited || none ? 0 : Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-medium text-slate-900 dark:text-white">{none ? 'Not included' : unlimited ? `${used} / Unlimited` : `${used} / ${limit}`}</span>
      </div>
      {!unlimited && !none && (
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-navy-700" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
          <div className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : 'bg-indigo-600')} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

export default function Billing() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getBillingStatus()
      .then((s) => !cancelled && (setStatus(s), setLoadError('')))
      .catch((err) => !cancelled && setLoadError(getErrorMessage(err, 'Could not load your billing details.')));
    return () => { cancelled = true; };
  }, [reload]);

  const current = user.effectivePlan;
  const lapsed = user.plan !== 'free' && current === 'free';

  const checkout = useCallback(async (planId) => {
    const plan = PLAN_LIST.find((p) => p.id === planId);
    setBusy(planId);
    try {
      if (!(await loadRazorpay())) throw new Error('script');
      const order = await createOrder(planId);
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Developer Vault',
        description: `${plan.name} plan, ${PLAN_DAYS} days`,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#4f46e5' },
        handler: async (response) => {
          try {
            updateUser(await verifyPayment(response));
            toast.success(`You're now on the ${plan.name} plan`);
            setReload((n) => n + 1);
          } catch (err) {
            toast.error(getErrorMessage(err, 'Payment received but verification failed. Contact support with your payment ID.'));
          } finally {
            setBusy('');
          }
        },
        modal: { ondismiss: () => setBusy('') },
      });
      rzp.on('payment.failed', (r) => { toast.error(r.error?.description || 'Payment failed. Please try again.'); setBusy(''); });
      rzp.open();
    } catch (err) {
      toast.error(err.message === 'script' ? 'Could not load the payment window. Check your connection.' : getErrorMessage(err, 'Could not start the payment.'));
      setBusy('');
    }
  }, [user, updateUser, toast]);

  const ctaLabel = (id) => {
    if (id === current) return `Renew for ${PLAN_DAYS} days`;
    return PLAN_RANK[id] > PLAN_RANK[current] ? `Upgrade to ${PLAN_LIST.find((p) => p.id === id).name}` : `Switch to ${PLAN_LIST.find((p) => p.id === id).name}`;
  };

  return (
    <>
      <PageHeader title="Billing & plans" subtitle="Upgrade for more resources, unlimited tags and custom categories." />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200" role="note">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p><strong>Test mode.</strong> No real money is charged. In the payment window use card <span className="font-mono">4111 1111 1111 1111</span> with any future expiry and any CVV, or UPI <span className="font-mono">success@razorpay</span>.</p>
      </div>

      {lapsed && <p className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-navy-700 dark:bg-navy-800" role="status">Your {user.plan} plan expired on {formatDate(user.planExpiresAt)}. You're on Free now. Your saved resources are safe, but new ones follow the Free limits.</p>}
      {loadError && <p className="mb-6 text-sm text-red-600 dark:text-red-400" role="alert">{loadError}</p>}
      {status && !status.paymentsEnabled && <p className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-navy-700 dark:bg-navy-800" role="status">Payments are not configured on this server yet. Add Razorpay test keys to the server environment to enable upgrades.</p>}

      <section className="card mb-8 p-5 sm:p-6" aria-label="Current plan">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Current plan</p>
            <h2 className="text-2xl font-bold capitalize text-slate-900 dark:text-white">{current}</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{current === 'free' ? 'Free forever' : `Active until ${formatDate(user.planExpiresAt)}`}</p>
        </div>
        {status ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <UsageRow label="Resources" used={status.usage.resources} limit={status.limits.maxResources} />
            <UsageRow label="Custom categories" used={status.usage.customCategories} limit={status.limits.maxCustomCategories} />
          </div>
        ) : !loadError && <div className="mt-5 h-10 animate-pulse rounded bg-slate-200 dark:bg-navy-700" aria-label="Loading usage" />}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLAN_LIST.map((p) => {
          const isCurrent = p.id === current;
          return (
            <section key={p.id} className={cn('card flex flex-col p-6', p.popular && 'border-indigo-500 ring-1 ring-indigo-500 dark:border-indigo-500')} aria-label={`${p.name} plan`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{p.name}</h2>
                {p.popular && <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">Popular</span>}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.tagline}</p>
              <p className="mt-4"><span className="text-3xl font-bold text-slate-900 dark:text-white">{p.price ? `₹${p.price}` : '₹0'}</span><span className="text-sm text-slate-500 dark:text-slate-400">{p.price ? ` / ${PLAN_DAYS} days` : ''}</span></p>
              <ul className="my-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />{f}</li>
                ))}
              </ul>
              {p.id === 'free' ? (
                <button type="button" disabled className="btn-secondary">{isCurrent ? 'Current plan' : 'Included by default'}</button>
              ) : (
                <button type="button" onClick={() => checkout(p.id)} disabled={!!busy || (status && !status.paymentsEnabled)} className={isCurrent ? 'btn-secondary' : 'btn-primary'}>
                  {busy === p.id && <LoaderCircle className="h-4 w-4 animate-spin" />} {ctaLabel(p.id)}
                </button>
              )}
            </section>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Each purchase adds {PLAN_DAYS} days. Renewing the same plan extends your current period; switching plans starts today.</p>

      {status?.payments?.length > 0 && (
        <section className="mt-10" aria-label="Payment history">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Payment history</h2>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-navy-700 dark:text-slate-400">
                <tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Plan</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Payment ID</th></tr>
              </thead>
              <tbody>
                {status.payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 dark:border-navy-700">
                    <td className="px-4 py-3">{formatDate(p.paidAt)}</td>
                    <td className="px-4 py-3 capitalize">{p.plan}</td>
                    <td className="px-4 py-3">₹{(p.amount / 100).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.paymentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

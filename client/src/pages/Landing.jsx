import { Link } from 'react-router-dom';
import {
  ArrowRight, Bookmark, Check, Filter, Layers, Library, Lock, MessageSquare, Search, SearchX,
  Shuffle, ShieldCheck, Sparkles, Star,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { PLAN_DAYS, PLAN_LIST } from '../utils/plans';

const PROBLEMS = [
  { icon: Layers, title: 'Too many browser tabs', text: 'Forty tabs open "for later" slow you down and never get read.' },
  { icon: MessageSquare, title: 'Links scattered across chats', text: 'The good link is buried somewhere in a group chat from March.' },
  { icon: Shuffle, title: 'Disorganized bookmarks', text: 'One flat list of untitled bookmarks is not a system.' },
  { icon: SearchX, title: 'Hard to find later', text: 'You remember the resource, but not where you saved it.' },
];

const FEATURES = [
  { icon: Bookmark, title: 'Smart Bookmarking', text: 'Save docs, tutorials, repositories and tools with a category, type and tags.' },
  { icon: Search, title: 'Fast Search', text: 'Search titles, descriptions, websites and tags as you type.' },
  { icon: Filter, title: 'Category Filtering', text: 'Combine category, type and favorites to narrow down in one click.' },
  { icon: Sparkles, title: 'Automatic Metadata', text: 'Paste a URL and the title, description, image and favicon are filled in.' },
  { icon: ShieldCheck, title: 'Secure Authentication', text: 'Hashed passwords and signed tokens keep your account protected.' },
  { icon: Lock, title: 'Personal Resource Vault', text: 'Your resources are private to you, and you can export them any time.' },
];

const STEPS = [
  { title: 'Paste a URL', text: 'Drop in any documentation, tutorial or repository link.' },
  { title: 'Metadata is automatically retrieved', text: 'We fetch the title, description, image and favicon for you.' },
  { title: 'Add category and tags', text: 'Choose a category and resource type, then add a few tags.' },
  { title: 'Save and find resources anytime', text: 'Search and filter your vault whenever you need something.' },
];

const MOCK = [
  { t: 'React Documentation', d: 'react.dev', c: 'React', tags: '#react #javascript', fav: true },
  { t: 'MDN Web Docs', d: 'developer.mozilla.org', c: 'Web Development', tags: '#html #css', fav: false },
  { t: 'MongoDB Manual', d: 'mongodb.com', c: 'Databases', tags: '#mongodb #nosql', fav: true },
  { t: 'Express.js Guide', d: 'expressjs.com', c: 'Node.js', tags: '#express #api', fav: false },
];

function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-navy-600 dark:bg-navy-900" aria-hidden="true">
      <div className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3 dark:border-navy-700">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-navy-600" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-navy-600" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-navy-600" />
        <span className="ml-3 rounded bg-slate-100 px-3 py-0.5 font-mono text-[10px] text-slate-400 dark:bg-navy-800">developer-vault/dashboard</span>
      </div>
      <div className="flex">
        <div className="hidden w-32 shrink-0 space-y-1.5 border-r border-slate-200 p-3 dark:border-navy-700 sm:block">
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-white"><span className="h-4 w-4 rounded bg-indigo-600" />Vault</div>
          {['Dashboard', 'Resources', 'Favorites', 'Categories'].map((n, i) => (
            <div key={n} className={`rounded px-2 py-1.5 text-[11px] font-medium ${i === 0 ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>{n}</div>
          ))}
        </div>
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[['Resources', '48'], ['Favorites', '12'], ['Categories', '7']].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-slate-200 p-2 dark:border-navy-700"><p className="text-[10px] text-slate-500 dark:text-slate-400">{l}</p><p className="text-lg font-bold text-slate-900 dark:text-white">{v}</p></div>
            ))}
          </div>
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-400 dark:border-navy-700"><Search className="h-3 w-3" />Search resources...</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {MOCK.map((m) => (
              <div key={m.t} className="rounded-lg border border-slate-200 p-3 dark:border-navy-700">
                <div className="mb-2 h-10 rounded bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20" />
                <div className="flex items-start justify-between gap-1"><p className="truncate text-[11px] font-semibold text-slate-900 dark:text-white">{m.t}</p><Star className={`h-3 w-3 shrink-0 ${m.fav ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-navy-600'}`} /></div>
                <p className="truncate font-mono text-[10px] text-slate-400">{m.d}</p>
                <span className="mt-1.5 inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{m.c}</span>
                <p className="mt-1 font-mono text-[10px] text-slate-400">{m.tags}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryTo = isAuthenticated ? '/dashboard' : '/register';

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section id="home" className="scroll-mt-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.4rem]">Your Developer Resources. One Organized Vault.</h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400">Save, organize, and instantly find tutorials, documentation, GitHub repositories, and developer tools in one secure workspace.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={primaryTo} className="btn-primary px-6 py-3 text-base">Get Started <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                {!isAuthenticated && <Link to="/login" className="btn-secondary px-6 py-3 text-base">Login</Link>}
              </div>
            </div>
            <DashboardMockup />
          </div>
        </section>

        {/* Problem */}
        <section className="border-y border-slate-200 bg-white py-20 dark:border-navy-700 dark:bg-navy-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Useful links get lost. Finding them again shouldn't take a search party.</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {PROBLEMS.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Everything you need to keep your best resources close</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="card p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 border-y border-slate-200 bg-white py-20 dark:border-navy-700 dark:bg-navy-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">How it works</h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-mono text-sm font-medium text-white">{i + 1}</span>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-16 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Simple pricing</h2>
            <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-400">Start free. Upgrade when your vault outgrows it. Payments run in test mode in this demo, so no real money is charged.</p>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {PLAN_LIST.map((p) => (
                <div key={p.id} className={`card flex flex-col p-6 ${p.popular ? 'border-indigo-500 ring-1 ring-indigo-500 dark:border-indigo-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                    {p.popular && <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">Popular</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.tagline}</p>
                  <p className="mt-4"><span className="text-3xl font-bold text-slate-900 dark:text-white">{`₹${p.price}`}</span><span className="text-sm text-slate-500 dark:text-slate-400">{p.price ? ` / ${PLAN_DAYS} days` : ''}</span></p>
                  <ul className="my-6 flex-1 space-y-2.5">
                    {p.features.map((f) => <li key={f} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />{f}</li>)}
                  </ul>
                  <Link to={isAuthenticated ? '/billing' : '/register'} className={p.popular ? 'btn-primary' : 'btn-secondary'}>{p.price ? `Choose ${p.name}` : 'Start free'}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center rounded-3xl bg-navy-900 px-6 py-16 text-center dark:border dark:border-navy-600">
            <Library className="h-8 w-8 text-indigo-400" aria-hidden="true" />
            <h2 className="mt-5 max-w-xl text-3xl font-bold text-white">Build your personal developer knowledge vault.</h2>
            <Link to={primaryTo} className="btn-primary mt-8 px-6 py-3 text-base">Create Your Vault</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-10 dark:border-navy-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} Developer Vault. Built with the MERN stack.</p>
        </div>
      </footer>
    </div>
  );
}

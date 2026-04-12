import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  Scale,
  Sparkles,
  CheckCircle2,
  Lock,
  CreditCard,
  Fingerprint,
  FileText,
  Cookie,
  AlertTriangle,
  RefreshCw,
  Users,
} from 'lucide-react';
import PublicNavbar from './PublicNavbar';

export type LegalSection = {
  id: string;
  title: string;
  body: string;
  points?: string[];
};

type PublicLegalLayoutProps = {
  title: string;
  titleAccent?: string;
  subtitle: string;
  badgeLabel?: string;
  effectiveDate?: string;
  intro?: string;
  sections?: LegalSection[];
  children?: ReactNode;
};

const ICONS = [
  ShieldCheck,
  FileText,
  Users,
  CreditCard,
  Fingerprint,
  AlertTriangle,
  Lock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Scale,
  Cookie,
];

export default function PublicLegalLayout({
  title,
  titleAccent,
  subtitle,
  badgeLabel = 'Legal Information',
  effectiveDate,
  intro,
  sections,
  children,
}: PublicLegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>(sections?.[0]?.id ?? '');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!sections || sections.length === 0) return;
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  const words = title.split(' ');
  const accent = titleAccent ?? words.at(-1) ?? '';
  const base = titleAccent ? title : words.slice(0, -1).join(' ');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fc' }}>
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-amber-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-slate-100/80 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm mb-6">
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            {badgeLabel}
          </span>

          {/* Title */}
          <h1 className="text-[2.8rem] sm:text-[4.5rem] font-black leading-[1.05] tracking-tight text-slate-900 mb-5">
            {base}{' '}
            <span className="text-amber-500">{accent}</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-500 leading-relaxed">{subtitle}</p>

          {/* Effective date */}
          {effectiveDate && (
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Effective Date: {effectiveDate}
            </p>
          )}
        </div>
      </div>

      {/* ── Divider line ─────────────────────────────────────── */}
      <div className="h-px bg-slate-200" />

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {sections && sections.length > 0 ? (
          <div className="flex gap-10 items-start">
            {/* ── Left sidebar ─────────────────────────────── */}
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-4">
                  {badgeLabel === 'Cookie Information' ? 'Cookie Sections' : 'Agreement Sections'}
                </p>
                <nav className="space-y-0.5">
                  {sections.map((section) => {
                    const isActive = activeId === section.id;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={() => setActiveId(section.id)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                        {section.title.replace(/^\d+\.\s*/, '')}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* ── Right content ─────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {intro && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-8 shadow-sm">
                  <p className="text-slate-500 text-base italic leading-relaxed">{intro}</p>
                </div>
              )}

              <div className="space-y-5">
                {sections.map((section, index) => {
                  const Icon = ICONS[index % ICONS.length];
                  return (
                    <article
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm"
                    >
                      {/* Section header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-11 h-11 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                          <Icon className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-0.5">
                            Section {index + 1}
                          </p>
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                            {section.title.replace(/^\d+\.\s*/, '')}
                          </h2>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-100 mb-4" />

                      {/* Body */}
                      <p className="text-slate-600 text-[15px] leading-relaxed">{section.body}</p>

                      {/* Optional bullet points */}
                      {section.points && section.points.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {section.points.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2 text-[14px] text-slate-600">
                              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              {pt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Footer note */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <p className="text-[13px] text-slate-400">
                  For questions about this document, contact us at{' '}
                  <a href="mailto:legal@legalpadhai.ai" className="text-amber-600 font-semibold hover:underline">
                    legal@legalpadhai.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

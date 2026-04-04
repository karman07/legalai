// ─────────────────────────────────────────────────────────────
// LegalPadhai.ai — Centralized UI Color Constants
// ALL colors used in the app must be referenced from here.
// Theme is controlled via ThemeContext (contexts/ThemeContext.tsx)
// and persisted to localStorage under the key "theme".
// The Tailwind `dark` class is toggled on <html> by ThemeContext.
// ─────────────────────────────────────────────────────────────

export const COLORS = {
  // ── Brand: Deep Navy ─────────────────────────────────────
  BRAND_950:  '#020617',
  BRAND_900:  '#0f172a',
  BRAND_800:  '#1e293b',
  BRAND_700:  '#334155',
  BRAND_600:  '#475569',
  BRAND_500:  '#64748b',
  BRAND_400:  '#94a3b8',
  BRAND_300:  '#cbd5e1',
  BRAND_200:  '#e2e8f0',
  BRAND_100:  '#f1f5f9',
  BRAND_50:   '#f8fafc',

  // ── Gold Accent (Law / Justice) ───────────────────────────
  GOLD_900:   '#78350f',
  GOLD_800:   '#92400e',
  GOLD_700:   '#b45309',
  GOLD_600:   '#d97706',
  GOLD_500:   '#f59e0b',
  GOLD_400:   '#fbbf24',
  GOLD_300:   '#fcd34d',
  GOLD_200:   '#fde68a',
  GOLD_100:   '#fef3c7',
  GOLD_50:    '#fffbeb',

  // ── Surfaces ─────────────────────────────────────────────
  WHITE:           '#ffffff',
  PAGE_BG:         '#f8fafc',
  SURFACE:         '#ffffff',

  // ── Text ─────────────────────────────────────────────────
  TEXT_HEADING:     '#0f172a',
  TEXT_BODY:        '#334155',
  TEXT_SECONDARY:   '#64748b',
  TEXT_MUTED:       '#94a3b8',
  TEXT_PLACEHOLDER: '#94a3b8',
  TEXT_INVERSE:     '#ffffff',
  TEXT_GOLD:        '#d97706',

  // ── Borders ──────────────────────────────────────────────
  BORDER_DEFAULT:  '#e2e8f0',
  BORDER_SUBTLE:   '#f1f5f9',
  BORDER_STRONG:   '#cbd5e1',
  BORDER_GOLD:     '#fcd34d',

  // ── Status ───────────────────────────────────────────────
  SUCCESS:         '#059669',
  SUCCESS_BG:      '#ecfdf5',
  SUCCESS_BORDER:  '#a7f3d0',
  ERROR:           '#dc2626',
  ERROR_BG:        '#fef2f2',
  ERROR_BORDER:    '#fecaca',
  WARNING:         '#d97706',
  WARNING_BG:      '#fffbeb',
  INFO:            '#2563eb',
  INFO_BG:         '#eff6ff',

  // ── Feature Accent Colors ─────────────────────────────────
  FEATURE_MCQ:          '#3b82f6',
  FEATURE_MCQ_BG:       '#eff6ff',
  FEATURE_CASES:        '#d97706',
  FEATURE_CASES_BG:     '#fffbeb',
  FEATURE_NOTES:        '#059669',
  FEATURE_NOTES_BG:     '#ecfdf5',
  FEATURE_DOUBTS:       '#dc2626',
  FEATURE_DOUBTS_BG:    '#fef2f2',
  FEATURE_CHATBOT:      '#0891b2',
  FEATURE_CHATBOT_BG:   '#ecfeff',
  FEATURE_EXPERT:       '#7c3aed',
  FEATURE_EXPERT_BG:    '#f5f3ff',
  FEATURE_AUDIO:        '#ea580c',
  FEATURE_AUDIO_BG:     '#fff7ed',
  FEATURE_ANSWERS:      '#db2777',
  FEATURE_ANSWERS_BG:   '#fdf2f8',
  FEATURE_LIBRARY:      '#0d9488',
  FEATURE_LIBRARY_BG:   '#f0fdfa',

  // ── Sidebar ───────────────────────────────────────────────
  SIDEBAR_BG:         '#0f172a',
  SIDEBAR_BORDER:     '#1e293b',
  SIDEBAR_TEXT:       '#94a3b8',
  SIDEBAR_TEXT_HOVER: '#e2e8f0',
  SIDEBAR_ACTIVE_BG:  'rgba(245,158,11,0.12)',
  SIDEBAR_ACTIVE_TEXT:'#fbbf24',
} as const;

// ─────────────────────────────────────────────────────────────
// DARK MODE SEMANTIC TOKENS
// Used with Tailwind `dark:` prefix.  Applied automatically
// when ThemeContext adds the `dark` class to <html>.
//
//  Light → Dark mapping:
//   Page bg:     bg-brand-50   → dark:bg-brand-950
//   Surface:     bg-white      → dark:bg-brand-800
//   Card border: border-brand-200 → dark:border-brand-700
//   Text:        text-brand-900 → dark:text-brand-100
//   Sub-text:    text-brand-600 → dark:text-brand-300
//   Muted:       text-brand-400 → dark:text-brand-500
//   Input bg:    bg-white       → dark:bg-brand-800
//   Header bg:   bg-white       → dark:bg-brand-900
// ─────────────────────────────────────────────────────────────
export const DARK_COLORS = {
  PAGE_BG:        '#020617',   // brand-950
  SURFACE:        '#1e293b',   // brand-800
  SURFACE_RAISED: '#334155',   // brand-700
  BORDER:         '#334155',   // brand-700
  BORDER_SUBTLE:  '#1e293b',   // brand-800
  TEXT_PRIMARY:   '#f1f5f9',   // brand-100
  TEXT_SECONDARY: '#cbd5e1',   // brand-300
  TEXT_MUTED:     '#64748b',   // brand-500
  INPUT_BG:       '#1e293b',   // brand-800
  HEADER_BG:      '#0f172a',   // brand-900
} as const;

export type ColorKey = keyof typeof COLORS;
export type DarkColorKey = keyof typeof DARK_COLORS;

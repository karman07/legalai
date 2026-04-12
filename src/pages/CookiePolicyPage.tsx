import PublicLegalLayout, { LegalSection } from '../components/PublicLegalLayout';

const sections: LegalSection[] = [
  {
    id: 'what',
    title: '1. What Are Cookies',
    body: 'Cookies are small text files placed on your device by websites you visit. They enable the site to remember actions and preferences over a period of time and are widely used to make websites work efficiently.',
    points: [
      'Session cookies are temporary and deleted when you close your browser.',
      'Persistent cookies remain on your device until they expire or are manually deleted.',
      'First-party cookies are set by LegalPadhai.ai; third-party cookies are set by our service partners.',
    ],
  },
  {
    id: 'types',
    title: '2. Categories of Cookies We Use',
    body: 'We deploy cookies across several categories, each serving a specific and necessary function within the platform.',
    points: [
      'Strictly necessary: authentication tokens, CSRF protection, and session management. These cannot be disabled without breaking core functionality.',
      'Performance and analytics: aggregate usage metrics that help us identify areas for improvement. No personally identifiable information is included.',
      'Functional: user preferences such as theme, language, and study-progress state.',
      'Third-party integrations: tools like analytics or payment processors may set their own cookies governed by their respective policies.',
    ],
  },
  {
    id: 'duration',
    title: '3. Cookie Durations',
    body: 'Different cookies persist for different periods depending on their purpose.',
    points: [
      'Session cookies: expire as soon as the browser session ends.',
      'Authentication tokens: valid for up to 7 days by default; extended with "Remember me".',
      'Analytics cookies: typically retain data for up to 13 months before automatic expiry.',
      'Preference cookies: stored for up to 12 months or until manually cleared.',
    ],
  },
  {
    id: 'manage',
    title: '4. Managing Your Cookie Preferences',
    body: 'You have full control over which non-essential cookies are stored on your device. Cookie preferences can be adjusted through browser settings or a consent management interface when available.',
    points: [
      'Chrome: Settings → Privacy and Security → Cookies and other site data.',
      'Firefox: Settings → Privacy and Security → Cookies and Site Data.',
      'Safari: Preferences → Privacy → Manage website data.',
      'Blocking strictly necessary cookies will prevent login and other core features from working correctly.',
    ],
  },
  {
    id: 'updates',
    title: '5. Policy Updates',
    body: 'As platform features evolve, the cookies we use may change. We will update this page whenever meaningful changes to cookie usage are introduced.',
    points: [
      'The effective date at the top of this page reflects the most recent revision.',
      'Significant changes will be communicated via in-app notice or email where appropriate.',
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <PublicLegalLayout
      title="Cookie"
      titleAccent="Policy"
      subtitle="Learn how LegalPadhai.ai uses cookies and similar technologies to support security, performance, and experience continuity."
      badgeLabel="Cookie Information"
      effectiveDate="April 12, 2026"
      intro="This Cookie Policy describes the types of cookies deployed on LegalPadhai.ai, the purpose of each, and the controls available to you as a user. We are committed to transparency in how we track and store information on your device."
      sections={sections}
    />
  );
}

import PublicLegalLayout, { LegalSection } from '../components/PublicLegalLayout';

const sections: LegalSection[] = [
  {
    id: 'collect',
    title: '1. Information We Collect',
    body: 'We collect several categories of information to operate the platform, personalise your experience, and continually improve service quality.',
    points: [
      'Account information: name, email address, and profile details provided at registration.',
      'Learning activity: quiz attempts, notes, case-law interactions, audio playback history, and AI chat sessions.',
      'Device and usage data: IP address, browser type, OS, pages visited, and session duration.',
      'Payment information: processed securely by third-party providers; we do not store card details.',
    ],
  },
  {
    id: 'use',
    title: '2. How We Use Your Information',
    body: 'The information we collect is used exclusively to operate, secure, and improve LegalPadhai.ai. We do not use your data for unrelated commercial purposes.',
    points: [
      'Delivering and personalising platform features including recommendations and study analytics.',
      'Processing payments and managing subscription access.',
      'Sending transactional emails and important service notifications.',
      'Detecting and preventing fraud, abuse, and security incidents.',
      'Improving AI model accuracy and overall product quality through aggregated analytics.',
    ],
  },
  {
    id: 'sharing',
    title: '3. Sharing and Disclosure',
    body: 'We do not sell, rent, or trade your personal information. Data may be disclosed only in the limited circumstances described below.',
    points: [
      'Service providers: hosting, email, payment, and analytics partners operating under strict data-processing agreements.',
      'Legal compliance: when required by law, court order, or regulatory authority.',
      'Business transfers: in the event of a merger, acquisition, or asset sale, subject to the same privacy obligations.',
    ],
  },
  {
    id: 'security',
    title: '4. Data Security and Retention',
    body: 'We apply industry-standard security measures to protect your data against unauthorised access, loss, or alteration.',
    points: [
      'Data in transit is encrypted using TLS 1.2 or higher.',
      'Access to personal data is restricted to authorised personnel on a need-to-know basis.',
      'Data is retained for as long as your account is active or as required by legal obligations.',
      'Upon account deletion, personal data is removed within 30 days except where legally required.',
    ],
  },
  {
    id: 'rights',
    title: '5. Your Data Rights',
    body: 'Depending on your jurisdiction, you may have rights regarding access to, correction, deletion, and portability of your personal information.',
    points: [
      'Right of access: request a copy of the personal data we hold about you.',
      'Right to rectification: request correction of inaccurate or incomplete data.',
      'Right to erasure: request deletion of your account and associated personal data.',
      'Right to portability: receive your data in a structured, machine-readable format.',
      'To exercise any right, contact us at info@aiforjob.ai with verification details.',
    ],
  },
  {
    id: 'cookies',
    title: '6. Cookies and Tracking',
    body: 'We use cookies and similar technologies for authentication, analytics, and user-preference storage. For full details see our Cookie Policy.',
    points: [
      'Essential cookies are required for login and platform security.',
      'Analytics cookies help us understand aggregate usage behaviour.',
      'You may manage cookie preferences through your browser settings at any time.',
    ],
  },
  {
    id: 'updates',
    title: '7. Changes to This Policy',
    body: 'We may revise this Privacy Policy from time to time. When material changes are made, we will notify you via email or a prominent in-app notice at least 14 days before the change takes effect.',
    points: [
      'Continued use of the platform after the effective date constitutes acceptance of the updated policy.',
      'You can always find the latest version of this document on this page.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PublicLegalLayout
      title="Privacy"
      titleAccent="Policy"
      subtitle="Understand what information we collect, how we use it, and the controls available to you."
      badgeLabel="Privacy and Data"
      effectiveDate="April 12, 2026"
      intro="This Privacy Policy explains how LegalPadhai Pvt. Ltd. collects, uses, stores, and protects your personal information when you access or use the LegalPadhai.ai platform. We are committed to handling your data with transparency and care."
      sections={sections}
    />
  );
}

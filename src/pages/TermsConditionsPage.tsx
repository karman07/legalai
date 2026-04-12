import PublicLegalLayout, { LegalSection } from '../components/PublicLegalLayout';

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: 'By accessing or using LegalPadhai.ai you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to any provision, you must discontinue use of the platform immediately.',
    points: [
      'These terms apply to all visitors, registered users, and subscribers.',
      'Continued use following any amendment constitutes acceptance of the revised terms.',
      'Users under 18 must have parental or guardian consent.',
    ],
  },
  {
    id: 'service',
    title: '2. Description of Service',
    body: 'LegalPadhai.ai is an AI-powered legal-education platform that provides case-law study tools, MCQ quizzes, structured notes, audio lessons, and AI-assisted reading assistance.',
    points: [
      'Platform features and content may be updated, expanded, or removed at any time.',
      'Certain capabilities are available only to registered or subscribed users.',
      'AI-generated analysis is for study support only and does not constitute legal advice.',
    ],
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    body: 'To access personalised features you must create an account with accurate and complete information. You are solely responsible for all activity conducted under your account.',
    points: [
      'You must keep your login credentials confidential.',
      'Notify us immediately if you suspect any unauthorised account access.',
      'We reserve the right to suspend accounts involved in misuse or policy violations.',
    ],
  },
  {
    id: 'payments',
    title: '4. Payments and Subscriptions',
    body: 'Access to premium features requires a paid subscription. All pricing, billing cycles, and applicable taxes are presented at checkout and are subject to change with prior notice.',
    points: [
      'Subscriptions renew automatically unless cancelled before the renewal date.',
      'Refunds are governed by the refund policy stated at the time of purchase.',
      'Failed payments may result in temporary suspension of premium access.',
    ],
  },
  {
    id: 'ip',
    title: '5. Intellectual Property',
    body: 'All content, design, code, branding, and educational materials published on LegalPadhai.ai are the exclusive property of LegalPadhai Pvt. Ltd. or its licensors.',
    points: [
      'You may not copy, reproduce, distribute, or create derivative works without written permission.',
      'User-generated content such as notes or quiz answers remains owned by you, but you grant us a licence to display and improve the service.',
      'Trademarks and logos may not be used without prior written consent.',
    ],
  },
  {
    id: 'conduct',
    title: '6. Acceptable Use',
    body: 'You agree to use the platform lawfully and in a manner consistent with its educational purpose. The following conduct is strictly prohibited:',
    points: [
      'Attempting to reverse-engineer, scrape, or systematically download platform content.',
      'Using the platform to distribute unlawful, abusive, or infringing material.',
      'Interfering with platform infrastructure or the accounts of other users.',
    ],
  },
  {
    id: 'liability',
    title: '7. Limitation of Liability',
    body: 'To the maximum extent permitted by applicable law, LegalPadhai.ai and its officers, directors, and employees shall not be liable for indirect, incidental, consequential, or punitive damages arising from use of the platform.',
    points: [
      'Content does not constitute legal advice and should not be relied upon as such.',
      'We do not warrant that the platform will be error-free or uninterrupted at all times.',
      'Your sole remedy for dissatisfaction is to discontinue use of the platform.',
    ],
  },
  {
    id: 'termination',
    title: '8. Termination',
    body: 'Either party may terminate this agreement at any time. We may suspend or terminate access without prior notice for material violations of these terms, abuse, or fraudulent activity.',
    points: [
      'Upon termination, your right to access the platform ceases immediately.',
      'Provisions relating to IP, liability, and disputes survive termination.',
    ],
  },
];

export default function TermsConditionsPage() {
  return (
    <PublicLegalLayout
      title="Terms of"
      titleAccent="Service"
      subtitle="Please read these terms carefully before using our platform. They outline your rights and obligations as a user."
      badgeLabel="Terms and Agreement"
      effectiveDate="April 12, 2026"
      intro="These terms constitute a legally binding agreement between you and LegalPadhai.ai regarding your use of the platform and associated services. By accessing any part of the platform you agree to comply with and be bound by these terms."
      sections={sections}
    />
  );
}

import FeatureLayout from '../components/FeatureLayout';
import EnhancedChatbot from '../components/EnhancedChatbot';

export default function ExpertPage() {
  return (
    <FeatureLayout>
      <EnhancedChatbot type="legal_expert" />
    </FeatureLayout>
  );
}

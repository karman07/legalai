import FeatureLayout from '../components/FeatureLayout';
import ResourcesLibrary from '../components/ResourcesLibrary';

export default function StudyMaterialsPage() {
  return (
    <FeatureLayout>
      <ResourcesLibrary
        contentKind="study-material"
        heading="Study Materials"
        subheading="Browse admin-published study material PDFs and Markdown files"
        emptyTitle="No study materials found"
      />
    </FeatureLayout>
  );
}

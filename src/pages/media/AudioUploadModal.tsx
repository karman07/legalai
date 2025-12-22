import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { Category, AudioSection } from '../../types/media';
import { SectionEditor } from '../../components/audio/SectionEditor';

interface AudioUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export const AudioUploadModal = ({ onClose, onSuccess, categories }: AudioUploadModalProps) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    headTitle: '',
    description: '',
    category: '',
    tags: '',
  });
  const [sections, setSections] = useState<AudioSection[]>([]);
  const [sectionAudioFiles, setSectionAudioFiles] = useState<Map<string, File>>(new Map());
  const [subsectionAudioFiles, setSubsectionAudioFiles] = useState<Map<string, File>>(new Map());

  const handleSectionAudioFile = (sectionIndex: number, audioType: string, file: File) => {
    const key = `section_${sectionIndex}_${audioType}`;
    setSectionAudioFiles(prev => new Map(prev).set(key, file));
  };

  const handleSubsectionAudioFile = (sectionIndex: number, subsectionIndex: number, audioType: string, file: File) => {
    const key = `section_${sectionIndex}_subsection_${subsectionIndex}_${audioType}`;
    setSubsectionAudioFiles(prev => new Map(prev).set(key, file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      alert('Title and category are required');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      if (formData.headTitle) data.append('headTitle', formData.headTitle);
      data.append('category', formData.category);
      if (formData.description) data.append('description', formData.description);
      if (formData.tags) data.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim())));
      if (sections.length > 0) data.append('sections', JSON.stringify(sections));
      
      sectionAudioFiles.forEach((file, key) => {
        data.append(key, file);
      });
      
      subsectionAudioFiles.forEach((file, key) => {
        data.append(key, file);
      });

      await mediaService.uploadAudio(data);
      onSuccess();
    } catch (e) {
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Audio Lesson</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Head Title (Optional)</label>
              <Input value={formData.headTitle} onChange={(e) => setFormData(prev => ({ ...prev, headTitle: e.target.value }))} placeholder="e.g., Constitutional Law Fundamentals" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} required>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} placeholder="tag1, tag2" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" rows={2} />
            </div>
          </div>

          <div className="border-t pt-4">
            <SectionEditor sections={sections} onChange={setSections} onAudioFileChange={handleSectionAudioFile} onSubsectionAudioFileChange={handleSubsectionAudioFile} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={uploading} className="flex-1 gap-2">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { AudioLesson, Category, AudioSection } from '../../types/media';
import { SectionEditor } from '../../components/audio/SectionEditor';

interface AudioEditModalProps {
  audio: AudioLesson;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export const AudioEditModal = ({ audio, onClose, onSuccess, categories }: AudioEditModalProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: audio.title,
    headTitle: audio.headTitle || '',
    description: audio.description || '',
    category: audio.category,
    tags: audio.tags?.join(', ') || '',
    isActive: audio.isActive,
  });
  const [sections, setSections] = useState<AudioSection[]>(audio.sections || []);
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
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      if (formData.headTitle) data.append('headTitle', formData.headTitle);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('isActive', String(formData.isActive));
      if (formData.tags) data.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)));
      if (sections.length > 0) data.append('sections', JSON.stringify(sections));
      
      sectionAudioFiles.forEach((file, key) => {
        data.append(key, file);
      });
      
      subsectionAudioFiles.forEach((file, key) => {
        data.append(key, file);
      });

      await mediaService.updateAudio(audio._id, data);
      onSuccess();
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Audio Lesson</h2>
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" rows={2} />
            </div>
          </div>

          <div className="border-t pt-4">
            <SectionEditor sections={sections} onChange={setSections} onAudioFileChange={handleSectionAudioFile} onSubsectionAudioFileChange={handleSubsectionAudioFile} />
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { AudioLesson, Category } from '../../types/media';

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
    description: audio.description || '',
    category: audio.category,
    language: audio.language || 'en',
    tags: audio.tags?.join(', ') || '',
    duration: audio.duration?.toString() || '',
    isActive: audio.isActive,
  });
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('language', formData.language);
      data.append('isActive', String(formData.isActive));
      if (formData.description) data.append('description', formData.description);
      if (formData.tags) data.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)));
      if (formData.duration) data.append('duration', formData.duration);
      if (replaceFile) data.append('file', replaceFile);
      if (transcriptFile) data.append('transcriptFile', transcriptFile);

      await mediaService.updateAudio(audio._id, data);
      onSuccess();
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Audio Lesson</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <Select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </Select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 3600"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., constitutional law, fundamental rights"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Replace Audio File (Optional)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Uploading new file will trigger re-transcription</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Update Transcript File (Optional)</label>
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx,.md"
              onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
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

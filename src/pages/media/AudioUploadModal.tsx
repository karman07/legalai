import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { Category } from '../../types/media';

interface AudioUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export const AudioUploadModal = ({ onClose, onSuccess, categories }: AudioUploadModalProps) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    language: 'en',
    tags: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !formData.title || !formData.category) {
      alert('Please fill required fields');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', audioFile);
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('language', formData.language);
      if (formData.description) data.append('description', formData.description);
      if (formData.tags) data.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim())));
      if (transcriptFile) data.append('transcriptFile', transcriptFile);

      await mediaService.uploadAudio(data);
      onSuccess();
    } catch (e) {
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Audio Lesson</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Audio File *</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Max 500MB. Supported: MP3, WAV, M4A, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter audio title"
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
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              rows={3}
              placeholder="Brief description"
            />
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

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., constitutional law, fundamental rights"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Transcript File (Optional)</label>
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

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
    tags: '',
    englishTranscription: '',
    hindiTranscription: '',
    easyEnglishTranscription: '',
    easyHindiTranscription: '',
    englishAudioUrl: '',
    hindiAudioUrl: '',
    sections: '',
  });
  const [englishAudioFile, setEnglishAudioFile] = useState<File | null>(null);
  const [hindiAudioFile, setHindiAudioFile] = useState<File | null>(null);

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
      data.append('category', formData.category);
      if (formData.description) data.append('description', formData.description);
      if (formData.tags) data.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim())));
      if (formData.englishTranscription) data.append('englishTranscription', formData.englishTranscription);
      if (formData.hindiTranscription) data.append('hindiTranscription', formData.hindiTranscription);
      if (formData.easyEnglishTranscription) data.append('easyEnglishTranscription', formData.easyEnglishTranscription);
      if (formData.easyHindiTranscription) data.append('easyHindiTranscription', formData.easyHindiTranscription);
      if (formData.englishAudioUrl) data.append('englishAudioUrl', formData.englishAudioUrl);
      if (formData.hindiAudioUrl) data.append('hindiAudioUrl', formData.hindiAudioUrl);
      if (formData.sections) data.append('sections', formData.sections);
      if (englishAudioFile) data.append('englishAudio', englishAudioFile);
      if (hindiAudioFile) data.append('hindiAudio', hindiAudioFile);

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
            <h3 className="font-semibold mb-3">Audio Files</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">English Audio File</label>
                <input type="file" accept="audio/*" onChange={(e) => setEnglishAudioFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">English Audio URL</label>
                <Input value={formData.englishAudioUrl} onChange={(e) => setFormData(prev => ({ ...prev, englishAudioUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hindi Audio File</label>
                <input type="file" accept="audio/*" onChange={(e) => setHindiAudioFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hindi Audio URL</label>
                <Input value={formData.hindiAudioUrl} onChange={(e) => setFormData(prev => ({ ...prev, hindiAudioUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Transcriptions (Admin-Provided)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">English Transcription</label>
                <textarea value={formData.englishTranscription} onChange={(e) => setFormData(prev => ({ ...prev, englishTranscription: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hindi Transcription</label>
                <textarea value={formData.hindiTranscription} onChange={(e) => setFormData(prev => ({ ...prev, hindiTranscription: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Easy English Transcription</label>
                <textarea value={formData.easyEnglishTranscription} onChange={(e) => setFormData(prev => ({ ...prev, easyEnglishTranscription: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Easy Hindi Transcription</label>
                <textarea value={formData.easyHindiTranscription} onChange={(e) => setFormData(prev => ({ ...prev, easyHindiTranscription: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" rows={3} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Sections (JSON Array)</h3>
            <textarea value={formData.sections} onChange={(e) => setFormData(prev => ({ ...prev, sections: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 font-mono text-sm" rows={4} placeholder='[{"title":"Intro","startTime":0,"endTime":30,"englishText":"...","hindiText":"..."}]' />
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

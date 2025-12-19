import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { PDF } from '../../types/media';

export const PDFEditModal = ({ pdf, onClose, onSuccess }: { pdf: PDF; onClose: () => void; onSuccess: () => void }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: pdf.title,
    description: pdf.description || '',
    category: pdf.category || '',
    caseTitle: pdf.caseTitle || '',
    caseNumber: pdf.caseNumber || '',
    year: pdf.year?.toString() || '',
    courtId: pdf.court?.id || '',
    courtName: pdf.court?.name || '',
    courtLevel: pdf.court?.level || '',
    keywords: pdf.keywords?.join(', ') || '',
    judges: pdf.judges?.join(', ') || '',
    summary: pdf.summary || '',
    isActive: pdf.isActive,
  });
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('caseTitle', formData.caseTitle);
      data.append('caseNumber', formData.caseNumber);
      data.append('year', formData.year);
      data.append('summary', formData.summary);
      data.append('isActive', String(formData.isActive));
      
      // Court data - send individual fields
      if (formData.courtId) data.append('court[id]', formData.courtId);
      if (formData.courtName) data.append('court[name]', formData.courtName);
      if (formData.courtLevel) data.append('court[level]', formData.courtLevel);
      
      // Keywords - send as individual array items
      const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      keywordsArray.forEach(keyword => data.append('keywords[]', keyword));
      
      // Judges - send as individual array items
      const judgesArray = formData.judges.split(',').map(j => j.trim()).filter(j => j);
      judgesArray.forEach(judge => data.append('judges[]', judge));
      
      if (replaceFile) data.append('file', replaceFile);

      await mediaService.updatePDF(pdf._id, data);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit PDF Document</h2>
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
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="font-semibold mb-3">Case Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Case Title</label>
                <Input
                  value={formData.caseTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, caseTitle: e.target.value }))}
                  placeholder="Enter case title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Case Number</label>
                <Input
                  value={formData.caseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, caseNumber: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Court ID</label>
                  <Input
                    value={formData.courtId}
                    onChange={(e) => setFormData(prev => ({ ...prev, courtId: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Court Name</label>
                  <Input
                    value={formData.courtName}
                    onChange={(e) => setFormData(prev => ({ ...prev, courtName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Court Level</label>
                  <Select
                    value={formData.courtLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, courtLevel: e.target.value }))}
                  >
                    <option value="">Select</option>
                    <option value="supreme">Supreme</option>
                    <option value="high">High</option>
                    <option value="district">District</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Keywords (comma-separated)</label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Judges (comma-separated)</label>
                <Input
                  value={formData.judges}
                  onChange={(e) => setFormData(prev => ({ ...prev, judges: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Replace PDF File (Optional)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
            />
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <input
              type="checkbox"
              id="isActiveEdit"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="isActiveEdit" className="text-sm font-medium">
              Active
            </label>
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

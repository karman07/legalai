import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';

export const PDFUploadModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    caseTitle: '',
    caseNumber: '',
    year: '',
    courtId: '',
    courtName: '',
    courtLevel: '',
    keywords: '',
    judges: '',
    summary: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !formData.title) {
      alert('Please fill required fields');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', pdfFile);
      data.append('title', formData.title);
      data.append('isActive', 'true');
      if (formData.description) data.append('description', formData.description);
      if (formData.category) data.append('category', formData.category);
      if (formData.caseTitle) data.append('caseTitle', formData.caseTitle);
      if (formData.caseNumber) data.append('caseNumber', formData.caseNumber);
      if (formData.year) data.append('year', formData.year);
      if (formData.summary) data.append('summary', formData.summary);
      
      // Court data - send individual fields
      if (formData.courtId) data.append('court[id]', formData.courtId);
      if (formData.courtName) data.append('court[name]', formData.courtName);
      if (formData.courtLevel) data.append('court[level]', formData.courtLevel);
      
      // Keywords - send as individual array items
      const keywordsArray = formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
      keywordsArray.forEach(keyword => data.append('keywords[]', keyword));
      
      // Judges - send as individual array items
      const judgesArray = formData.judges ? formData.judges.split(',').map(j => j.trim()).filter(j => j) : [];
      judgesArray.forEach(judge => data.append('judges[]', judge));

      await mediaService.uploadPDF(data);
      onSuccess();
    } catch (e) {
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload PDF Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">PDF File *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900 dark:file:text-red-300"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Max 100MB</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Document title"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                rows={2}
                placeholder="Brief description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Constitutional Law"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g., 1973"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="font-semibold mb-3">Case Details (Optional)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Case Title</label>
                <Input
                  value={formData.caseTitle}
                  onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                  placeholder="e.g., Kesavananda Bharati v. State of Kerala"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Case Number</label>
                <Input
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                  placeholder="e.g., Writ Petition (Civil) No. 135 of 1970"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Court ID</label>
                  <Input
                    value={formData.courtId}
                    onChange={(e) => setFormData({ ...formData, courtId: e.target.value })}
                    placeholder="e.g., sc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Court Name</label>
                  <Input
                    value={formData.courtName}
                    onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                    placeholder="Supreme Court"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Court Level</label>
                  <Select
                    value={formData.courtLevel}
                    onChange={(e) => setFormData({ ...formData, courtLevel: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., basic structure, constitutional amendment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Judges (comma-separated)</label>
                <Input
                  value={formData.judges}
                  onChange={(e) => setFormData({ ...formData, judges: e.target.value })}
                  placeholder="e.g., S.M. Sikri, K.S. Hegde"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  rows={3}
                  placeholder="Brief summary of the case"
                />
              </div>
            </div>
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

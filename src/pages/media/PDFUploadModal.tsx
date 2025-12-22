import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mediaService } from '../../services/mediaService';

export const PDFUploadModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    diary_no: '',
    case_no: '',
    pet: '',
    pet_adv: '',
    res_adv: '',
    bench: '',
    judgement_by: '',
    link: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile && !formData.link) {
      alert('Please provide either a PDF file or a link');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      if (formData.diary_no) data.append('diary_no', formData.diary_no);
      if (formData.case_no) data.append('case_no', formData.case_no);
      if (formData.pet) data.append('pet', formData.pet);
      if (formData.pet_adv) data.append('pet_adv', formData.pet_adv);
      if (formData.res_adv) data.append('res_adv', formData.res_adv);
      if (formData.bench) data.append('bench', formData.bench);
      if (formData.judgement_by) data.append('judgement_by', formData.judgement_by);
      if (formData.link) data.append('link', formData.link);
      if (pdfFile) data.append('file', pdfFile);

      await mediaService.uploadPDF(data);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload PDF Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">PDF File or Link *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900 dark:file:text-red-300"
            />
            <p className="text-xs text-gray-500 mt-1">Or provide a link below</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Link (Optional)</label>
            <Input
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Case Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Diary No</label>
                  <Input
                    value={formData.diary_no}
                    onChange={(e) => setFormData({ ...formData, diary_no: e.target.value })}
                    placeholder="Diary number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Case No</label>
                  <Input
                    value={formData.case_no}
                    onChange={(e) => setFormData({ ...formData, case_no: e.target.value })}
                    placeholder="Case number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Petitioner</label>
                <Input
                  value={formData.pet}
                  onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
                  placeholder="Petitioner name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Petitioner Advocate</label>
                  <Input
                    value={formData.pet_adv}
                    onChange={(e) => setFormData({ ...formData, pet_adv: e.target.value })}
                    placeholder="Petitioner's advocate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Respondent Advocate</label>
                  <Input
                    value={formData.res_adv}
                    onChange={(e) => setFormData({ ...formData, res_adv: e.target.value })}
                    placeholder="Respondent's advocate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Bench</label>
                  <Input
                    value={formData.bench}
                    onChange={(e) => setFormData({ ...formData, bench: e.target.value })}
                    placeholder="Bench details"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Judgment By</label>
                  <Input
                    value={formData.judgement_by}
                    onChange={(e) => setFormData({ ...formData, judgement_by: e.target.value })}
                    placeholder="Judge name"
                  />
                </div>
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

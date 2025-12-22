import { Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { AudioSubsection } from '../../types/media';

interface SubsectionEditorProps {
  sectionIndex: number;
  subsections: AudioSubsection[];
  onChange: (subsections: AudioSubsection[]) => void;
  onAudioFileChange?: (subsectionIndex: number, audioType: string, file: File) => void;
}

export const SubsectionEditor = ({ sectionIndex, subsections, onChange, onAudioFileChange }: SubsectionEditorProps) => {
  const addSubsection = () => {
    const lastSubsection = subsections[subsections.length - 1];
    const startTime = lastSubsection ? lastSubsection.endTime : 0;
    onChange([...subsections, { title: '', startTime, endTime: startTime }]);
  };

  const removeSubsection = (index: number) => {
    onChange(subsections.filter((_, i) => i !== index));
  };

  const updateSubsection = (index: number, field: keyof AudioSubsection, value: any) => {
    const updated = [...subsections];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'endTime' && updated[index + 1]) {
      updated[index + 1].startTime = value;
    }
    onChange(updated);
  };

  const handleFileChange = (index: number, audioType: string, file: File | null) => {
    if (file && onAudioFileChange) {
      onAudioFileChange(index, audioType, file);
    }
  };

  return (
    <div className="ml-6 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Subsections ({subsections.length})</h4>
        <Button type="button" onClick={addSubsection} size="sm" variant="outline">
          <Plus className="w-3 h-3 mr-1" /> Add Subsection
        </Button>
      </div>

      {subsections.length === 0 && (
        <div className="p-4 text-center border border-dashed rounded-lg bg-white dark:bg-gray-900">
          <p className="text-xs text-muted-foreground mb-2">No subsections yet</p>
          <Button type="button" onClick={addSubsection} size="sm" variant="outline">
            <Plus className="w-3 h-3 mr-1" /> Add Subsection
          </Button>
        </div>
      )}

      {subsections.map((subsection, idx) => (
        <div key={idx} className="p-3 border rounded-lg space-y-2 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{sectionIndex + 1}.{idx + 1}</span>
              <span className="text-xs text-gray-500">({subsection.startTime}s - {subsection.endTime}s)</span>
            </div>
            <Button type="button" onClick={() => removeSubsection(idx)} size="sm" variant="outline" className="text-red-600 h-6 w-6 p-0">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          <Input placeholder="Subsection Title" value={subsection.title} onChange={(e) => updateSubsection(idx, 'title', e.target.value)} className="text-sm" />

          <div className="grid grid-cols-2 gap-2">
            <textarea placeholder="English Text" value={subsection.englishText || ''} onChange={(e) => updateSubsection(idx, 'englishText', e.target.value)} className="w-full px-2 py-1 border rounded-md text-xs bg-white dark:bg-gray-900" rows={2} />
            <textarea placeholder="Hindi Text" value={subsection.hindiText || ''} onChange={(e) => updateSubsection(idx, 'hindiText', e.target.value)} className="w-full px-2 py-1 border rounded-md text-xs bg-white dark:bg-gray-900" rows={2} />
            <textarea placeholder="Easy English" value={subsection.easyEnglishText || ''} onChange={(e) => updateSubsection(idx, 'easyEnglishText', e.target.value)} className="w-full px-2 py-1 border rounded-md text-xs bg-white dark:bg-gray-900" rows={2} />
            <textarea placeholder="Easy Hindi" value={subsection.easyHindiText || ''} onChange={(e) => updateSubsection(idx, 'easyHindiText', e.target.value)} className="w-full px-2 py-1 border rounded-md text-xs bg-white dark:bg-gray-900" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-xs font-medium flex items-center gap-1">
                <Upload className="w-3 h-3" /> EN Audio
              </label>
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(idx, 'englishAudio', e.target.files?.[0] || null)} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium flex items-center gap-1">
                <Upload className="w-3 h-3" /> HI Audio
              </label>
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(idx, 'hindiAudio', e.target.files?.[0] || null)} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium flex items-center gap-1">
                <Upload className="w-3 h-3" /> Easy EN
              </label>
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(idx, 'easyEnglishAudio', e.target.files?.[0] || null)} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium flex items-center gap-1">
                <Upload className="w-3 h-3" /> Easy HI
              </label>
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(idx, 'easyHindiAudio', e.target.files?.[0] || null)} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

import { Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { AudioSection } from '../../types/media';
import { SubsectionEditor } from './SubsectionEditor';
import { useState } from 'react';

interface SectionEditorProps {
  sections: AudioSection[];
  onChange: (sections: AudioSection[]) => void;
  onAudioFileChange?: (sectionIndex: number, audioType: string, file: File) => void;
  onSubsectionAudioFileChange?: (sectionIndex: number, subsectionIndex: number, audioType: string, file: File) => void;
}

export const SectionEditor = ({ sections, onChange, onAudioFileChange, onSubsectionAudioFileChange }: SectionEditorProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const addSection = () => {
    const lastSection = sections[sections.length - 1];
    const startTime = lastSection ? lastSection.endTime : 0;
    onChange([...sections, { title: '', startTime, endTime: startTime, subsections: [] }]);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof AudioSection, value: any) => {
    const updated = [...sections];
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

  const updateSubsections = (sectionIndex: number, subsections: any[]) => {
    const updated = [...sections];
    updated[sectionIndex] = { ...updated[sectionIndex], subsections };
    onChange(updated);
  };

  const handleSubsectionAudioFile = (sectionIndex: number, subsectionIndex: number, audioType: string, file: File) => {
    if (onSubsectionAudioFileChange) {
      onSubsectionAudioFileChange(sectionIndex, subsectionIndex, audioType, file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Sections ({sections.length})</h3>
        <Button type="button" onClick={addSection} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> Add Section
        </Button>
      </div>

      {sections.length === 0 && (
        <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-3">No sections added yet</p>
          <Button type="button" onClick={addSection} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Section
          </Button>
        </div>
      )}

      {sections.map((section, idx) => (
        <div key={idx} className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Section {idx + 1}</span>
              <span className="text-xs text-gray-500">({section.startTime}s - {section.endTime}s)</span>
              {section.subsections && section.subsections.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {section.subsections.length} subsections
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                onClick={() => {
                  if (!section.subsections || section.subsections.length === 0) {
                    updateSubsections(idx, [{ title: '', startTime: 0, endTime: 0 }]);
                    setExpandedSections(new Set(expandedSections).add(idx));
                  } else {
                    toggleSection(idx);
                  }
                }} 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs"
              >
                {section.subsections && section.subsections.length > 0 ? (
                  expandedSections.has(idx) ? '▼ Hide' : '▶ Show'
                ) : (
                  <><Plus className="w-3 h-3 mr-1" /> Add Subsection</>
                )}
              </Button>
              <Button type="button" onClick={() => removeSection(idx)} size="sm" variant="outline" className="text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Input placeholder="Section Title" value={section.title} onChange={(e) => updateSection(idx, 'title', e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <textarea placeholder="English Text" value={section.englishText || ''} onChange={(e) => updateSection(idx, 'englishText', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900" rows={2} />
            <textarea placeholder="Hindi Text" value={section.hindiText || ''} onChange={(e) => updateSection(idx, 'hindiText', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900" rows={2} />
            <textarea placeholder="Easy English Text" value={section.easyEnglishText || ''} onChange={(e) => updateSection(idx, 'easyEnglishText', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900" rows={2} />
            <textarea placeholder="Easy Hindi Text" value={section.easyHindiText || ''} onChange={(e) => updateSection(idx, 'easyHindiText', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-sm font-medium flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> English Audio
              </label>
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(idx, 'englishAudio', e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Hindi Audio
              </label>
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(idx, 'hindiAudio', e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900 dark:file:text-orange-300" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Easy English Audio
              </label>
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(idx, 'easyEnglishAudio', e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900 dark:file:text-green-300" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Easy Hindi Audio
              </label>
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(idx, 'easyHindiAudio', e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300" />
            </div>
          </div>

          {expandedSections.has(idx) && (
            <SubsectionEditor
              sectionIndex={idx}
              subsections={section.subsections || []}
              onChange={(subsections) => updateSubsections(idx, subsections)}
              onAudioFileChange={(subIdx, audioType, file) => handleSubsectionAudioFile(idx, subIdx, audioType, file)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

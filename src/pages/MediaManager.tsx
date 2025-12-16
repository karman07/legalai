import { useState } from 'react';
import { Music, FileText } from 'lucide-react';
import { AudioManager } from './media/AudioManager';
import { PDFManager } from './media/PDFManager';

export const MediaManager = () => {
  const [activeTab, setActiveTab] = useState<'audio' | 'pdf'>('audio');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage audio lessons and PDF documents</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'audio'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Music className="w-5 h-5" />
            Audio Lessons
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'pdf'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            PDF Documents
          </button>
        </div>

        {activeTab === 'audio' ? <AudioManager /> : <PDFManager />}
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { BookOpen, Volume2, Play, Pause, SkipBack, SkipForward, Bookmark, Languages, FileText } from 'lucide-react';

type ActCategory = {
  id: string;
  name: string;
  description: string;
  sections: number;
};

type ViewMode = 'government' | 'easy';

const actCategories: ActCategory[] = [
  { id: 'constitution', name: 'Constitution of India', description: 'Fundamental law of India', sections: 470 },
  { id: 'ipc', name: 'Indian Penal Code (IPC)', description: 'Criminal offenses and punishments', sections: 511 },
  { id: 'bns', name: 'Bharatiya Nyaya Sanhita (BNS)', description: 'New criminal code replacing IPC', sections: 358 },
  { id: 'crpc', name: 'Code of Criminal Procedure (CrPC)', description: 'Criminal procedure code', sections: 484 },
  { id: 'bnss', name: 'Bharatiya Nagarik Suraksha Sanhita (BNSS)', description: 'New criminal procedure code', sections: 531 },
  { id: 'iea', name: 'Indian Evidence Act', description: 'Law of evidence', sections: 167 },
  { id: 'bse', name: 'Bharatiya Sakshya Adhiniyam (BSE)', description: 'New evidence law', sections: 170 },
  { id: 'cpc', name: 'Civil Procedure Code (CPC)', description: 'Civil court procedures', sections: 158 },
  { id: 'contract', name: 'Indian Contract Act', description: 'Law of contracts', sections: 238 },
  { id: 'companies', name: 'Companies Act', description: 'Corporate law', sections: 470 },
];

const sampleContent = {
  government: `SECTION 1 - SHORT TITLE, EXTENT AND COMMENCEMENT

(1) This Act may be called the [Insert Act Name].

(2) It extends to the whole of India except the State of Jammu and Kashmir.

(3) It shall come into force on such date as the Central Government may, by notification in the Official Gazette, appoint.

INTERPRETATION

In this Act, unless the context otherwise requires:
(a) "document" means any matter expressed or described upon any substance by means of letters, figures or marks, or by more than one of those means, intended to be used, or which may be used, for the purpose of recording that matter;
(b) "evidence" means and includes all statements which the Court permits or requires to be made before it by witnesses, in relation to matters of fact under inquiry;
(c) "India" means the territory of India excluding the State of Jammu and Kashmir.

APPLICABILITY OF THE ACT

The provisions of this Act shall apply to:
(1) All judicial proceedings in or before any Court, including Courts-martial;
(2) All proceedings before any person authorized by law or by consent of parties to receive evidence.`,
  easy: `SECTION 1 - WHAT THIS LAW IS CALLED AND WHERE IT APPLIES

Simple Explanation:

This section tells us three important things about the law:

1. THE NAME
   • This law has an official name that we use to refer to it
   • Think of it like how you have a name - this law has one too!

2. WHERE IT WORKS
   • This law applies across all of India
   • Exception: It doesn't apply to Jammu and Kashmir
   • Just like how school rules apply in your school, this law applies in its area

3. WHEN IT STARTS
   • The government decides when this law becomes active
   • They announce it officially
   • It's like how a new school year starts on a specific date

UNDERSTANDING THE WORDS USED IN THIS LAW

Let's break down the important terms:

• DOCUMENT: Any paper or digital file that has information written on it
  Example: Your school certificates, birth certificate, letters

• EVIDENCE: Information and proof that helps courts make decisions
  Example: Like showing your homework to prove you did it

• INDIA: The country, but not including Jammu and Kashmir for this law

WHO MUST FOLLOW THIS LAW?

This law applies to:
• All courts and judges
• Military courts
• Anyone officially collecting evidence or proof for legal matters

Think of it as rules that everyone in the legal system must follow!`
};

export default function BareActReader() {
  const [selectedAct, setSelectedAct] = useState<ActCategory | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('government');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300);
  const audioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    setCurrentTime(newTime);
  };

  const progress = (currentTime / duration) * 100;

  if (!selectedAct) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <BookOpen className="w-7 h-7 mr-2 text-amber-600" />
            Immersive Bare Act Reader
          </h2>
          <p className="text-slate-600 mt-1">Read and listen to Indian laws in original and simplified language</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actCategories.map((act) => (
            <button
              key={act.id}
              onClick={() => setSelectedAct(act)}
              className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-xl p-6 text-left transition-all hover:shadow-lg group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                  {act.sections} sections
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                {act.name}
              </h3>
              <p className="text-sm text-slate-600">{act.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-500 p-3 rounded-lg flex-shrink-0">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Immersive Learning Experience</h3>
              <p className="text-sm text-slate-700 mb-3">
                Each act includes two reading modes and audiobook narration:
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span><strong>Government Version:</strong> Original bare act text as passed by legislature</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span><strong>Easy Language:</strong> Simplified explanations for better understanding</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span><strong>Audio Narration:</strong> Listen while reading or on-the-go</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setSelectedAct(null)}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium mb-2 flex items-center"
          >
            ← Back to Acts
          </button>
          <h2 className="text-2xl font-bold text-slate-900">{selectedAct.name}</h2>
          <p className="text-slate-600 text-sm mt-1">{selectedAct.description}</p>
        </div>
        <button className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
          <Bookmark className="w-6 h-6 text-slate-400 hover:text-amber-500" />
        </button>
      </div>

      <div className="flex items-center space-x-3 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('government')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all font-medium ${
            viewMode === 'government'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Government Text</span>
        </button>
        <button
          onClick={() => setViewMode('easy')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all font-medium ${
            viewMode === 'easy'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>Easy Language</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 min-h-[400px]">
        <div className="prose prose-slate max-w-none">
          {viewMode === 'government' ? (
            <div className="font-serif whitespace-pre-line text-slate-800 leading-relaxed">
              {sampleContent.government}
            </div>
          ) : (
            <div className="whitespace-pre-line text-slate-800 leading-relaxed">
              {sampleContent.easy}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-2 border-amber-200 rounded-xl p-6 shadow-lg">
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span className="text-amber-600 font-medium">
              <Volume2 className="w-4 h-4 inline mr-1" />
              Audiobook Player
            </span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleSkipBack}
            className="p-3 hover:bg-slate-100 rounded-full transition-colors"
            title="Skip back 10 seconds"
          >
            <SkipBack className="w-5 h-5 text-slate-700" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-4 bg-amber-500 hover:bg-amber-600 rounded-full transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleSkipForward}
            className="p-3 hover:bg-slate-100 rounded-full transition-colors"
            title="Skip forward 10 seconds"
          >
            <SkipForward className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            {viewMode === 'government' ? 'Reading: Original Government Text' : 'Reading: Simplified Easy Language'}
          </p>
        </div>
      </div>
    </div>
  );
}

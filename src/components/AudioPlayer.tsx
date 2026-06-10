import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Loader2, ArrowLeft, StickyNote, Volume2, VolumeX, RotateCcw, Settings, Bookmark, Share2, Sparkles, Send, X } from 'lucide-react';
import { audioLessonsAPI, AudioLesson, AudioSectionSlim, AudioSectionDetail, AudioSubsectionSlim, AudioSubsectionDetail } from '../services/api';
import chatService from '../services/chatService';
import SectionList from './audio/SectionList';
import SubsectionList from './audio/SubsectionList';
import NotesPanel from './NotesPanel';

type Language = 'english' | 'hindi';
type TextMode = 'government' | 'easy';
type ViewMode = 'sections' | 'subsections' | 'player';
type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
type PlayerContentMode = 'single' | 'combined';

type CombinedSegment = {
  title: string;
  text: string;
  audioUrl?: string;
};

const SECTIONS_PER_PAGE = 20;

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Lesson head (no sections array)
  const [lesson, setLesson] = useState<AudioLesson | null>(null);
  const [loading, setLoading] = useState(true);

  // Paginated slim sections list
  const [sections, setSections] = useState<AudioSectionSlim[]>([]);
  const [sectionsPage, setSectionsPage] = useState(1);
  const [sectionsTotalPages, setSectionsTotalPages] = useState(1);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // Full detail for the selected section head (no subsections — use subsections state)
  const [currentSectionDetail, setCurrentSectionDetail] = useState<AudioSectionDetail | null>(null);
  const [sectionDetailLoading, setSectionDetailLoading] = useState(false);

  // Paginated slim subsections for the current section
  const [subsections, setSubsections] = useState<AudioSubsectionSlim[]>([]);
  const [subsectionsPage, setSubsectionsPage] = useState(1);
  const [subsectionsTotalPages, setSubsectionsTotalPages] = useState(1);
  const [subsectionsLoading, setSubsectionsLoading] = useState(false);

  // Full subsection detail (text + audio), loaded only when user hits play
  const [currentSubsectionDetail, setCurrentSubsectionDetail] = useState<AudioSubsectionDetail | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [textMode, setTextMode] = useState<TextMode>('government');
  const [viewMode, setViewMode] = useState<ViewMode>('sections');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubsectionIndex, setCurrentSubsectionIndex] = useState(-1);
  const [showNotes, setShowNotes] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [playerContentMode, setPlayerContentMode] = useState<PlayerContentMode>('single');
  const [combinedSegments, setCombinedSegments] = useState<CombinedSegment[]>([]);
  const [isPreparingCombined, setIsPreparingCombined] = useState(false);
  const [queueUrls, setQueueUrls] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [combinedTotalDuration, setCombinedTotalDuration] = useState(0);
  const [completedDuration, setCompletedDuration] = useState(0);
  const [trackDurations, setTrackDurations] = useState<number[]>([]);
  const [isLoadingAllSections, setIsLoadingAllSections] = useState(false);
  const [playerBackTarget, setPlayerBackTarget] = useState<'sections' | 'subsections'>('subsections');
  const isLoadingAllRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Text-selection AI chat state
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversationId, setAiConversationId] = useState<string | null>(null);
  const aiChatRef = useRef<HTMLDivElement>(null);
  const chatStorageKey = `ai-chat:audio:${id ?? 'none'}`;

  type ChatMessageItem = { role: 'user' | 'ai'; text: string };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        aiMessages?: ChatMessageItem[];
        aiConversationId?: string | null;
        aiQuery?: string;
      };
      setAiMessages(parsed.aiMessages ?? []);
      setAiConversationId(parsed.aiConversationId ?? null);
      setAiQuery(parsed.aiQuery ?? '');
    } catch {
      // Ignore malformed localStorage payloads
    }
  }, [chatStorageKey]);

  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify({ aiMessages, aiConversationId, aiQuery }));
  }, [chatStorageKey, aiMessages, aiConversationId, aiQuery]);

  // Cancel background section loading on unmount
  useEffect(() => {
    return () => { isLoadingAllRef.current = false; };
  }, []);

  // Load lesson head on mount
  useEffect(() => {
    if (id) fetchLesson(id);
  }, [id]);

  // Load first page of sections once lesson is ready
  useEffect(() => {
    if (id && lesson) fetchSections(1);
  }, [lesson]);

  // Load more sections when page changes
  useEffect(() => {
    if (id && lesson && sectionsPage > 1) fetchSections(sectionsPage);
  }, [sectionsPage]);

  useEffect(() => {
    if (viewMode !== 'player') return;
    if (playerContentMode === 'combined') return;

    let audioFile;
    if (currentSubsectionIndex >= 0 && currentSubsectionDetail) {
      // Playing a subsection — use subsection detail for audio
      audioFile = textMode === 'easy'
        ? (selectedLanguage === 'english' ? currentSubsectionDetail.easyEnglishAudio : currentSubsectionDetail.easyHindiAudio)
        : (selectedLanguage === 'english' ? currentSubsectionDetail.englishAudio : currentSubsectionDetail.hindiAudio);
    } else if (currentSubsectionIndex < 0 && currentSectionDetail) {
      // Playing section-level audio
      audioFile = textMode === 'easy'
        ? (selectedLanguage === 'english' ? currentSectionDetail.easyEnglishAudio : currentSectionDetail.easyHindiAudio)
        : (selectedLanguage === 'english' ? currentSectionDetail.englishAudio : currentSectionDetail.hindiAudio);
    }

    if (audioFile?.url) {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://api.legalpadhai.ai/api';
      const baseUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
      setAudioUrl(`${baseUrl}${audioFile.url}`);
      setIsPlaying(false);
    }
  }, [currentSectionDetail, currentSubsectionDetail, selectedLanguage, textMode, viewMode, currentSubsectionIndex, playerContentMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed]);

  const fetchLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      const data = await audioLessonsAPI.getAudioLesson(lessonId);
      setLesson(data);
    } catch {
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (p: number) => {
    if (!id) return;
    setSectionsLoading(true);
    try {
      const res = await audioLessonsAPI.getSections(id, p, SECTIONS_PER_PAGE);
      setSections(prev => p === 1 ? res.items : [...prev, ...res.items]);
      setSectionsTotalPages(res.totalPages);
    } finally {
      setSectionsLoading(false);
    }
  };

  const fetchSectionDetail = async (sectionIndex: number) => {
    if (!id) return;
    setSectionDetailLoading(true);
    try {
      const detail = await audioLessonsAPI.getSectionDetail(id, sectionIndex);
      setCurrentSectionDetail(detail);
      // Populate subsections directly from the response — no second round trip
      setSubsections(detail.subsections ?? []);
      setSubsectionsTotalPages(1);
      if (detail.hasEnglishAudio) setSelectedLanguage('english');
      else if (detail.hasHindiAudio) setSelectedLanguage('hindi');
    } finally {
      setSectionDetailLoading(false);
    }
  };

  const fetchSubsections = async (sectionIdx: number, p: number) => {
    if (!id) return;
    setSubsectionsLoading(true);
    try {
      const res = await audioLessonsAPI.getSubsections(id, sectionIdx, p, 20);
      setSubsections(prev => p === 1 ? res.items : [...prev, ...res.items]);
      setSubsectionsTotalPages(res.totalPages);
    } finally {
      setSubsectionsLoading(false);
    }
  };

  const fetchSubsectionDetail = async (sectionIdx: number, subIdx: number): Promise<AudioSubsectionDetail | null> => {
    if (!id) return null;
    try {
      const detail = await audioLessonsAPI.getSubsectionDetail(id, sectionIdx, subIdx);
      setCurrentSubsectionDetail(detail);
      return detail;
    } catch {
      return null;
    }
  };

  const resolveAudioUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://api.legalpadhai.ai/api';
    const baseUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
    return `${baseUrl}${url}`;
  };

  const pickContentText = (content: AudioSectionDetail | AudioSubsectionDetail): string => {
    if (textMode === 'government') {
      return (selectedLanguage === 'english' ? content.englishText : content.hindiText) || '';
    }
    return (selectedLanguage === 'english' ? content.easyEnglishText : content.easyHindiText) || '';
  };

  const pickContentAudioUrl = (content: AudioSectionDetail | AudioSubsectionDetail): string | undefined => {
    const audioMeta = textMode === 'easy'
      ? (selectedLanguage === 'english' ? content.easyEnglishAudio : content.easyHindiAudio)
      : (selectedLanguage === 'english' ? content.englishAudio : content.hindiAudio);
    return resolveAudioUrl(audioMeta?.url);
  };

  const preloadTrackDurations = (urls: string[]) => {
    if (urls.length === 0) return;
    const durations = new Array(urls.length).fill(0);
    let loadedCount = 0;
    const tryFinalize = () => {
      loadedCount++;
      if (loadedCount === urls.length) {
        const total = durations.reduce((a: number, b: number) => a + b, 0);
        setTrackDurations([...durations]);
        setCombinedTotalDuration(total);
      }
    };
    urls.forEach((url, idx) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => {
        durations[idx] = isFinite(audio.duration) ? audio.duration : 0;
        tryFinalize();
      }, { once: true });
      audio.addEventListener('error', tryFinalize, { once: true });
      audio.src = url;
    });
  };

  const buildCombinedSegments = (
    section: AudioSectionDetail,
    subDetails: AudioSubsectionDetail[],
    sectionIdx: number
  ): CombinedSegment[] => {
    const segments: CombinedSegment[] = [];

    const sectionText = pickContentText(section);
    const sectionAudio = pickContentAudioUrl(section);
    if (sectionText || sectionAudio) {
      segments.push({
        title: section.title || `Section ${sectionIdx + 1}`,
        text: sectionText,
        audioUrl: sectionAudio,
      });
    }

    const sorted = [...subDetails].sort((a, b) => a._index - b._index);
    sorted.forEach((sub) => {
      const text = pickContentText(sub);
      const audioUrl = pickContentAudioUrl(sub);
      if (!text && !audioUrl) return;
      segments.push({
        title: sub.title || `Subsection ${sectionIdx + 1}.${sub._index + 1}`,
        text,
        audioUrl,
      });
    });

    return segments;
  };

  const openCombinedMode = async (
    autoPlayQueue: boolean,
    sectionIdxOverride?: number,
    backTarget: 'sections' | 'subsections' = 'subsections'
  ) => {
    if (!id) return;

    const sectionIdx = sectionIdxOverride ?? currentSectionIndex;

    setPlayerBackTarget(backTarget);

    // Reset all playback state up front
    setPlayerContentMode('combined');
    setCurrentSubsectionDetail(null);
    setCurrentSubsectionIndex(-1);
    setCurrentSectionIndex(sectionIdx);
    setCombinedSegments([]);
    setCombinedTotalDuration(0);
    setCompletedDuration(0);
    setTrackDurations([]);
    setQueueUrls([]);
    setQueueIndex(0);
    setAudioUrl('');
    setIsPlaying(false);
    setIsPreparingCombined(true);
    setViewMode('player');

    // Local tracker — don't use state so we avoid stale closures
    let hasStartedPlaying = false;

    const enqueueAudio = (url: string) => {
      setQueueUrls(prev => [...prev, url]);
      // Preload duration and append to trackDurations in order
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => {
        const dur = isFinite(audio.duration) ? audio.duration : 0;
        setTrackDurations(prev => [...prev, dur]);
        setCombinedTotalDuration(prev => prev + dur);
      }, { once: true });
      audio.addEventListener('error', () => {
        setTrackDurations(prev => [...prev, 0]);
      }, { once: true });
      audio.src = url;

      if (autoPlayQueue && !hasStartedPlaying) {
        hasStartedPlaying = true;
        setAudioUrl(url);
        setIsPlaying(true);
      }
    };

    try {
      // 1. Get section detail
      let sectionDetail: AudioSectionDetail | null =
        sectionIdxOverride === undefined ? currentSectionDetail : null;

      if (!sectionDetail) {
        sectionDetail = await audioLessonsAPI.getSectionDetail(id, sectionIdx);
        setCurrentSectionDetail(sectionDetail);
        setSubsections(sectionDetail.subsections ?? []);
      }

      if (!sectionDetail) return;

      // 2. Add section head segment immediately
      const headText = pickContentText(sectionDetail);
      const headAudio = pickContentAudioUrl(sectionDetail);
      if (headText || headAudio) {
        setCombinedSegments([{ title: sectionDetail.title, text: headText, audioUrl: headAudio }]);
        if (headAudio) enqueueAudio(headAudio);
      }

      // 3. Collect all subsection slim records
      const allSubsections: AudioSubsectionSlim[] = [...(sectionDetail.subsections ?? [])];
      const seen = new Set(allSubsections.map(s => s._index));

      if (allSubsections.length < (sectionDetail.totalSubsections || 0)) {
        let page = 1, totalPages = 1;
        do {
          const res = await audioLessonsAPI.getSubsections(id, sectionIdx, page, 50);
          (res.items || []).forEach(item => {
            if (!seen.has(item._index)) { seen.add(item._index); allSubsections.push(item); }
          });
          totalPages = res.totalPages || 1;
          page++;
        } while (page <= totalPages);
      }

      allSubsections.sort((a, b) => a._index - b._index);

      // Update subsections state so SubsectionList has full data when back is pressed
      setSubsections(allSubsections);

      // Hide the preparing spinner — content is already visible
      setIsPreparingCombined(false);

      // 4. Load each subsection detail one by one (step by step)
      for (const sub of allSubsections) {
        const detail = await audioLessonsAPI
          .getSubsectionDetail(id, sectionIdx, sub._index)
          .catch(() => null);
        if (!detail) continue;

        const text = pickContentText(detail);
        const subAudio = pickContentAudioUrl(detail);
        if (!text && !subAudio) continue;

        setCombinedSegments(prev => [
          ...prev,
          { title: sub.title || detail.title, text, audioUrl: subAudio },
        ]);

        if (subAudio) enqueueAudio(subAudio);
      }
    } finally {
      setIsPreparingCombined(false);
    }
  };

  const appendSegmentsToQueue = (newSegments: CombinedSegment[]) => {
    const newUrls = newSegments.map(s => s.audioUrl).filter((u): u is string => !!u);
    setCombinedSegments(prev => [...prev, ...newSegments]);
    setQueueUrls(prev => [...prev, ...newUrls]);
    if (newUrls.length === 0) return;

    const localDurations = new Array(newUrls.length).fill(0);
    let loaded = 0;
    const tryFinalize = () => {
      loaded++;
      if (loaded === newUrls.length) {
        const batchTotal = localDurations.reduce((a: number, b: number) => a + b, 0);
        setCombinedTotalDuration(prev => prev + batchTotal);
        setTrackDurations(prev => [...prev, ...localDurations]);
      }
    };
    newUrls.forEach((url, idx) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => {
        localDurations[idx] = isFinite(audio.duration) ? audio.duration : 0;
        tryFinalize();
      }, { once: true });
      audio.addEventListener('error', tryFinalize, { once: true });
      audio.src = url;
    });
  };

  const playAllSections = async () => {
    if (!id || !lesson) return;
    const totalSects = lesson.totalSections ?? sections.length;

    isLoadingAllRef.current = true;

    // Start section 0 immediately — user hears audio right away
    // Back from player returns to the SectionList (where Play All was triggered)
    await openCombinedMode(true, 0, 'sections');

    if (!isLoadingAllRef.current || totalSects <= 1) return;

    setIsLoadingAllSections(true);
    try {
      for (let sIdx = 1; sIdx < totalSects; sIdx++) {
        if (!isLoadingAllRef.current) break;

        let sectionDetail: AudioSectionDetail;
        try {
          sectionDetail = await audioLessonsAPI.getSectionDetail(id, sIdx);
        } catch {
          continue;
        }
        if (!isLoadingAllRef.current) break;

        const allSubs = [...(sectionDetail.subsections ?? [])];
        if (allSubs.length < sectionDetail.totalSubsections) {
          let page = 1, totalPages = 1;
          do {
            if (!isLoadingAllRef.current) break;
            try {
              const res = await audioLessonsAPI.getSubsections(id, sIdx, page, 50);
              allSubs.push(...(res.items || []));
              totalPages = res.totalPages || 1;
            } catch { /* skip */ }
            page++;
          } while (page <= totalPages);
        }

        if (!isLoadingAllRef.current) break;

        const subDetails = await Promise.all(
          allSubs.map(sub => audioLessonsAPI.getSubsectionDetail(id, sIdx, sub._index).catch(() => null))
        );
        const validSubs = subDetails.filter((d): d is AudioSubsectionDetail => d !== null);
        const segments = buildCombinedSegments(sectionDetail, validSubs, sIdx);
        appendSegmentsToQueue(segments);
      }
    } finally {
      setIsLoadingAllSections(false);
    }
  };

  const playSelectedSubsections = async (subIndices: number[]) => {
    if (!id || subIndices.length === 0) return;
    const sorted = [...subIndices].sort((a, b) => a - b);

    setPlayerContentMode('combined');
    setCurrentSubsectionDetail(null);
    setCurrentSubsectionIndex(-1);
    setCombinedSegments([]);
    setCombinedTotalDuration(0);
    setCompletedDuration(0);
    setTrackDurations([]);
    setQueueUrls([]);
    setQueueIndex(0);
    setAudioUrl('');
    setIsPlaying(false);
    setIsPreparingCombined(false);
    setPlayerBackTarget('subsections');
    setViewMode('player');

    let hasStartedPlaying = false;

    const enqueueAudio = (url: string) => {
      setQueueUrls(prev => [...prev, url]);
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => {
        const dur = isFinite(audio.duration) ? audio.duration : 0;
        setTrackDurations(prev => [...prev, dur]);
        setCombinedTotalDuration(prev => prev + dur);
      }, { once: true });
      audio.addEventListener('error', () => { setTrackDurations(prev => [...prev, 0]); }, { once: true });
      audio.src = url;
      if (!hasStartedPlaying) {
        hasStartedPlaying = true;
        setAudioUrl(url);
        setIsPlaying(true);
      }
    };

    for (const subIdx of sorted) {
      const detail = await audioLessonsAPI
        .getSubsectionDetail(id, currentSectionIndex, subIdx)
        .catch(() => null);
      if (!detail) continue;
      const text = pickContentText(detail);
      const subAudio = pickContentAudioUrl(detail);
      if (!text && !subAudio) continue;
      setCombinedSegments(prev => [...prev, { title: detail.title, text, audioUrl: subAudio }]);
      if (subAudio) enqueueAudio(subAudio);
    }
  };

  const playSelectedSections = async (indices: number[]) => {
    if (!id || !lesson || indices.length === 0) return;
    const sorted = [...indices].sort((a, b) => a - b);

    isLoadingAllRef.current = true;

    // Reset all playback state up-front, then navigate to player
    setPlayerContentMode('combined');
    setPlayerBackTarget('sections');
    setCurrentSubsectionDetail(null);
    setCurrentSubsectionIndex(-1);
    setCurrentSectionIndex(sorted[0]);
    setCombinedSegments([]);
    setCombinedTotalDuration(0);
    setCompletedDuration(0);
    setTrackDurations([]);
    setQueueUrls([]);
    setQueueIndex(0);
    setAudioUrl('');
    setIsPlaying(false);
    setIsPreparingCombined(true);
    setViewMode('player');

    let hasStartedPlaying = false;

    const enqueueAudio = (url: string) => {
      setQueueUrls(prev => [...prev, url]);
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => {
        const dur = isFinite(audio.duration) ? audio.duration : 0;
        setTrackDurations(prev => [...prev, dur]);
        setCombinedTotalDuration(prev => prev + dur);
      }, { once: true });
      audio.addEventListener('error', () => { setTrackDurations(prev => [...prev, 0]); }, { once: true });
      audio.src = url;
      if (!hasStartedPlaying) {
        hasStartedPlaying = true;
        setAudioUrl(url);
        setIsPlaying(true);
      }
    };

    setIsLoadingAllSections(true);
    try {
      for (const sIdx of sorted) {
        if (!isLoadingAllRef.current) break;

        let sectionDetail: AudioSectionDetail | null = null;
        try {
          sectionDetail = await audioLessonsAPI.getSectionDetail(id, sIdx);
        } catch { continue; }
        if (!sectionDetail || !isLoadingAllRef.current) break;

        // For the first section, seed the section detail so back→subsections works
        if (sIdx === sorted[0]) {
          setCurrentSectionDetail(sectionDetail);
          setSubsections(sectionDetail.subsections ?? []);
          setIsPreparingCombined(false);
        }

        // Add section head segment immediately
        const headText = pickContentText(sectionDetail);
        const headAudio = pickContentAudioUrl(sectionDetail);
        if (headText || headAudio) {
          setCombinedSegments(prev => [
            ...prev,
            { title: sectionDetail!.title, text: headText, audioUrl: headAudio },
          ]);
          if (headAudio) enqueueAudio(headAudio);
        }

        // Collect all subsection slim records for this section
        const allSubs: AudioSubsectionSlim[] = [...(sectionDetail.subsections ?? [])];
        const seen = new Set(allSubs.map(s => s._index));
        if (allSubs.length < (sectionDetail.totalSubsections || 0)) {
          let page = 1, totalPages = 1;
          do {
            if (!isLoadingAllRef.current) break;
            try {
              const res = await audioLessonsAPI.getSubsections(id, sIdx, page, 50);
              (res.items || []).forEach(item => {
                if (!seen.has(item._index)) { seen.add(item._index); allSubs.push(item); }
              });
              totalPages = res.totalPages || 1;
            } catch { /* skip */ }
            page++;
          } while (page <= totalPages);
        }
        allSubs.sort((a, b) => a._index - b._index);

        // Load each subsection detail one-by-one and enqueue as it arrives
        for (const sub of allSubs) {
          if (!isLoadingAllRef.current) break;
          const detail = await audioLessonsAPI
            .getSubsectionDetail(id, sIdx, sub._index)
            .catch(() => null);
          if (!detail) continue;
          const text = pickContentText(detail);
          const subAudio = pickContentAudioUrl(detail);
          if (!text && !subAudio) continue;
          setCombinedSegments(prev => [
            ...prev,
            { title: sub.title || detail.title, text, audioUrl: subAudio },
          ]);
          if (subAudio) enqueueAudio(subAudio);
        }
      }
    } finally {
      setIsPreparingCombined(false);
      setIsLoadingAllSections(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    audioRef.current.load();
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [audioUrl]);

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSpeedChange = (speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically save to backend
  };

  const shareLesson = () => {
    if (navigator.share) {
      navigator.share({
        title: lesson?.title,
        text: lesson?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTextMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (text.length > 3) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPopup({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    } else {
      setSelectionPopup(null);
    }
  };

  const openAiChat = () => {
    if (selectedText) {
      setAiQuery(prev => prev.trim() ? prev : `Selected text:\n"${selectedText}"\n\nQuestion: `);
    }
    setShowAiChat(true);
    setSelectionPopup(null);
  };

  const sendAiMessage = async () => {
    const rawQuery = aiQuery.trim();
    if (!rawQuery || aiLoading) return;

    setAiMessages(prev => [...prev, { role: 'user', text: rawQuery }]);
    setAiQuery('');
    setAiLoading(true);

    try {
      const res = await chatService.sendMessage(rawQuery, aiConversationId);
      setAiConversationId(res.conversationId);
      setAiMessages(prev => [...prev, { role: 'ai', text: res.response }]);
    } catch (err: any) {
      setAiMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message ?? 'Failed to get response'}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectionPopup && !(e.target as Element)?.closest('[data-ai-popup]')) {
        setSelectionPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectionPopup]);

  const handlePrevSection = () => {
    if (currentSubsectionIndex > 0) {
      setCurrentSubsectionIndex(currentSubsectionIndex - 1);
      fetchSubsectionDetail(currentSectionIndex, currentSubsectionIndex - 1);
    } else if (currentSectionIndex > 0) {
      startPlayer(currentSectionIndex - 1, -1);
    }
  };

  const handleNextSection = () => {
    const totalSubs = currentSectionDetail?.totalSubsections ?? subsections.length;
    if (currentSubsectionIndex < totalSubs - 1) {
      const nextSub = currentSubsectionIndex + 1;
      setCurrentSubsectionIndex(nextSub);
      fetchSubsectionDetail(currentSectionIndex, nextSub);
    } else {
      const totalSections = lesson?.totalSections ?? sections.length;
      if (currentSectionIndex < totalSections - 1) {
        startPlayer(currentSectionIndex + 1, -1);
      }
    }
  };

  const startPlayer = async (sectionIndex: number, subsectionIndex: number = -1) => {
    setPlayerBackTarget('subsections');
    setPlayerContentMode('single');
    setCombinedSegments([]);
    setQueueUrls([]);
    setQueueIndex(0);
    setCurrentSectionIndex(sectionIndex);
    setCurrentSubsectionIndex(subsectionIndex);
    setCurrentSubsectionDetail(null);
    if (subsectionIndex >= 0) {
      setSectionDetailLoading(true);
      try {
        await fetchSubsectionDetail(sectionIndex, subsectionIndex);
      } finally {
        setSectionDetailLoading(false);
      }
    }
    setViewMode('player');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold-600 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-900 mb-4">Lesson not found</h2>
          <button onClick={() => navigate('/audio')} className="text-gold-600 hover:text-gold-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'sections') {
    return (
      <SectionList
        lesson={lesson}
        sections={sections}
        sectionsPage={sectionsPage}
        sectionsTotalPages={sectionsTotalPages}
        sectionsLoading={sectionsLoading}
        onLoadMoreSections={() => setSectionsPage(p => p + 1)}
        onSelectSection={(idx) => {
          setCurrentSectionIndex(idx);
          setSubsections([]);
          setSubsectionsPage(1);
          setCurrentSectionDetail(null);
          fetchSectionDetail(idx);
          setViewMode('subsections');
        }}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onPlaySection={(sectionIdx) => openCombinedMode(true, sectionIdx, 'sections')}
        onPlayAll={() => playAllSections()}
        onPlaySelected={(indices) => playSelectedSections(indices)}
        onBack={() => navigate('/audio')}
      />
    );
  }

  if (viewMode === 'subsections') {
    if (sectionDetailLoading || !currentSectionDetail) {
      return (
        <div className="min-h-screen bg-brand-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-gold-600 animate-spin" />
        </div>
      );
    }
    return (
      <SubsectionList
        lesson={lesson}
        sectionHead={currentSectionDetail}
        sectionIndex={currentSectionIndex}
        subsections={subsections}
        selectedLanguage={selectedLanguage}
        onPlayCombinedAudio={() => openCombinedMode(true)}
        onSelectSubsection={(subIdx) => startPlayer(currentSectionIndex, subIdx)}
        onPlaySelected={(indices) => playSelectedSubsections(indices)}
        onLanguageChange={setSelectedLanguage}
        onBack={() => setViewMode('sections')}
      />
    );
  }

  const displayCurrentTime = playerContentMode === 'combined' ? completedDuration + currentTime : currentTime;
  const displayTotalDuration = playerContentMode === 'combined' && combinedTotalDuration > 0 ? combinedTotalDuration : duration;
  const progress = displayTotalDuration > 0 ? (displayCurrentTime / displayTotalDuration) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-brand-50 via-white to-slate-50">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (playerContentMode === 'combined' && queueUrls.length > 0 && queueIndex < queueUrls.length - 1) {
            const nextIndex = queueIndex + 1;
            setCompletedDuration(prev => prev + (trackDurations[queueIndex] ?? duration));
            setQueueIndex(nextIndex);
            setAudioUrl(queueUrls[nextIndex]);
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        }}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="bg-white/95 backdrop-blur-sm border-b border-brand-200 shadow-sm flex-shrink-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setViewMode(playerBackTarget)} className="p-2 hover:bg-brand-100 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-brand-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-brand-900 truncate leading-tight">
                {playerContentMode === 'combined'
                  ? `${currentSectionDetail?.title}`
                  : currentSubsectionIndex >= 0
                  ? `${currentSectionDetail?.title}${currentSubsectionDetail?.title ? ` › ${currentSubsectionDetail.title}` : ''}`
                  : currentSectionDetail?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                <p className="text-[11px] text-brand-400">
                  {playerContentMode === 'combined'
                    ? `${combinedSegments.length} parts`
                    : currentSubsectionIndex >= 0
                    ? `§ ${currentSectionIndex + 1}.${currentSubsectionIndex + 1}`
                    : `§ ${currentSectionIndex + 1}`}
                </p>
                {isLoadingAllSections && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-600">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Loading more…
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedLanguage === 'english' ? 'bg-blue-500' : 'bg-green-500'}`} />
                  <span className="text-[11px] font-medium text-brand-500 capitalize">{selectedLanguage}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${textMode === 'easy' ? 'bg-gold-100 text-gold-700' : 'bg-brand-100 text-brand-600'}`}>
                  {textMode === 'easy' ? 'Easy' : 'Standard'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition-all ${isBookmarked ? 'bg-gold-100 text-gold-600' : 'hover:bg-brand-100 text-brand-500'}`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button onClick={shareLesson} className="p-2 hover:bg-brand-100 text-brand-500 rounded-lg transition-colors hidden sm:block">
                <Share2 className="w-4 h-4" />
              </button>
              <button onClick={() => setShowNotes(!showNotes)} className="flex items-center gap-1.5 px-3 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-all shadow-sm text-sm font-semibold">
                <StickyNote className="w-4 h-4" />
                <span className="hidden sm:inline">Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {currentSectionDetail && (
            <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
              <div className="p-4 sm:p-8">
                <h2 className="text-lg sm:text-2xl font-bold text-brand-900 mb-4 leading-snug">
                  {playerContentMode === 'combined'
                    ? currentSectionDetail.title
                    : currentSubsectionIndex >= 0
                    ? (currentSubsectionDetail?.title ?? '...')
                    : currentSectionDetail.title}
                </h2>
                <div className="flex gap-2 mb-4 p-1 bg-brand-50 rounded-xl">
                  <button onClick={() => setTextMode('government')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${textMode === 'government' ? 'bg-slate-700 text-white shadow-sm' : 'text-brand-600 hover:text-brand-900'}`}>
                    Standard
                  </button>
                  <button onClick={() => setTextMode('easy')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${textMode === 'easy' ? 'bg-brand-900 text-white shadow-sm' : 'text-brand-600 hover:text-brand-900'}`}>
                    Easy Mode
                  </button>
                </div>
                <div className="p-4 sm:p-5 bg-brand-50 rounded-xl select-text" onMouseUp={handleTextMouseUp}>
                  {playerContentMode === 'combined' ? (
                    isPreparingCombined ? (
                      <div className="flex items-center gap-2 text-brand-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Preparing combined text and audio...
                      </div>
                    ) : combinedSegments.length === 0 ? (
                      <p className="text-base leading-relaxed text-brand-900 whitespace-pre-wrap">No combined text available for this language/mode.</p>
                    ) : (
                      <div className="border border-brand-200 bg-white rounded-xl overflow-hidden">
                        {combinedSegments.map((segment, idx) => (
                          <div key={`${segment.title}-${idx}`} className={`p-4 sm:p-5 ${idx > 0 ? 'border-t border-brand-100' : ''}`}>
                            {segment.title && (
                              <p className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider mb-2">{segment.title}</p>
                            )}
                            <p className="text-base leading-relaxed text-brand-900 whitespace-pre-wrap">{segment.text}</p>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="text-base leading-relaxed text-brand-900 whitespace-pre-wrap">
                      {(() => {
                        // Use subsection detail text when playing a subsection
                        const content = currentSubsectionIndex >= 0 ? currentSubsectionDetail : currentSectionDetail;
                        if (!content) return 'Loading...';
                        if (textMode === 'government') {
                          return (selectedLanguage === 'english' ? content.englishText : content.hindiText) || 'No transcription available';
                        } else {
                          return (selectedLanguage === 'english' ? content.easyEnglishText : content.easyHindiText) || 'No easy transcription available';
                        }
                      })()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm border-t border-brand-200 shadow-2xl flex-shrink-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {/* Progress and Time */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between text-sm font-bold mb-2">
              <span className="text-gold-600">{formatTime(displayCurrentTime)}</span>
              <div className="flex items-center gap-1.5 text-xs text-brand-500">
                {playerContentMode === 'combined' && queueUrls.length > 0 && (
                  <>
                    <span>Part {Math.min(queueIndex + 1, queueUrls.length)} of {queueUrls.length}</span>
                    <span>•</span>
                  </>
                )}
                <span>{playbackSpeed}x</span>
                <span>•</span>
                <span>{formatTime(displayTotalDuration)}</span>
              </div>
            </div>
            <div className="relative h-2.5 bg-brand-200 rounded-full overflow-hidden cursor-pointer group" onClick={handleSeek}>
              <div className="absolute top-0 left-0 h-full bg-brand-900 transition-all rounded-full" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border-2 border-gold-500" />
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3">
            <button onClick={resetAudio} className="p-3 hover:bg-brand-100 rounded-full transition-all group">
              <RotateCcw className="w-4 h-4 text-brand-700 group-hover:text-gold-600" />
            </button>
            <button onClick={togglePlayPause} className="p-6 bg-gold-500 hover:bg-gold-600 rounded-full transition-all shadow-xl transform hover:scale-105">
              {isPlaying ? <Pause className="w-8 h-8 text-white" fill="white" /> : <Play className="w-8 h-8 text-white" fill="white" />}
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between">
            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button onClick={toggleMute} className="p-2 hover:bg-brand-100 rounded-lg transition-all">
                {isMuted || volume === 0 ?
                  <VolumeX className="w-5 h-5 text-brand-700" /> :
                  <Volume2 className="w-5 h-5 text-brand-700" />
                }
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-brand-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(isMuted ? 0 : volume) * 100}%, #e2e8f0 ${(isMuted ? 0 : volume) * 100}%, #e2e8f0 100%)`
                  }}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-brand-100 rounded-lg transition-all"
              >
                <Settings className="w-5 h-5 text-brand-700" />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-brand-200 p-3 min-w-[160px]">
                  <div className="text-sm font-medium text-brand-700 mb-2">Playback Speed</div>
                  <div className="grid grid-cols-3 gap-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed as PlaybackSpeed)}
                        className={`px-2 py-1 text-xs rounded transition-all ${playbackSpeed === speed
                          ? 'bg-gold-500 text-white'
                          : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                          }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Text selection Ask AI bubble */}
      {selectionPopup && (
        <div
          data-ai-popup="true"
          style={{ position: 'fixed', left: selectionPopup.x, top: selectionPopup.y, transform: 'translate(-50%, -100%)' }}
          className="z-[60]"
        >
          <button
            onClick={openAiChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-900 hover:bg-brand-700 text-white rounded-full shadow-lg text-xs font-semibold border border-brand-600 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Ask AI
          </button>
        </div>
      )}

      {/* AI mini chat panel */}
      {showAiChat && (
        <div className="fixed bottom-4 right-4 z-[60] w-[92vw] sm:w-[520px] bg-white rounded-2xl shadow-2xl border border-brand-200 flex flex-col overflow-hidden" style={{ maxHeight: '72vh' }}>
          <div className="flex items-center justify-between px-5 py-4 bg-brand-900 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <div>
                <p className="font-semibold text-base leading-tight">Ask AI</p>
                <p className="text-[11px] text-brand-300">Context-aware legal assistant</p>
              </div>
            </div>
            <button onClick={() => setShowAiChat(false)} className="p-1 rounded-lg hover:bg-brand-700 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedText && (
            <div className="px-4 py-3 bg-gold-50 border-b border-gold-200 flex-shrink-0">
              <p className="text-xs text-gold-700 font-semibold mb-1">Selected text loaded in draft:</p>
              <p className="text-sm text-gold-800 line-clamp-2 italic">"{selectedText.slice(0, 180)}{selectedText.length > 180 ? '…' : ''}"</p>
            </div>
          )}

          <div ref={aiChatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0" style={{ maxHeight: '44vh' }}>
            {aiMessages.length === 0 && (
              <p className="text-sm text-brand-400 text-center py-6">
                {selectedText ? 'Review the draft below and press send when ready.' : 'Ask anything about this audio content.'}
              </p>
            )}
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-brand-900 text-white' : 'bg-brand-50 text-brand-800 border border-brand-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-brand-50 border border-brand-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                  <span className="text-xs text-brand-500">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 p-4 border-t border-brand-200 flex-shrink-0 bg-white">
            <textarea
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendAiMessage();
                }
              }}
              placeholder="Write or edit your question before sending..."
              rows={4}
              className="flex-1 resize-none text-sm border border-brand-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-brand-500 text-brand-800 placeholder:text-brand-400"
            />
            <button
              onClick={sendAiMessage}
              disabled={!aiQuery.trim() || aiLoading}
              className="px-4 py-3 bg-brand-900 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl transition-all flex-shrink-0 text-sm font-semibold"
            >
              <span className="inline-flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                Send
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Notes Panel Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${showNotes ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${showNotes ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setShowNotes(false)}
        />

        {/* Notes Panel */}
        <div className={`absolute right-0 top-0 bottom-0 w-full md:w-96 transform transition-transform duration-300 ease-out ${showNotes ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <NotesPanel
            referenceType="audio"
            referenceId={lesson._id}
            currentContext={Math.floor(currentTime)}
            onClose={() => setShowNotes(false)}
          />
        </div>
      </div>
    </div>
  );
}

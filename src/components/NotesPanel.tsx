import { useState, useEffect } from 'react';
import { StickyNote, Edit2, Trash2, Heart, Bookmark, X } from 'lucide-react';
import notesService, { Note, CreateNoteDto } from '../services/notesService';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface NotesPanelProps {
  referenceType: 'pdf' | 'audio' | 'quiz' | 'video';
  referenceId: string;
  currentContext?: number; // page number for PDF, timestamp for audio
  onClose?: () => void;
}

export default function NotesPanel({ referenceType, referenceId, currentContext, onClose }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; noteId: string | null }>({ isOpen: false, noteId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [referenceId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const fetchedNotes = await notesService.getNotesByReference(referenceType, referenceId);
      console.log('Fetched notes:', fetchedNotes);
      // Ensure we always have an array
      setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    try {
      const metadata: any = {};
      if (referenceType === 'pdf') metadata.page = currentContext;
      if (referenceType === 'audio') metadata.timestamp = currentContext;

      const noteData: CreateNoteDto = {
        title: noteTitle,
        content: noteContent,
        reference: {
          type: referenceType,
          id: referenceId,
          metadata,
        },
        tags: [],
      };

      if (editingNote) {
        const updated = await notesService.updateNote(editingNote._id, noteData);
        console.log('Note updated:', updated);
        // Update in state
        setNotes(notes.map(n => n._id === updated._id ? updated : n));
      } else {
        const created = await notesService.createNote(noteData);
        console.log('Note created:', created);
        // Add to state immediately
        setNotes([created, ...notes]);
      }

      setNoteTitle('');
      setNoteContent('');
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const handleDeleteNote = async () => {
    if (!deleteDialog.noteId) return;
    setIsDeleting(true);
    try {
      await notesService.deleteNote(deleteDialog.noteId);
      setNotes((prev) => prev.filter((note) => note._id !== deleteDialog.noteId));
      setDeleteDialog({ isOpen: false, noteId: null });
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpanded = (noteId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      const updatedNote = await notesService.toggleBookmark(id);
      setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...updatedNote } : n)));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const handleToggleFavourite = async (id: string) => {
    try {
      const updatedNote = await notesService.toggleFavourite(id);
      setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...updatedNote } : n)));
    } catch (error) {
      console.error('Failed to toggle favourite:', error);
      alert('Failed to update favourite. Please try again.');
    }
  };

  const getContextLabel = (note: Note) => {
    if (referenceType === 'pdf' && note.reference?.metadata?.page) {
      return `Page ${note.reference.metadata.page}`;
    }
    if (referenceType === 'audio' && note.reference?.metadata?.timestamp) {
      const mins = Math.floor(note.reference.metadata.timestamp / 60);
      const secs = note.reference.metadata.timestamp % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return '';
  };

  return (
    <div className="w-full md:w-80 bg-white md:border-l border-brand-200 flex flex-col h-full md:ml-auto">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-brand-200 bg-gradient-to-r bg-gold-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-gold-600" />
            <h3 className="text-brand-800 font-bold text-base sm:text-lg">My Notes</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-white/50 active:bg-white/70 rounded transition-all touch-manipulation">
              <X className="w-5 h-5 text-brand-600" />
            </button>
          )}
        </div>

        {/* Note Input */}
        <div className="space-y-2">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full px-3 py-2 border border-brand-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 touch-manipulation"
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your note here..."
            className="w-full px-3 py-2 border border-brand-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500 touch-manipulation"
            rows={3}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSaveNote}
              disabled={!noteTitle.trim() || !noteContent.trim()}
              className="flex-1 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 active:bg-gold-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm touch-manipulation"
            >
              {editingNote ? 'Update' : 'Add'} Note
            </button>
            {editingNote && (
              <button
                onClick={() => {
                  setEditingNote(null);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                className="px-4 py-2.5 bg-brand-200 hover:bg-brand-300 active:bg-brand-400 text-brand-700 rounded-lg font-semibold transition-all text-sm touch-manipulation"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-brand-50">
        {loading ? (
          <div className="text-center text-brand-500 py-8">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center text-brand-500 py-8">
            <StickyNote className="w-12 h-12 mx-auto mb-2 text-brand-300" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Create your first note above</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-yellow-50 border-l-4 border-gold-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-brand-800 mb-1">{note.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getContextLabel(note) && (
                      <span className="text-xs font-semibold text-gold-700 bg-white px-2 py-1 rounded">
                        {getContextLabel(note)}
                      </span>
                    )}
                    <span className="text-xs text-brand-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleFavourite(note._id)}
                    className={`p-1.5 rounded hover:bg-white/50 active:bg-white/70 transition-all touch-manipulation ${note.isFavourite ? 'text-red-500' : 'text-brand-400'
                      }`}
                  >
                    <Heart className="w-4 h-4" fill={note.isFavourite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => handleToggleBookmark(note._id)}
                    className={`p-1.5 rounded hover:bg-white/50 active:bg-white/70 transition-all touch-manipulation ${note.isBookmarked ? 'text-gold-500' : 'text-brand-400'
                      }`}
                  >
                    <Bookmark className="w-4 h-4" fill={note.isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <p className={`text-sm text-brand-700 leading-relaxed ${expandedNotes.has(note._id) ? '' : 'line-clamp-3'
                  }`}>
                  {note.content}
                </p>
                {note.content.length > 100 && (
                  <button
                    onClick={() => toggleExpanded(note._id)}
                    className="text-xs text-gold-600 hover:text-gold-700 font-medium mt-1"
                  >
                    {expandedNotes.has(note._id) ? 'Read less' : 'Read more'}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditNote(note)}
                  className="text-xs text-gold-600 hover:text-gold-700 active:text-gold-800 font-medium flex items-center gap-1 touch-manipulation py-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => setDeleteDialog({ isOpen: true, noteId: note._id })}
                  className="text-xs text-red-600 hover:text-red-700 active:text-red-800 font-medium flex items-center gap-1 touch-manipulation py-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, noteId: null })}
        onConfirm={handleDeleteNote}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookMarked, Plus, Search, Heart, Tag, Edit2, Trash2, X, Save, Bookmark } from 'lucide-react';
import notesService, { Note as ApiNote } from '../services/notesService';
import DeleteConfirmDialog from './DeleteConfirmDialog';

type Note = ApiNote;

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; noteId: string | null }>({ isOpen: false, noteId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    loadNotes();
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, selectedCategory, showFavoritesOnly]);

  const loadNotes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await notesService.getNotes();
      setNotes(response.items || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];

    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((note) => note.tags?.includes(selectedCategory));
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((note) => note.isFavourite);
    }

    setFilteredNotes(filtered);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await notesService.createNote({
        title: formData.title,
        content: formData.content,
        reference: { type: 'pdf', id: 'general' },
        tags: tagsArray,
      });

      setFormData({ title: '', content: '', tags: '' });
      setIsCreating(false);
      loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const updatedNote = await notesService.updateNote(editingNote._id, {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
      });

      setNotes((prev) => prev.map((n) => (n._id === editingNote._id ? updatedNote : n)));
      setFormData({ title: '', content: '', tags: '' });
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteDialog.noteId) return;

    setIsDeleting(true);
    try {
      await notesService.deleteNote(deleteDialog.noteId);
      setNotes((prev) => prev.filter((note) => note._id !== deleteDialog.noteId));
      setDeleteDialog({ isOpen: false, noteId: null });
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFavorite = async (note: Note) => {
    setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, isFavourite: !n.isFavourite } : n)));
    try {
      await notesService.toggleFavourite(note._id);
    } catch (error) {
      setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, isFavourite: !n.isFavourite } : n)));
      alert('Failed to update favorite.');
    }
  };

  const toggleBookmark = async (note: Note) => {
    setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, isBookmarked: !n.isBookmarked } : n)));
    try {
      await notesService.toggleBookmark(note._id);
    } catch (error) {
      setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, isBookmarked: !n.isBookmarked } : n)));
      alert('Failed to update bookmark.');
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags?.join(', ') || '',
    });
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

  const cancelEditing = () => {
    setEditingNote(null);
    setIsCreating(false);
    setFormData({ title: '', content: '', tags: '' });
  };

  const categories = Array.from(new Set(notes.flatMap((n) => n.tags || []).filter(Boolean)));

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-brand-700 dark:text-gold-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-900 dark:text-brand-100">My Notes</h2>
            <p className="text-brand-400 dark:text-brand-400 text-sm">
              {notes.length} note{notes.length !== 1 ? 's' : ''} · {filteredNotes.length} shown
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 dark:bg-brand-700 hover:bg-brand-800 dark:hover:bg-brand-600 text-white rounded-xl transition-colors font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-brand-800 dark:text-brand-100 placeholder:text-brand-400 dark:placeholder:text-brand-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 text-brand-700 dark:text-brand-200 text-sm"
          >
            <option value="">All Tags</option>
            {categories.map((cat) => (
              <option key={cat} value={cat || ''}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${showFavoritesOnly
              ? 'bg-brand-900 text-white'
              : 'bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span>Favourites</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-brand-800 border border-brand-100 dark:border-brand-700/60 rounded-2xl">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookMarked className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-brand-700 dark:text-brand-200 font-semibold text-lg mb-1">
            {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
          </h3>
          <p className="text-brand-500 dark:text-brand-400 text-sm">
            {notes.length === 0 ? 'Create your first note to get started' : 'Try different search terms or filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 rounded-2xl p-5 hover:shadow-card hover:border-brand-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-brand-900 dark:text-brand-100 flex-1 line-clamp-1 text-base">{note.title}</h3>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => toggleBookmark(note)}
                    className="p-1.5 hover:bg-gold-50 rounded-lg transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 transition-colors ${note.isBookmarked ? 'fill-gold-500 text-gold-500' : 'text-brand-300 dark:text-brand-500 group-hover:text-brand-500'}`} />
                  </button>
                  <button
                    onClick={() => toggleFavorite(note)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${note.isFavourite ? 'fill-red-500 text-red-500' : 'text-brand-300 dark:text-brand-500 group-hover:text-brand-500'}`} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className={`text-sm text-brand-600 dark:text-brand-300 whitespace-pre-wrap leading-relaxed break-words ${expandedNotes.has(note._id) ? '' : 'line-clamp-3'}`}>
                  {note.content}
                </div>
                <button
                  onClick={() => toggleExpanded(note._id)}
                  className="text-xs text-gold-600 hover:text-gold-700 font-medium mt-1.5 inline-block"
                >
                  {expandedNotes.has(note._id) ? 'Read less' : 'Read more'}
                </button>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {note.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="flex items-center px-2 py-0.5 bg-brand-100 dark:bg-brand-700 text-brand-600 dark:text-brand-300 text-xs rounded-md font-medium">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-brand-100 dark:border-brand-700/60">
                {note.updatedAt && (
                  <span className="text-xs text-brand-400 dark:text-brand-500">
                    {new Date(note.updatedAt).toLocaleDateString('en-IN')}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditing(note)}
                    className="p-2 hover:bg-brand-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-brand-400 hover:text-brand-700" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, noteId: note._id })}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-brand-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isCreating || editingNote) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-brand-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-brand-200 dark:border-brand-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 dark:border-brand-700/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                  <BookMarked className="w-4 h-4 text-gold-400" />
                </div>
                <h2 className="text-lg font-bold text-brand-900 dark:text-brand-100">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </h2>
              </div>
              <button
                onClick={cancelEditing}
                className="p-2 hover:bg-brand-100 dark:hover:bg-brand-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-brand-500 dark:text-brand-400" />
              </button>
            </div>

            <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Enter note title…"
                />
              </div>

              <div>
                <label className="label">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={10}
                  className="input-field resize-none"
                  placeholder="Write your notes here…"
                />
              </div>

              <div>
                <label className="label">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-field"
                  placeholder="Separate tags with commas"
                />
                <p className="text-xs text-brand-400 dark:text-brand-500 mt-1">Example: important, exam, article-370</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-5 py-2.5 bg-brand-100 dark:bg-brand-800 hover:bg-brand-200 dark:hover:bg-brand-700 text-brand-700 dark:text-brand-200 rounded-xl transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-900 dark:bg-brand-700 hover:bg-brand-800 dark:hover:bg-brand-600 text-white rounded-xl transition-colors font-semibold text-sm"
                >
                  <Save className="w-4 h-4" />
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

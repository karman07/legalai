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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <BookMarked className="w-7 h-7 mr-2 text-amber-600" />
            My Notes
          </h2>
          <p className="text-slate-600 mt-1">Create and organize your study notes</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Note</span>
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat || ''}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showFavoritesOnly
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <BookMarked className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">
            {notes.length === 0 ? 'No notes yet. Create your first note!' : 'No notes match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all bg-white group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex-1 line-clamp-1 text-lg">{note.title}</h3>
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => toggleBookmark(note)}
                    className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                    title={note.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <Bookmark
                      className={`w-5 h-5 transition-colors ${
                        note.isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => toggleFavorite(note)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title={note.isFavourite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        note.isFavourite ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className={`text-sm text-slate-600 whitespace-pre-wrap leading-relaxed ${
                  expandedNotes.has(note._id) ? '' : 'line-clamp-3'
                }`}>
                  {note.content}
                </p>
                {note.content?.length > 150 && (
                  <button
                    onClick={() => toggleExpanded(note._id)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1"
                  >
                    {expandedNotes.has(note._id) ? 'Read less' : 'Read more'}
                  </button>
                )}
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-md font-medium">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {note.updatedAt && (
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(note.updatedAt).toLocaleDateString('en-IN')}
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => startEditing(note)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/edit"
                    title="Edit note"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500 group-hover/edit:text-blue-600 transition-colors" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, noteId: note._id })}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group/delete"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4 text-slate-500 group-hover/delete:text-red-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isCreating || editingNote) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h2>
              <button
                onClick={cancelEditing}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter note title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={10}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Write your notes here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Separate tags with commas"
                />
                <p className="text-xs text-slate-500 mt-1">Example: important, exam, article-370</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingNote ? 'Update' : 'Create'} Note</span>
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
        isDeleting={isDeleting}
      />
    </div>
  );
}

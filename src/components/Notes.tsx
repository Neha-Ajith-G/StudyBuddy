import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Calendar, Clock } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  sessionId?: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });

  useEffect(() => {
    const savedNotes = localStorage.getItem('studyBuddyNotes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setNotes(parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        })));
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studyBuddyNotes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title || 'Untitled Note',
        content: newNote.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };
      
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '', tags: '' });
      setIsCreating(false);
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
    setEditingId(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const NoteCard: React.FC<{ note: Note }> = ({ note }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(note.title);
    const [editContent, setEditContent] = useState(note.content);
    const [editTags, setEditTags] = useState(note.tags.join(', '));

    const handleSave = () => {
      handleUpdateNote(note.id, {
        title: editTitle,
        content: editContent,
        tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      });
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditTitle(note.title);
      setEditContent(note.content);
      setEditTags(note.tags.join(', '));
      setIsEditing(false);
    };

    return (
      <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-orange-400 outline-none pb-2"
              placeholder="Note title..."
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none resize-none"
              placeholder="Write your note here..."
            />
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none text-sm"
              placeholder="Tags (comma separated)"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-900">{note.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">
              {note.content}
            </p>
            
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(note.createdAt)}</span>
                </div>
                {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated {formatDate(note.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Notes</h1>
          <p className="text-gray-600">Keep track of your learning journey</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="space-y-4">
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full text-xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-orange-400 outline-none pb-2"
              placeholder="Note title..."
            />
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full h-32 bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none resize-none"
              placeholder="Write your note here..."
            />
            <input
              type="text"
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none text-sm"
              placeholder="Tags (comma separated)"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateNote}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Create Note</span>
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', tags: '' });
                }}
                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No notes yet</h3>
          <p className="text-gray-500">Create your first note to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
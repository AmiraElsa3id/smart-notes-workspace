import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote, updateNote } from '../services/noteService';
import { useState } from 'react';
import Modal from './ui/Modal';

const categoryColors = {
  personal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  work: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  study: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  finance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

export default function NoteCard({ note }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['notes'] });
      const previous = qc.getQueriesData({ queryKey: ['notes'] });
      qc.setQueriesData({ queryKey: ['notes'] }, (old) => {
        if (!old) return old;
        return { ...old, notes: old.notes?.filter((n) => n._id !== id) };
      });
      return { previous };
    },
    onError: (err, id, context) => {
      qc.setQueriesData({ queryKey: ['notes'] }, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });

  const pinMutation = useMutation({
    mutationFn: updateNote,
    onMutate: async ({ id, isPinned }) => {
      await qc.cancelQueries({ queryKey: ['notes'] });
      const previous = qc.getQueriesData({ queryKey: ['notes'] });
      qc.setQueriesData({ queryKey: ['notes'] }, (old) => {
        if (!old) return old;
        return { ...old, notes: old.notes?.map((n) => (n._id === id ? { ...n, isPinned } : n)) };
      });
      return { previous };
    },
    onError: (err, vars, context) => {
      qc.setQueriesData({ queryKey: ['notes'] }, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });

  const handleDelete = () => {
    deleteMutation.mutate(note._id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow group">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/notes/${note._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 flex-1">
            {note.title}
          </Link>
          <button
            onClick={() => pinMutation.mutate({ id: note._id, isPinned: !note.isPinned })}
            className={`p-1 rounded transition-colors shrink-0 ${note.isPinned ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {note.content && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{note.content}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${categoryColors[note.category]}`}>{note.category}</span>
          {note.status === 'archived' && (
            <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">archived</span>
          )}
          {note.tags?.map((tag) => (
            <span key={tag} className="badge bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link to={`/notes/${note._id}/edit`} className="btn-ghost p-1.5 rounded-lg text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-ghost p-1.5 rounded-lg text-red-500 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Note">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>"{note.title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}

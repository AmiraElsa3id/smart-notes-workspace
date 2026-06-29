import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getNoteById, deleteNote } from '../services/noteService';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

const categoryColors = {
  personal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  work: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  study: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  finance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMarkdown, setIsMarkdown] = useState(true);

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNoteById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      navigate('/notes');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Note not found.</p>
        <Link to="/notes" className="btn-primary">Back to notes</Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/notes" className="btn-secondary text-sm px-3 py-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link to={`/notes/${id}/edit`} className="btn-secondary text-sm px-3 py-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button onClick={() => setShowDeleteModal(true)} className="btn-danger text-sm px-3 py-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-start gap-3">
            {note.isPinned && (
              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">{note.title}</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${categoryColors[note.category]}`}>{note.category}</span>
            <span className={`badge ${note.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
              {note.status}
            </span>
            {note.tags?.map((tag) => (
              <span key={tag} className="badge bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                #{tag}
              </span>
            ))}
          </div>

          <div className="text-xs text-gray-400 flex gap-4">
            <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
          </div>

          {note.content && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Content</h2>
                <button
                  onClick={() => setIsMarkdown((v) => !v)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isMarkdown ? 'View Raw' : 'View Markdown'}
                </button>
              </div>
              {isMarkdown ? (
                <div className="prose dark:prose-invert max-w-none prose-sm">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
              ) : (
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  {note.content}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Note">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>"{note.title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={() => deleteMutation.mutate(id)} className="btn-danger" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}

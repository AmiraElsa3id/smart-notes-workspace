import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createNote } from '../services/noteService';
import NoteForm from '../components/NoteForm';

export default function CreateNote() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      navigate(`/notes/${note._id}`);
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Note</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Capture your thoughts and ideas.</p>
      </div>

      {mutation.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
          {mutation.error.response?.data?.message || 'Failed to create note'}
        </div>
      )}

      <div className="card p-6">
        <NoteForm onSubmit={(data) => mutation.mutate(data)} isLoading={mutation.isPending} />
      </div>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getNoteById, updateNote } from '../services/noteService';
import NoteForm from '../components/NoteForm';
import Spinner from '../components/ui/Spinner';

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNoteById(id),
  });

  const mutation = useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      qc.invalidateQueries({ queryKey: ['note', id] });
      navigate(`/notes/${id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Note not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Note</h1>
      </div>

      {mutation.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
          {mutation.error.response?.data?.message || 'Failed to update note'}
        </div>
      )}

      <div className="card p-6">
        <NoteForm
          defaultValues={note}
          onSubmit={(data) => mutation.mutate({ id, ...data })}
          isLoading={mutation.isPending}
        />
      </div>
    </div>
  );
}

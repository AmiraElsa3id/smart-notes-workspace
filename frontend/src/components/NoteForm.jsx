import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().optional(),
  category: z.enum(['personal', 'work', 'study', 'health', 'finance', 'other']),
  tags: z.string().optional(),
  status: z.enum(['active', 'archived']),
  isPinned: z.boolean(),
});

export default function NoteForm({ defaultValues, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      category: 'other',
      tags: '',
      status: 'active',
      isPinned: false,
      ...defaultValues,
      tags: defaultValues?.tags?.join(', ') ?? '',
    },
  });

  const handleFormSubmit = (data) => {
    const tags = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    onSubmit({ ...data, tags });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div>
        <label className="label">Title *</label>
        <input {...register('title')} className="input" placeholder="Note title..." />
        {errors.title && <p className="error-text">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Content</label>
        <textarea
          {...register('content')}
          className="input min-h-[200px] resize-y font-mono text-sm"
          placeholder="Write your note here... (Markdown supported)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Category</label>
          <select {...register('category')} className="input">
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="study">Study</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Tags (comma-separated)</label>
        <input {...register('tags')} className="input" placeholder="react, javascript, tutorial..." />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPinned" {...register('isPinned')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin this note</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => history.back()} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </form>
  );
}

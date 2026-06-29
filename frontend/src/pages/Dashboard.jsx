import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { getNotes } from '../services/noteService';
import NoteCard from '../components/NoteCard';
import Spinner from '../components/ui/Spinner';

const StatCard = ({ label, value, color }) => (
  <div className="card p-5">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const user = useSelector(selectUser);

  const { data: allNotes, isLoading } = useQuery({
    queryKey: ['notes', { limit: 100 }],
    queryFn: () => getNotes({ limit: 100 }),
  });

  const { data: pinnedData } = useQuery({
    queryKey: ['notes', 'pinned'],
    queryFn: () => getNotes({ limit: 4, sortBy: 'updatedAt' }),
  });

  const notes = allNotes?.notes || [];
  const active = notes.filter((n) => n.status === 'active').length;
  const archived = notes.filter((n) => n.status === 'archived').length;
  const pinned = notes.filter((n) => n.isPinned).length;

  const categoryCount = notes.reduce((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your notes.</p>
        </div>
        <Link to="/notes/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Notes" value={notes.length} color="text-blue-600 dark:text-blue-400" />
            <StatCard label="Active" value={active} color="text-green-600 dark:text-green-400" />
            <StatCard label="Archived" value={archived} color="text-gray-500 dark:text-gray-400" />
            <StatCard label="Pinned" value={pinned} color="text-yellow-600 dark:text-yellow-400" />
          </div>

          {topCategory && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Top Category</h2>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{topCategory[1]}</span>
                <div>
                  <p className="font-medium capitalize">{topCategory[0]}</p>
                  <p className="text-sm text-gray-500">notes</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Recent Notes</h2>
              <Link to="/notes" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</Link>
            </div>
            {pinnedData?.notes?.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-gray-400 mb-3">No notes yet.</p>
                <Link to="/notes/new" className="btn-primary inline-flex">Create your first note</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedData?.notes?.map((note) => <NoteCard key={note._id} note={note} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

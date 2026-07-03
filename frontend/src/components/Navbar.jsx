import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout, selectUser } from '../store/slices/authSlice';
import { toggleTheme, selectTheme } from '../store/slices/themeSlice';
import { queryClient } from '../services/queryClient';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const theme = useSelector(selectTheme);

  const handleLogout = () => {
    queryClient.clear();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">Smart Notes</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="btn-ghost p-2 rounded-lg"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium hidden md:block">{user?.name}</span>
            </Link>

            <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-1.5">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

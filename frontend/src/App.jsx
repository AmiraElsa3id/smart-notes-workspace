import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { selectTheme } from './store/slices/themeSlice';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotesList from './pages/NotesList';
import CreateNote from './pages/CreateNote';
import EditNote from './pages/EditNote';
import NoteDetails from './pages/NoteDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="notes" element={<NotesList />} />
          <Route path="notes/new" element={<CreateNote />} />
          <Route path="notes/:id" element={<NoteDetails />} />
          <Route path="notes/:id/edit" element={<EditNote />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, changePassword } from '../services/authService';
import { selectUser, updateUser } from '../store/slices/authSlice';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const profileMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      fd.append('name', data.name);
      if (avatarFile) fd.append('avatar', avatarFile);
      return updateProfile(fd);
    },
    onSuccess: (data) => {
      dispatch(updateUser(data));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      passwordForm.reset();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const avatarSrc = avatarPreview || user?.avatar || null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings.</p>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-lg">Personal Information</h2>

        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200 dark:border-gray-600">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg px-4 py-3 text-sm">
            Profile updated successfully!
          </div>
        )}
        {profileMutation.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
            {profileMutation.error.response?.data?.message || 'Update failed'}
          </div>
        )}

        <form onSubmit={profileForm.handleSubmit((data) => profileMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input {...profileForm.register('name')} className="input" />
            {profileForm.formState.errors.name && (
              <p className="error-text">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <button type="submit" className="btn-primary" disabled={profileMutation.isPending}>
            {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-lg">Change Password</h2>

        {passwordSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg px-4 py-3 text-sm">
            Password changed successfully!
          </div>
        )}
        {passwordMutation.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
            {passwordMutation.error.response?.data?.message || 'Failed to change password'}
          </div>
        )}

        <form onSubmit={passwordForm.handleSubmit((data) => passwordMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input {...passwordForm.register('currentPassword')} type="password" className="input" placeholder="••••••••" />
            {passwordForm.formState.errors.currentPassword && (
              <p className="error-text">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="label">New Password</label>
            <input {...passwordForm.register('newPassword')} type="password" className="input" placeholder="Min. 6 characters" />
            {passwordForm.formState.errors.newPassword && (
              <p className="error-text">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input {...passwordForm.register('confirmPassword')} type="password" className="input" placeholder="••••••••" />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="error-text">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={passwordMutation.isPending}>
            {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

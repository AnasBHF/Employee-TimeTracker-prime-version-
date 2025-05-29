import React, { useState } from 'react';
import { useApp } from '../App';
import { UserIcon, MailIcon, BuildingIcon, BriefcaseIcon, CameraIcon, LockIcon } from 'lucide-react';
import { ProfilePictureUpload } from '../components/ProfilePictureUpload';

export function Profile() {
  const {
    user,
    updateEmployee
  } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  if (!user) return null;

  const handleUpdateProfilePicture = async (file: File) => {
    try {
      // Convert the file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Update the user with the new profile picture
        const updatedUser = {
          ...user,
          profilePicture: base64String
        };

        updateEmployee(user.id, updatedUser);
      };
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Failed to update profile picture. Please try again.');
    }
  };

  const handleRemoveProfilePicture = () => {
    try {
      const updatedUser = {
        ...user,
        profilePicture: undefined
      };

      updateEmployee(user.id, updatedUser);
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    try {
      // Update the user with the new password
      const updatedUser = {
        ...user,
        password: passwordData.newPassword
      };

      updateEmployee(user.id, updatedUser);
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password. Please try again.');
    }
  };

  return <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 px-6 py-8">
        <div className="flex items-center">
          <div className="relative">
            <ProfilePictureUpload
              currentImage={user.profilePicture}
              onImageUpload={handleUpdateProfilePicture}
              onRemoveImage={handleRemoveProfilePicture}
            />
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-blue-100">{user.position}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Profile Information
        </h2>
        <div className="space-y-6">
          <div className="flex items-center">
            <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <BuildingIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-gray-900">{user.department}</p>
            </div>
          </div>
          <div className="flex items-center">
            <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Position</p>
              <p className="text-gray-900">{user.position}</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="text-gray-900">{user.id}</p>
            </div>
          </div>
          <div className="flex items-center">
            <LockIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Password</p>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Password Change Form */}
        {showPasswordForm && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              {passwordError && (
                <p className="text-red-600 text-sm">{passwordError}</p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  </div>;
}
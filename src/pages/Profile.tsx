import React, { useState } from 'react';
import { useApp } from '../App';
import { UserIcon, MailIcon, BuildingIcon, BriefcaseIcon, CameraIcon } from 'lucide-react';
import { ProfilePictureUpload } from '../components/ProfilePictureUpload';

export function Profile() {
  const {
    user,
    updateEmployee
  } = useApp();
  const [isEditing, setIsEditing] = useState(false);

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
        </div>
      </div>
    </div>
  </div>;
}
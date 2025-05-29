import React, { useState } from 'react';
import { UserIcon, MailIcon, BuildingIcon, BriefcaseIcon, ClockIcon } from 'lucide-react';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface EmployeeProfileProps {
    employee: {
        id: string;
        name: string;
        email: string;
        department: string;
        position: string;
        isActive: boolean;
        profilePicture?: string;
    };
    timeEntries: Array<{
        date: string;
        clockIn: string;
        clockOut: string;
        totalHours: number;
    }>;
    onClose: () => void;
    onUpdateProfilePicture?: (file: File) => void;
    onRemoveProfilePicture?: () => void;
}

export function EmployeeProfile({
    employee,
    timeEntries,
    onClose,
    onUpdateProfilePicture,
    onRemoveProfilePicture
}: EmployeeProfileProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleImageUpload = (file: File) => {
        if (onUpdateProfilePicture) {
            onUpdateProfilePicture(file);
        }
    };

    const handleRemoveImage = () => {
        if (onRemoveProfilePicture) {
            onRemoveProfilePicture();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Employee Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        {onUpdateProfilePicture ? (
                            <ProfilePictureUpload
                                currentImage={employee.profilePicture}
                                onImageUpload={handleImageUpload}
                                onRemoveImage={handleRemoveImage}
                            />
                        ) : (
                            <div className="h-24 w-24 bg-gray-300 rounded-full flex items-center justify-center">
                                {employee.profilePicture ? (
                                    <img
                                        src={employee.profilePicture}
                                        alt={employee.name}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <UserIcon className="h-12 w-12 text-gray-600" />
                                )}
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{employee.name}</h3>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                            <p className="text-sm text-gray-500">ID: {employee.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-gray-900">{employee.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <BuildingIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Department</p>
                                    <p className="text-gray-900">{employee.department}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Position</p>
                                    <p className="text-gray-900">{employee.position}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {employee.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance History */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
                    <div className="overflow-x-auto">
                        <div className="max-h-[300px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {timeEntries.map((entry, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.clockIn}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.clockOut}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.totalHours.toFixed(1)}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
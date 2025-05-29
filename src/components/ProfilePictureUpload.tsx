import React, { useState, useRef } from 'react';
import { CameraIcon, XIcon } from 'lucide-react';

interface ProfilePictureUploadProps {
    currentImage?: string;
    onImageUpload: (file: File) => void;
    onRemoveImage: () => void;
}

export function ProfilePictureUpload({ currentImage, onImageUpload, onRemoveImage }: ProfilePictureUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Call the parent component's upload handler
        onImageUpload(file);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = (event: React.MouseEvent) => {
        event.stopPropagation();
        setPreviewUrl(null);
        onRemoveImage();
    };

    return (
        <div className="relative">
            <div
                className={`relative w-32 h-32 rounded-full overflow-hidden cursor-pointer transition-all duration-200 ${isDragging ? 'ring-4 ring-blue-500' : 'hover:opacity-90'
                    }`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {previewUrl ? (
                    <>
                        <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove image"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <CameraIcon className="w-8 h-8 text-gray-400" />
                    </div>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
                Click or drag image to upload
            </p>
        </div>
    );
} 
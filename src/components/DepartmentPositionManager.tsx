import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface DepartmentPositionManagerProps {
    departments: string[];
    positions: string[];
    onAddDepartment: (department: string) => void;
    onRemoveDepartment: (department: string) => void;
    onAddPosition: (position: string) => void;
    onRemovePosition: (position: string) => void;
}

export function DepartmentPositionManager({
    departments,
    positions,
    onAddDepartment,
    onRemoveDepartment,
    onAddPosition,
    onRemovePosition,
}: DepartmentPositionManagerProps) {
    const [newDepartment, setNewDepartment] = useState('');
    const [newPosition, setNewPosition] = useState('');

    const handleAddDepartment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDepartment.trim()) {
            onAddDepartment(newDepartment.trim());
            setNewDepartment('');
        }
    };

    const handleAddPosition = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPosition.trim()) {
            onAddPosition(newPosition.trim());
            setNewPosition('');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Departments Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Departments</h3>
                    <form onSubmit={handleAddDepartment} className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)}
                                placeholder="New department name"
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {departments.map((dept) => (
                            <div
                                key={dept}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                            >
                                <span className="text-gray-900">{dept}</span>
                                <button
                                    onClick={() => onRemoveDepartment(dept)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Remove department"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Positions Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Positions</h3>
                    <form onSubmit={handleAddPosition} className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPosition}
                                onChange={(e) => setNewPosition(e.target.value)}
                                placeholder="New position name"
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {positions.map((pos) => (
                            <div
                                key={pos}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                            >
                                <span className="text-gray-900">{pos}</span>
                                <button
                                    onClick={() => onRemovePosition(pos)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Remove position"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 
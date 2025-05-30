import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { PlusIcon, EditIcon, TrashIcon, UserIcon, EyeIcon, SearchIcon, ClockIcon, SettingsIcon } from 'lucide-react';
import { EmployeeForm } from '../components/EmployeeForm';
import { EmployeeProfile } from '../components/EmployeeProfile';
import { DepartmentPositionManager } from '../components/DepartmentPositionManager';
import { Select, Input, Space, Button, Modal } from 'antd';
import { SearchOutlined, FilterOutlined, CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import toast from 'react-hot-toast';

interface Filters {
  search: string;
  department: string;
  position: string;
  attendanceStatus: string;
  status: string;
}

export function EmployeeManagement() {
  const {
    employees,
    departments: availableDepartments,
    positions: availablePositions,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeTimeEntries,
    addDepartment,
    removeDepartment,
    addPosition,
    removePosition
  } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    department: '',
    position: '',
    attendanceStatus: 'all',
    status: 'all'
  });

  // Get unique departments and positions for filter dropdowns
  // const uniqueDepartments = useMemo(() => Array.from(new Set(employees.map(emp => emp.department))).sort(), [employees]);
  // const uniquePositions = useMemo(() => Array.from(new Set(employees.map(emp => emp.position))).sort(), [employees]);

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search filter
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = !filters.search ||
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm) ||
        employee.position.toLowerCase().includes(searchTerm) ||
        employee.department.toLowerCase().includes(searchTerm);

      // Department filter
      const matchesDepartment = !filters.department || employee.department === filters.department;

      // Position filter
      const matchesPosition = !filters.position || employee.position === filters.position;

      // Status filter
      const matchesStatus = filters.status === 'all' ||
        (filters.status === 'active' && employee.isActive) ||
        (filters.status === 'inactive' && !employee.isActive);

      // Attendance status filter
      const timeEntries = getEmployeeTimeEntries(employee.id);
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = timeEntries.find(entry => entry.date === today);

      let matchesAttendanceStatus = true;
      if (filters.attendanceStatus === 'late') {
        matchesAttendanceStatus = todayEntry?.clockIn && new Date(todayEntry.clockIn).getHours() >= 9;
      } else if (filters.attendanceStatus === 'early-leaving') {
        matchesAttendanceStatus = todayEntry?.clockOut && new Date(todayEntry.clockOut).getHours() < 17;
      }

      return matchesSearch && matchesDepartment && matchesPosition && matchesAttendanceStatus && matchesStatus;
    });
  }, [employees, filters, getEmployeeTimeEntries]);

  // Get the last 5 late arrivals and early leaves
  const getRecentAttendanceIssues = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    const issues = employees.flatMap(employee => {
      const timeEntries = getEmployeeTimeEntries(employee.id);
      const todayEntry = timeEntries.find(entry => entry.date === today);

      if (!todayEntry) return [];

      const clockInTime = todayEntry.clockIn ? new Date(`${today}T${todayEntry.clockIn}:00`).getHours() : null;
      const clockOutTime = todayEntry.clockOut ? new Date(`${today}T${todayEntry.clockOut}:00`).getHours() : null;

      const isLate = clockInTime !== null && clockInTime >= 9;
      const isEarlyLeaving = clockOutTime !== null && clockOutTime < 17;

      const employeeIssues = [];

      if (isLate) {
        employeeIssues.push({
          type: 'late',
          employee,
          time: todayEntry.clockIn
        });
      }

      if (isEarlyLeaving) {
        employeeIssues.push({
          type: 'early-leaving',
          employee,
          time: todayEntry.clockOut
        });
      }

      return employeeIssues;
    });

    // Sort by time (most recent first)
    return issues.sort((a, b) => {
      const timeA = new Date(`${today}T${a.time}:00`).getTime();
      const timeB = new Date(`${today}T${b.time}:00`).getTime();
      return timeB - timeA;
    });
  }, [employees, getEmployeeTimeEntries]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    setEmployeeToDelete(employee);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id);
      toast.success('Employee deleted successfully');
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setEmployeeToDelete(null);
  };

  const handleViewProfile = (employee: any) => {
    setSelectedEmployee(employee);
  };

  const handleFormSubmit = (employeeData: any) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
      toast.success('Employee updated successfully');
    } else {
      addEmployee(employeeData);
      toast.success('Employee added successfully');
    }
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleUpdateProfilePicture = async (employeeId: string, file: File) => {
    try {
      // Convert the file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Update the employee with the new profile picture
        const updatedEmployee = {
          ...employees.find(emp => emp.id === employeeId),
          profilePicture: base64String
        };

        updateEmployee(employeeId, updatedEmployee);
        toast.success('Profile picture updated successfully');
      };
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture. Please try again.');
    }
  };

  const handleRemoveProfilePicture = (employeeId: string) => {
    try {
      const updatedEmployee = {
        ...employees.find(emp => emp.id === employeeId),
        profilePicture: undefined
      };

      updateEmployee(employeeId, updatedEmployee);
      toast.success('Profile picture removed successfully');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture. Please try again.');
    }
  };

  console.log('Available Departments:', availableDepartments);
  console.log('Available Positions:', availablePositions);

  return <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage employee accounts and information
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button
            onClick={handleAddEmployee}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>
    </div>

    {/* Settings Modal */}
    {showSettings && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <DepartmentPositionManager
            departments={availableDepartments}
            positions={availablePositions}
            onAddDepartment={addDepartment}
            onRemoveDepartment={removeDepartment}
            onAddPosition={addPosition}
            onRemovePosition={removePosition}
          />
        </div>
      </div>
    )}

    {/* Employee Form Modal */}
    {showForm && <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <EmployeeForm employee={editingEmployee} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
      </div>
    </div>}
    {/* Search and Filters */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Search Bar */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Employees
          </label>
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search by name, email, ID..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="hover:border-blue-500 focus:border-blue-500"
            size="large"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <Select
            value={filters.department}
            onChange={value => setFilters(prev => ({ ...prev, department: value }))}
            placeholder="All Departments"
            allowClear
            className="w-full"
            size="large"
            options={[
              { value: '', label: 'All Departments' },
              ...availableDepartments.map(dept => ({
                value: dept,
                label: dept
              }))
            ]}
          />
        </div>

        {/* Position Filter */}
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <Select
            value={filters.position}
            onChange={value => setFilters(prev => ({ ...prev, position: value }))}
            placeholder="All Positions"
            allowClear
            className="w-full"
            size="large"
            options={[
              { value: '', label: 'All Positions' },
              ...availablePositions.map(pos => ({
                value: pos,
                label: pos
              }))
            ]}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={filters.status}
            onChange={value => setFilters(prev => ({ ...prev, status: value }))}
            placeholder="All Statuses"
            className="w-full"
            size="large"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </div>

        {/* Attendance Status Filter */}
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attendance Status
          </label>
          <Select
            value={filters.attendanceStatus}
            onChange={value => setFilters(prev => ({ ...prev, attendanceStatus: value }))}
            placeholder="All"
            className="w-full"
            size="large"
            options={[
              { value: 'all', label: 'All' },
              { value: 'late', label: 'Late Arrivals' },
              { value: 'early-leaving', label: 'Early Leaving' }
            ]}
          />
        </div>

        {/* Clear Filters */}
        {(filters.search || filters.department || filters.position || filters.status !== 'all' || filters.attendanceStatus !== 'all') && (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setFilters({
              search: '',
              department: '',
              position: '',
              status: 'all',
              attendanceStatus: 'all'
            })}
            className="flex items-center"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
    {/* Employee Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <UserIcon className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {employees.length}
            </p>
            <p className="text-gray-600">Total Employees</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <UserIcon className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {employees.filter(emp => emp.isActive).length}
            </p>
            <p className="text-gray-600">Active Employees</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <UserIcon className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {new Set(employees.map(emp => emp.department)).size}
            </p>
            <p className="text-gray-600">Departments</p>
          </div>
        </div>
      </div>
    </div>
    {/* Employee Table */}
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Employees</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map(employee => {
              const timeEntries = getEmployeeTimeEntries(employee.id);
              const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
              const today = new Date().toISOString().split('T')[0];
              const todayEntry = timeEntries.find(entry => entry.date === today);
              const isLate = todayEntry?.clockIn && new Date(todayEntry.clockIn).getHours() >= 9;
              const isEarlyLeaving = todayEntry?.clockOut && new Date(todayEntry.clockOut).getHours() < 17;

              return <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {employee.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt={employee.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {isLate && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Late Arrival
                      </span>
                    )}
                    {isEarlyLeaving && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Early Leaving
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input
                    type="number"
                    value={employee.manualTotalHours || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      updateEmployee(employee.id, { ...employee, manualTotalHours: value });
                    }}
                    className="w-20 rounded-md border border-gray-300 py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProfile(employee)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Profile"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* Employee Profile Modal */}
    {selectedEmployee && (
      <EmployeeProfile
        employee={selectedEmployee}
        timeEntries={getEmployeeTimeEntries(selectedEmployee.id)}
        onClose={() => setSelectedEmployee(null)}
        onUpdateProfilePicture={(file) => handleUpdateProfilePicture(selectedEmployee.id, file)}
        onRemoveProfilePicture={() => handleRemoveProfilePicture(selectedEmployee.id)}
      />
    )}

    {/* Delete Confirmation Modal */}
    <Modal
      title="Delete Employee"
      open={!!employeeToDelete}
      onOk={confirmDelete}
      onCancel={cancelDelete}
      okText="Delete"
      okButtonProps={{ danger: true }}
      cancelText="Cancel"
    >
      <div className="flex items-center space-x-4">
        <ExclamationCircleFilled className="text-red-500 text-2xl" />
        <div>
          <p className="text-base">
            Are you sure you want to delete {employeeToDelete?.name}?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  </div>;
}
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { UsersIcon, ClockIcon, TrendingUpIcon, PieChartIcon, SearchIcon, FilterIcon, XIcon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, Input, Space, Button } from 'antd';
import { SearchOutlined, FilterOutlined, CloseOutlined } from '@ant-design/icons';
interface Filters {
  department: string;
  position: string;
  clockStatus: 'all' | 'clocked-in' | 'completed';
  search: string;
}
export function AdminDashboard() {
  const {
    employees,
    timeEntries,
    getAllTimeEntries
  } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const allTimeEntries = getAllTimeEntries();
  // Search and Filter State
  const [filters, setFilters] = useState<Filters>({
    department: '',
    position: '',
    clockStatus: 'all',
    search: ''
  });
  // Get unique departments and positions for filter dropdowns
  const departments = useMemo(() => Array.from(new Set(employees.map(emp => emp.department))).sort(), [employees]);
  const positions = useMemo(() => Array.from(new Set(employees.map(emp => emp.position))).sort(), [employees]);
  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search filter
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = !filters.search || employee.name.toLowerCase().includes(searchTerm) || employee.email.toLowerCase().includes(searchTerm) || employee.id.toLowerCase().includes(searchTerm) || employee.position.toLowerCase().includes(searchTerm) || employee.department.toLowerCase().includes(searchTerm);
      // Department filter
      const matchesDepartment = !filters.department || employee.department === filters.department;
      // Position filter
      const matchesPosition = !filters.position || employee.position === filters.position;
      // Clock status filter
      const todayEntry = allTimeEntries.find(entry => entry.date === today && entry.employeeId === employee.id);
      const clockStatus = filters.clockStatus;
      const matchesClockStatus = clockStatus === 'all' || clockStatus === 'clocked-in' && todayEntry?.clockIn && !todayEntry?.clockOut || clockStatus === 'completed' && todayEntry?.clockIn && todayEntry?.clockOut;
      return matchesSearch && matchesDepartment && matchesPosition && matchesClockStatus;
    });
  }, [employees, filters, allTimeEntries, today]);
  // Calculate statistics based on filtered employees
  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter(emp => emp.isActive).length;
  const todayEntries = allTimeEntries.filter(entry => entry.date === today && filteredEmployees.some(emp => emp.id === entry.employeeId));
  const clockedInToday = todayEntries.filter(entry => entry.clockIn && !entry.clockOut).length;
  const completedToday = todayEntries.filter(entry => entry.clockIn && entry.clockOut).length;
  // Calculate late arrivals and early leaves
  const lateArrivals = todayEntries.filter(entry => {
    if (!entry.clockIn) return false;
    const [hours, minutes] = entry.clockIn.split(':').map(Number);
    return hours > 8 || (hours === 8 && minutes > 3);
  }).sort((a, b) => {
    const timeA = new Date(`${today}T${a.clockIn}:00`).getTime();
    const timeB = new Date(`${today}T${b.clockIn}:00`).getTime();
    return timeB - timeA;
  });
  const earlyLeaves = todayEntries.filter(entry => {
    if (!entry.clockOut) return false;
    const [hours, minutes] = entry.clockOut.split(':').map(Number);
    return hours < 17;
  }).sort((a, b) => {
    const timeA = new Date(`${today}T${a.clockOut}:00`).getTime();
    const timeB = new Date(`${today}T${b.clockOut}:00`).getTime();
    return timeB - timeA;
  });
  // Department distribution for filtered employees
  const departmentCounts = filteredEmployees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const departmentData = Object.entries(departmentCounts).map(([name, value]) => ({
    name,
    value
  }));
  // Hours by department for filtered employees
  const departmentHours = filteredEmployees.map(emp => {
    const empEntries = allTimeEntries.filter(entry => entry.employeeId === emp.id);
    const totalHours = emp.manualTotalHours !== undefined
      ? emp.manualTotalHours
      : empEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    return {
      department: emp.department,
      hours: totalHours
    };
  }).reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + curr.hours;
    return acc;
  }, {} as Record<string, number>);
  const hoursData = Object.entries(departmentHours).map(([department, hours]) => ({
    department,
    hours: Math.round(hours * 10) / 10
  }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  // Employee status data
  const employeeStatus = filteredEmployees.map(emp => {
    const todayEntry = todayEntries.find(entry => entry.employeeId === emp.id);
    let status = 'Not Started';
    if (todayEntry?.clockIn && todayEntry?.clockOut) {
      status = 'Completed';
    } else if (todayEntry?.clockIn) {
      status = 'Clocked In';
    }
    return {
      ...emp,
      status,
      clockIn: todayEntry?.clockIn || null,
      clockOut: todayEntry?.clockOut || null,
      totalHours: emp.manualTotalHours !== undefined
        ? emp.manualTotalHours
        : todayEntry?.totalHours || 0
    };
  });
  return <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Overview of employee attendance and statistics
      </p>
    </div>
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
              ...departments.map(dept => ({
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
              ...positions.map(pos => ({
                value: pos,
                label: pos
              }))
            ]}
          />
        </div>
        {/* Clock Status Filter */}
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clock Status
          </label>
          <Select
            value={filters.clockStatus}
            onChange={value => setFilters(prev => ({ ...prev, clockStatus: value as Filters['clockStatus'] }))}
            placeholder="All Status"
            className="w-full"
            size="large"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'clocked-in', label: 'Currently Clocked In' },
              { value: 'completed', label: 'Completed Today' }
            ]}
          />
        </div>
        {/* Clear Filters */}
        {(filters.search || filters.department || filters.position || filters.clockStatus !== 'all') && (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setFilters({
              department: '',
              position: '',
              clockStatus: 'all',
              search: ''
            })}
            className="flex items-center"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <UsersIcon className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {totalEmployees}
            </p>
            <p className="text-gray-600">Total Employees</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {clockedInToday}
            </p>
            <p className="text-gray-600">Currently Clocked In</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-red-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {lateArrivals.length}
            </p>
            <p className="text-gray-600">Late Arrivals</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {earlyLeaves.length}
            </p>
            <p className="text-gray-600">Early Leaves</p>
          </div>
        </div>
      </div>
    </div>
    {/* Late Arrivals and Early Leaves Lists */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Late Arrivals List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Late Arrivals</h3>
        {lateArrivals.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No late arrivals today
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {lateArrivals.map((entry, index) => {
              const employee = employees.find(emp => emp.id === entry.employeeId);
              if (!employee) return null;

              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {employee.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt={employee.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <UsersIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Late Arrival
                    </span>
                    <span className="ml-4 text-sm text-gray-500">{entry.clockIn}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Early Leaves List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Early Leaves</h3>
        {earlyLeaves.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No early leaves today
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {earlyLeaves.map((entry, index) => {
              const employee = employees.find(emp => emp.id === entry.employeeId);
              if (!employee) return null;

              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {employee.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt={employee.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <UsersIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Early Leave
                    </span>
                    <span className="ml-4 text-sm text-gray-500">{entry.clockOut}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Employee Distribution by Department
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={({
              name,
              percent
            }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
              {departmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Total Hours by Department
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hoursData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    {/* Employee Status Table */}
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Today's Employee Status
        </h3>
        <span className="text-sm text-gray-500">
          Showing {filteredEmployees.length} of {employees.length} employees
        </span>
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
                Clock In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employeeStatus.map(employee => <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {employee.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {employee.position}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.clockIn || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.clockOut || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.totalHours.toFixed(1)}h
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.status === 'Completed' ? 'bg-green-100 text-green-800' : employee.status === 'Clocked In' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {employee.status}
                </span>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}
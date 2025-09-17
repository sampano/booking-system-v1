import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Users, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { Term, RecurringSchedule, Course } from '../types';

interface CatalogManagementProps {
  terms: Term[];
  recurringSchedules: RecurringSchedule[];
  courses: Course[];
  onAddTerm: (termData: Omit<Term, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTerm: (termId: string, updates: Partial<Term>) => void;
  onDeleteTerm: (termId: string) => void;
  onAddSchedule: (scheduleData: Omit<RecurringSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSchedule: (scheduleId: string, updates: Partial<RecurringSchedule>) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

export const CatalogManagement: React.FC<CatalogManagementProps> = ({
  terms,
  recurringSchedules,
  courses,
  onAddTerm,
  onUpdateTerm,
  onDeleteTerm,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'schedules'>('terms');
  const [showTermForm, setShowTermForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<RecurringSchedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [termFormData, setTermFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    isActive: true
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    courseId: '',
    termId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    startDate: '',
    endDate: '',
    maxParticipants: 10,
    location: '',
    isActive: true
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleTermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTerm) {
      onUpdateTerm(editingTerm.id, termFormData);
    } else {
      onAddTerm(termFormData);
    }
    resetTermForm();
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourse = courses.find(c => c.id === scheduleFormData.courseId);
    const selectedTerm = terms.find(t => t.id === scheduleFormData.termId);
    
    if (!selectedCourse || !selectedTerm) return;

    const scheduleData = {
      ...scheduleFormData,
      course: selectedCourse,
      term: selectedTerm
    };

    if (editingSchedule) {
      onUpdateSchedule(editingSchedule.id, scheduleData);
    } else {
      onAddSchedule(scheduleData);
    }
    resetScheduleForm();
  };

  const resetTermForm = () => {
    setTermFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      isActive: true
    });
    setEditingTerm(null);
    setShowTermForm(false);
  };

  const resetScheduleForm = () => {
    setScheduleFormData({
      courseId: '',
      termId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      startDate: '',
      endDate: '',
      maxParticipants: 10,
      location: '',
      isActive: true
    });
    setEditingSchedule(null);
    setShowScheduleForm(false);
  };

  const handleEditTerm = (term: Term) => {
    setTermFormData({
      name: term.name,
      startDate: term.startDate,
      endDate: term.endDate,
      description: term.description || '',
      isActive: term.isActive
    });
    setEditingTerm(term);
    setShowTermForm(true);
  };

  const handleEditSchedule = (schedule: RecurringSchedule) => {
    setScheduleFormData({
      courseId: schedule.courseId,
      termId: schedule.termId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      maxParticipants: schedule.maxParticipants,
      location: schedule.location,
      isActive: schedule.isActive
    });
    setEditingSchedule(schedule);
    setShowScheduleForm(true);
  };

  const filteredTerms = terms.filter(term =>
    term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSchedules = recurringSchedules.filter(schedule =>
    schedule.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catalog Management</h2>
          <p className="text-gray-600">Manage terms, schedules, and course catalogs</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'terms'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Terms & Periods
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recurring Schedules
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={() => activeTab === 'terms' ? setShowTermForm(true) : setShowScheduleForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add {activeTab === 'terms' ? 'Term' : 'Schedule'}</span>
        </button>
      </div>

      {/* Terms Tab */}
      {activeTab === 'terms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTerms.map((term) => (
              <div key={term.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{term.name}</h3>
                  <button
                    onClick={() => onUpdateTerm(term.id, { isActive: !term.isActive })}
                    className={`p-1 rounded ${term.isActive ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {term.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}</span>
                  </div>
                  {term.description && (
                    <p className="text-sm text-gray-600">{term.description}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTerm(term)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteTerm(term.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{schedule.course.title}</div>
                        <div className="text-sm text-gray-500">{schedule.course.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.term.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dayNames[schedule.dayOfWeek]}</div>
                        <div className="text-sm text-gray-500">{schedule.startTime} - {schedule.endTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.maxParticipants}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteSchedule(schedule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Term Form Modal */}
      {showTermForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingTerm ? 'Edit Term' : 'Add New Term'}
              </h3>
              
              <form onSubmit={handleTermSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term Name</label>
                  <input
                    type="text"
                    value={termFormData.name}
                    onChange={(e) => setTermFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={termFormData.startDate}
                      onChange={(e) => setTermFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={termFormData.endDate}
                      onChange={(e) => setTermFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={termFormData.description}
                    onChange={(e) => setTermFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={termFormData.isActive}
                      onChange={(e) => setTermFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetTermForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingTerm ? 'Update' : 'Create'} Term
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h3>
              
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <select
                      value={scheduleFormData.courseId}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, courseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                    <select
                      value={scheduleFormData.termId}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, termId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Term</option>
                      {terms.filter(t => t.isActive).map(term => (
                        <option key={term.id} value={term.id}>{term.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                  <select
                    value={scheduleFormData.dayOfWeek}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dayNames.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={scheduleFormData.startTime}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={scheduleFormData.endTime}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={scheduleFormData.startDate}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={scheduleFormData.endDate}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                    <input
                      type="number"
                      min="1"
                      value={scheduleFormData.maxParticipants}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={scheduleFormData.location}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={scheduleFormData.isActive}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetScheduleForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingSchedule ? 'Update' : 'Create'} Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Send, Users, FileText, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import { Booking, Course, BulkOperation } from '../types';

interface BulkOperationsProps {
  bookings: Booking[];
  courses: Course[];
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({ bookings, courses }) => {
  const [selectedOperation, setSelectedOperation] = useState<'communication' | 'roster_update' | 'status_change'>('communication');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  
  const [communicationData, setCommunicationData] = useState({
    subject: '',
    message: '',
    type: 'email' as 'email' | 'sms'
  });

  const [rosterUpdateData, setRosterUpdateData] = useState({
    action: 'add' as 'add' | 'remove' | 'transfer',
    targetCourseId: '',
    notes: ''
  });

  const [statusChangeData, setStatusChangeData] = useState({
    newStatus: 'confirmed' as 'confirmed' | 'cancelled' | 'pending',
    reason: ''
  });

  const handleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAllBookings = () => {
    if (selectedBookings.length === bookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(b => b.id));
    }
  };

  const executeBulkOperation = () => {
    const newOperation: BulkOperation = {
      id: `bulk-${Date.now()}`,
      type: selectedOperation,
      targetType: selectedOperation === 'communication' ? 'booking' : 'booking',
      targetIds: selectedBookings,
      operation: selectedOperation === 'communication' ? communicationData :
                selectedOperation === 'roster_update' ? rosterUpdateData : statusChangeData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBulkOperations(prev => [...prev, newOperation]);

    // Simulate operation execution
    setTimeout(() => {
      setBulkOperations(prev => 
        prev.map(op => 
          op.id === newOperation.id 
            ? { ...op, status: 'in_progress' as const }
            : op
        )
      );
      
      setTimeout(() => {
        setBulkOperations(prev => 
          prev.map(op => 
            op.id === newOperation.id 
              ? { 
                  ...op, 
                  status: 'completed' as const, 
                  completedAt: new Date().toISOString(),
                  results: { processed: selectedBookings.length, successful: selectedBookings.length, failed: 0 }
                }
              : op
          )
        );
      }, 2000);
    }, 1000);

    // Reset selections
    setSelectedBookings([]);
    setCommunicationData({ subject: '', message: '', type: 'email' });
    setRosterUpdateData({ action: 'add', targetCourseId: '', notes: '' });
    setStatusChangeData({ newStatus: 'confirmed', reason: '' });
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'communication': return <Send className="h-5 w-5" />;
      case 'roster_update': return <Users className="h-5 w-5" />;
      case 'status_change': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
        <p className="text-gray-600">Perform operations on multiple bookings or courses at once</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Operation Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operation Type */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Operation</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedOperation('communication')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOperation === 'communication'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Send className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Communication</div>
                <div className="text-xs text-gray-500">Send emails/SMS</div>
              </button>
              
              <button
                onClick={() => setSelectedOperation('roster_update')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOperation === 'roster_update'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium">Roster Update</div>
                <div className="text-xs text-gray-500">Manage enrollments</div>
              </button>
              
              <button
                onClick={() => setSelectedOperation('status_change')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOperation === 'status_change'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">Status Change</div>
                <div className="text-xs text-gray-500">Update booking status</div>
              </button>
            </div>
          </div>

          {/* Target Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Targets</h3>
              <button
                onClick={handleSelectAllBookings}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedBookings.length === bookings.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {bookings.map((booking) => (
                <label key={booking.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={() => handleBookingSelection(booking.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">
                      {booking.service.name} - {new Date(booking.date).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              {selectedBookings.length} of {bookings.length} bookings selected
            </div>
          </div>

          {/* Operation Configuration */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Operation</h3>
            
            {selectedOperation === 'communication' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Communication Type</label>
                  <select
                    value={communicationData.type}
                    onChange={(e) => setCommunicationData(prev => ({ ...prev, type: e.target.value as 'email' | 'sms' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={communicationData.subject}
                    onChange={(e) => setCommunicationData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter subject line"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={communicationData.message}
                    onChange={(e) => setCommunicationData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Enter your message"
                  />
                </div>
              </div>
            )}

            {selectedOperation === 'roster_update' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <select
                    value={rosterUpdateData.action}
                    onChange={(e) => setRosterUpdateData(prev => ({ ...prev, action: e.target.value as 'add' | 'remove' | 'transfer' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="add">Add to Course</option>
                    <option value="remove">Remove from Course</option>
                    <option value="transfer">Transfer to Another Course</option>
                  </select>
                </div>
                
                {(rosterUpdateData.action === 'add' || rosterUpdateData.action === 'transfer') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Course</label>
                    <select
                      value={rosterUpdateData.targetCourseId}
                      onChange={(e) => setRosterUpdateData(prev => ({ ...prev, targetCourseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={rosterUpdateData.notes}
                    onChange={(e) => setRosterUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Optional notes about this operation"
                  />
                </div>
              </div>
            )}

            {selectedOperation === 'status_change' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    value={statusChangeData.newStatus}
                    onChange={(e) => setStatusChangeData(prev => ({ ...prev, newStatus: e.target.value as 'confirmed' | 'cancelled' | 'pending' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={statusChangeData.reason}
                    onChange={(e) => setStatusChangeData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Reason for status change"
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={executeBulkOperation}
                disabled={selectedBookings.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {getOperationIcon(selectedOperation)}
                <span>Execute Operation ({selectedBookings.length} targets)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Operation History */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Operation History</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {bulkOperations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No operations performed yet</p>
              ) : (
                bulkOperations.map((operation) => (
                  <div key={operation.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getOperationIcon(operation.type)}
                        <span className="text-sm font-medium capitalize">
                          {operation.type.replace('_', ' ')}
                        </span>
                      </div>
                      {getStatusIcon(operation.status)}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Targets: {operation.targetIds.length}</div>
                      <div>Created: {new Date(operation.createdAt).toLocaleString()}</div>
                      {operation.completedAt && (
                        <div>Completed: {new Date(operation.completedAt).toLocaleString()}</div>
                      )}
                      {operation.results && (
                        <div className="text-green-600">
                          Success: {operation.results.successful}/{operation.results.processed}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
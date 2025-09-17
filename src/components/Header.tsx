import React from 'react';
import { Calendar, Menu, User, LogOut, Shield, Settings } from 'lucide-react';
import { User as UserType, Admin } from '../types';

interface HeaderProps {
  currentView: 'home' | 'booking' | 'course-detail' | 'admin';
  onViewChange: (view: 'home' | 'booking' | 'course-detail') => void;
  user: UserType | null;
  admin: Admin | null;
  onShowUserAuth: () => void;
  onShowAdminAuth: () => void;
  onLogoutUser: () => void;
  onLogoutAdmin: () => void;
  onShowCustomerPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onViewChange, 
  user, 
  admin, 
  onShowUserAuth, 
  onShowAdminAuth, 
  onLogoutUser, 
  onLogoutAdmin,
  onShowCustomerPortal
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BookEase</h1>
              <p className="text-xs text-gray-500">Professional Booking System</p>
            </div>
          </div>
          
          {/* Admin Interface Navigation */}
          {admin ? (
            <nav className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <Shield className="h-4 w-4" />
                <span>Admin: {admin.name}</span>
              </div>
              
              <button
                onClick={onLogoutAdmin}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Admin Logout</span>
              </button>
            </nav>
          ) : (
            /* Customer Interface Navigation */
            <nav className="flex items-center space-x-4">
              {/* User Authentication Status */}
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Welcome, {user.name}</span>
                </div>
              )}

            <button
              onClick={() => onViewChange('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'home' || currentView === 'course-detail'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onViewChange('booking')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'booking'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Book Now
            </button>

              {/* Authentication Buttons */}
              {!user && (
              <button
                onClick={onShowUserAuth}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}

              {/* Logout Button */}
              {user && (
              <button
                onClick={onLogoutUser}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            )}
            {/* Customer Portal Button */}
            {user && onShowCustomerPortal && (
              <button
                onClick={onShowCustomerPortal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>My Account</span>
              </button>
            )}


            {/* Admin Access Button */}
            <button
              onClick={onShowAdminAuth}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
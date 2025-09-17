import React from 'react';
import { Clock, DollarSign, ArrowRight, User, Users, Star, Lock, MapPin } from 'lucide-react';
import { Course, User as UserType } from '../types';

interface ServiceSelectionProps {
  courses: Course[];
  selectedCourse: Course | null;
  user: UserType | null;
  onCourseSelect: (course: Course) => void;
  onNext: () => void;
  onShowAuth: () => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  courses,
  selectedCourse,
  user,
  onCourseSelect,
  onNext,
  onShowAuth
}) => {
  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCourseSelect = (course: Course) => {
    if (!user) {
      onShowAuth();
      return;
    }
    onCourseSelect(course);
  };

  const handleNext = () => {
    if (!user) {
      onShowAuth();
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Course</h2>
        <p className="text-lg text-gray-600">
          {user ? 'Select the course you\'d like to book' : 'Sign in to book a course'}
        </p>
      </div>

      {!user && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Authentication Required</h3>
          </div>
          <p className="text-blue-800 text-center mb-4">
            Please sign in or create an account to book courses and manage your appointments.
          </p>
          <div className="text-center">
            <button
              onClick={onShowAuth}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedCourses).map(([category, categoryCourses]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryCourses.map((course) => (
                <div
                  key={course.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg relative ${
                    selectedCourse?.id === course.id && user
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${user ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                  onClick={() => handleCourseSelect(course)}
                >
                  {!user && (
                    <div className="absolute top-4 right-4">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{course.title}</h4>
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span>{course.price}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="truncate">{course.location}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Max {course.maxParticipants}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {course.category}
                      </div>
                    </div>
                  </div>
                  
                  {selectedCourse?.id === course.id && user && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm font-medium flex items-center">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Selected - Continue to date selection
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && user && (
        <div className="mt-8 text-center">
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center mx-auto space-x-2"
          >
            <span>Continue to Date Selection</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
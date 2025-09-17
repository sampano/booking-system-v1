import React from 'react';
import { ArrowLeft, Calendar, Clock, DollarSign, User, Users, MapPin, Star, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { Course, User as UserType } from '../types';

interface CourseDetailPageProps {
  course: Course;
  user: UserType | null;
  onBack: () => void;
  onBookCourse: (course: Course) => void;
  onShowAuth: () => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
  user,
  onBack,
  onBookCourse,
  onShowAuth
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleBookCourse = () => {
    if (!user) {
      onShowAuth();
      return;
    }
    onBookCourse(course);
  };

  const features = [
    'Expert instruction',
    'Small class sizes',
    'All materials included',
    'Certificate of completion',
    'Flexible scheduling',
    'Money-back guarantee'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Courses</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Image */}
          {course.imageUrl && (
            <div className="mb-8">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {course.category}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Instructor: <span className="font-medium">{course.instructor}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{course.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Max {course.maxParticipants} participants</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{course.location}</span>
              </div>
            </div>
          </div>

          {/* Course Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {course.description}
              </p>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {course.requirements && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800">{course.requirements}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructor Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Your Instructor</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{course.instructor}</h3>
                  <p className="text-gray-600">Professional {course.category} Instructor</p>
                </div>
              </div>
              <p className="text-gray-700">
                An experienced professional with years of expertise in {course.category.toLowerCase()}. 
                Dedicated to providing high-quality instruction and helping students achieve their goals.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <span className="text-3xl font-bold text-green-600">{course.price}</span>
                </div>
                <p className="text-gray-600">per session</p>
              </div>

              {!user && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm text-center">
                    Sign in to book this course
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleBookCourse}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>{user ? 'Book This Course' : 'Sign In to Book'}</span>
                </button>
                
                <button
                  onClick={onBack}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Browse Other Courses
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Course Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Students:</span>
                    <span className="font-medium">{course.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-medium capitalize">{course.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{course.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Why Choose This Course?</h4>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Expert-led instruction</li>
                <li>• Small class sizes for personalized attention</li>
                <li>• Flexible scheduling options</li>
                <li>• All materials provided</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
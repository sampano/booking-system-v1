import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  User,
  Users,
  Star,
  ArrowRight,
  Calendar,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Course, User as UserType } from "../types";

interface HomePageProps {
  courses: Course[];
  user: UserType | null;
  onCourseSelect: (course: Course) => void;
  onViewCourse: (course: Course) => void;
  onShowAuth: () => void;
  onStartBooking: () => void;
  /** NEW: called when parent taps "Consult" */
  onConsult: (course: Course) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  user,
  onCourseSelect,
  onViewCourse,
  onShowAuth,
  onStartBooking,
  onConsult,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(courses.map((course) => course.category)),
    ];
    return uniqueCategories.sort();
  }, [courses]);

  const locations = useMemo(() => {
    const uniqueLocations = [
      ...new Set(courses.map((course) => course.location)),
    ];
    return uniqueLocations.sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      const matchesLocation =
        selectedLocation === "all" || course.location === selectedLocation;

      return (
        course.isActive && matchesSearch && matchesCategory && matchesLocation
      );
    });
  }, [courses, searchTerm, selectedCategory, selectedLocation]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCourseSelect = (course: Course) => {
    if (!user) {
      onShowAuth();
      return;
    }
    onCourseSelect(course);
  };

  const handleConsult = (course: Course) => {
    if (!user) {
      onShowAuth();
      return;
    }
    onConsult(course);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Discover Amazing Courses
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Join our expert-led courses and workshops. From fitness to culinary
          arts, find the perfect class to enhance your skills and meet
          like-minded people.
        </p>

        {!user && (
          <div className="mb-8">
            <button
              onClick={onShowAuth}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Sign Up to Book Courses
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, instructors, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm ||
          selectedCategory !== "all" ||
          selectedLocation !== "all") && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Category: {selectedCategory}
              </span>
            )}
            {selectedLocation !== "all" && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                Location: {selectedLocation}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedLocation("all");
              }}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredCourses.length} of{" "}
          {courses.filter((c) => c.isActive).length} courses
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {course.imageUrl && (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex items-center text-green-600 font-semibold">
                  <DollarSign className="h-4 w-4" />
                  <span>{course.price}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
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
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Max {course.maxParticipants}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {course.category}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                    course.difficulty
                  )}`}
                >
                  {course.difficulty.charAt(0).toUpperCase() +
                    course.difficulty.slice(1)}
                </span>
              </div>

              {/* ACTIONS: View / Book Now / Consult */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onViewCourse(course)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => handleCourseSelect(course)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-sm font-medium"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{user ? "Book Now" : "Sign In"}</span>
                </button>

                <button
                  onClick={() => handleConsult(course)}
                  className="flex-1 bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center space-x-1 text-sm font-medium"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Consult</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all available courses.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedLocation("all");
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show All Courses
          </button>
        </div>
      )}

      {/* Call to Action */}
      {user && filteredCourses.length > 0 && (
        <div className="mt-12 text-center bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h3>
          <p className="text-gray-600 mb-6">
            Browse our courses and book your spot today. Join thousands of
            satisfied learners!
          </p>
          <button
            onClick={onStartBooking}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Booking Process
          </button>
        </div>
      )}
    </div>
  );
};

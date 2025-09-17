import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  MapPin,
} from "lucide-react";
import { Course } from "../types";
import { CourseForm } from "./CourseForm";

interface CourseManagementProps {
  courses: Course[];
  onAddCourse: (
    courseData: Omit<Course, "id" | "createdAt" | "updatedAt">
  ) => void;
  onUpdateCourse: (courseId: string, updates: Partial<Course>) => void;
  onDeleteCourse: (courseId: string) => void;
  onToggleStatus: (courseId: string) => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  courses,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onToggleStatus,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const categories = [...new Set(courses.map((course) => course.category))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && course.isActive) ||
      (statusFilter === "inactive" && !course.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSaveCourse = (
    courseData: Omit<Course, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingCourse) {
      onUpdateCourse(editingCourse.id, courseData);
    } else {
      onAddCourse(courseData);
    }
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      onDeleteCourse(courseId);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Management
          </h1>
          <p className="text-gray-600">
            Create and manage your courses and activities
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Courses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ToggleRight className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Filter className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">
                $
                {courses.length > 0
                  ? Math.round(
                      courses.reduce((sum, c) => sum + c.price, 0) /
                        courses.length
                    )
                  : 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {course.imageUrl && (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onToggleStatus(course.id)}
                    className={`p-1 rounded ${
                      course.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                    title={course.isActive ? "Active" : "Inactive"}
                  >
                    {course.isActive ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {course.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Instructor:</span>
                  <span className="font-medium">{course.instructor}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration} min
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{course.location}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <span className="mr-2">Max Participants:</span>
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.maxParticipants}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Price:</span>
                  <span className="flex items-center font-semibold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    {course.price}
                  </span>
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

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>

                <button
                  onClick={() => handleEditCourse(course)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {courses.length === 0
              ? "No courses created yet. Start by adding your first course!"
              : "No courses match your search criteria."}
          </p>
        </div>
      )}

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          course={editingCourse || undefined}
          onSave={handleSaveCourse}
          onCancel={() => {
            setShowForm(false);
            setEditingCourse(null);
          }}
        />
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Course Details
                </h2>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <Eye className="h-6 w-6" />
                </button>
              </div>

              {selectedCourse.imageUrl && (
                <div className="mb-6">
                  <img
                    src={selectedCourse.imageUrl}
                    alt={selectedCourse.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-gray-600">{selectedCourse.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Instructor</p>
                    <p className="text-gray-600">{selectedCourse.instructor}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{selectedCourse.location}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Category</p>
                    <p className="text-gray-600">{selectedCourse.category}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Duration</p>
                    <p className="text-gray-600">
                      {selectedCourse.duration} minutes
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Price</p>
                    <p className="text-gray-600">${selectedCourse.price}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Max Participants
                    </p>
                    <p className="text-gray-600">
                      {selectedCourse.maxParticipants}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Difficulty</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${getDifficultyColor(
                        selectedCourse.difficulty
                      )}`}
                    >
                      {selectedCourse.difficulty.charAt(0).toUpperCase() +
                        selectedCourse.difficulty.slice(1)}
                    </span>
                  </div>
                </div>

                {selectedCourse.requirements && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">
                      Requirements
                    </p>
                    <p className="text-gray-600">
                      {selectedCourse.requirements}
                    </p>
                  </div>
                )}

                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      selectedCourse.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedCourse.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditCourse(selectedCourse);
                    setSelectedCourse(null);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Course</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

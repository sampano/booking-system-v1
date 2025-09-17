import { useState } from 'react';
import { Course, CourseSchedule } from '../types';
import { courses as initialCourses } from '../data/courses';

export const useCourseStore = () => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);

  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCourses(prev => [...prev, newCourse]);
    return newCourse.id;
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, ...updates, updatedAt: new Date().toISOString() }
          : course
      )
    );
  };

  const deleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    // Also remove related schedules
    setSchedules(prev => prev.filter(schedule => schedule.courseId !== courseId));
  };

  const toggleCourseStatus = (courseId: string) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, isActive: !course.isActive, updatedAt: new Date().toISOString() }
          : course
      )
    );
  };

  const addSchedule = (scheduleData: Omit<CourseSchedule, 'id' | 'course'>) => {
    const course = courses.find(c => c.id === scheduleData.courseId);
    if (!course) return null;

    const newSchedule: CourseSchedule = {
      ...scheduleData,
      id: `schedule-${Date.now()}`,
      course,
      availableSpots: scheduleData.availableSpots || course.maxParticipants
    };
    
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule.id;
  };

  const updateSchedule = (scheduleId: string, updates: Partial<CourseSchedule>) => {
    setSchedules(prev => 
      prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, ...updates }
          : schedule
      )
    );
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
  };

  const enrollParticipant = (scheduleId: string, customerId: string) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.id === scheduleId && 
            schedule.availableSpots > 0 && 
            !schedule.enrolledParticipants.includes(customerId)) {
          return {
            ...schedule,
            enrolledParticipants: [...schedule.enrolledParticipants, customerId],
            availableSpots: schedule.availableSpots - 1
          };
        }
        return schedule;
      })
    );
  };

  return {
    courses,
    schedules,
    addCourse,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    enrollParticipant
  };
};
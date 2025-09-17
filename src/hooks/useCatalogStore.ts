import { useState } from 'react';
import { Term, RecurringSchedule, Course } from '../types';

export const useCatalogStore = () => {
  const [terms, setTerms] = useState<Term[]>([
    {
      id: 'term-1',
      name: 'Spring 2024',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      isActive: true,
      description: 'Spring semester courses',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'term-2',
      name: 'Summer 2024',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      isActive: true,
      description: 'Summer intensive courses',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>([]);

  const addTerm = (termData: Omit<Term, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTerm: Term = {
      ...termData,
      id: `term-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTerms(prev => [...prev, newTerm]);
    return newTerm.id;
  };

  const updateTerm = (termId: string, updates: Partial<Term>) => {
    setTerms(prev => 
      prev.map(term => 
        term.id === termId 
          ? { ...term, ...updates, updatedAt: new Date().toISOString() }
          : term
      )
    );
  };

  const deleteTerm = (termId: string) => {
    setTerms(prev => prev.filter(term => term.id !== termId));
    // Also remove related schedules
    setRecurringSchedules(prev => prev.filter(schedule => schedule.termId !== termId));
  };

  const addRecurringSchedule = (scheduleData: Omit<RecurringSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSchedule: RecurringSchedule = {
      ...scheduleData,
      id: `schedule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setRecurringSchedules(prev => [...prev, newSchedule]);
    return newSchedule.id;
  };

  const updateRecurringSchedule = (scheduleId: string, updates: Partial<RecurringSchedule>) => {
    setRecurringSchedules(prev => 
      prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, ...updates, updatedAt: new Date().toISOString() }
          : schedule
      )
    );
  };

  const deleteRecurringSchedule = (scheduleId: string) => {
    setRecurringSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
  };

  return {
    terms,
    recurringSchedules,
    addTerm,
    updateTerm,
    deleteTerm,
    addRecurringSchedule,
    updateRecurringSchedule,
    deleteRecurringSchedule
  };
};
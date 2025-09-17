export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const generateTimeSlots = (date: Date, serviceDuration: number) => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  const slotInterval = 30; // 30 minutes
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += slotInterval) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const endMinutes = minutes + serviceDuration;
      const endHour = hour + Math.floor(endMinutes / 60);
      const actualEndMinutes = endMinutes % 60;
      
      if (endHour <= 17) { // Don't go past 5 PM
        const endTime = `${endHour.toString().padStart(2, '0')}:${actualEndMinutes.toString().padStart(2, '0')}`;
        
        slots.push({
          id: `${date.toISOString().split('T')[0]}-${startTime}`,
          startTime,
          endTime,
          available: Math.random() > 0.3 // Simulate some slots being unavailable
        });
      }
    }
  }
  
  return slots;
};

export const isDateAvailable = (date: Date): boolean => {
  const today = new Date();
  const dayOfWeek = date.getDay();
  
  // Don't allow booking in the past
  if (date < today) return false;
  
  // Don't allow Sundays (0) for this demo
  if (dayOfWeek === 0) return false;
  
  return true;
};
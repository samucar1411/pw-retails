/**
 * Formats date and time strings into a standardized format
 */
export const formatDate = (dateStr: string | undefined, timeStr: string | undefined) => {
  if (!dateStr || !timeStr) {
    return {
      date: 'Fecha no disponible',
      time: '',
      fullDate: 'Fecha no disponible'
    };
  }
  
  try {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    const formattedTime = timeStr.substring(0, 5); // HH:MM format
    const formattedDate = date.toLocaleDateString('es-PY', options);
    
    return {
      date: formattedDate,
      time: formattedTime,
      fullDate: `${formattedDate}, ${formattedTime}hs`
    };
  } catch {
    // Fallback if date parsing fails
    return {
      date: dateStr,
      time: timeStr,
      fullDate: `${dateStr}, ${timeStr}`
    };
  }
};

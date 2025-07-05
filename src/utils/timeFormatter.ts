/**
 * Format time utility cho Galaxy Cinema System
 * Xử lý các format time khác nhau từ API và hiển thị đúng cách
 */

export const formatTime = (timeInput: string | Date | null | undefined): string => {
  if (!timeInput) {
    return '00:00';
  }

  try {
    console.log('🕐 [formatTime] Input:', timeInput, 'Type:', typeof timeInput);
    
    // Xử lý trường hợp timeInput là string
    if (typeof timeInput === 'string') {
      // Case 1: Time-only format (HH:MM hoặc HH:MM:SS)
      const timeOnlyMatch = timeInput.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (timeOnlyMatch) {
        console.log('✅ [formatTime] Detected time-only format:', timeInput);
        const hours = timeOnlyMatch[1].padStart(2, '0');
        const minutes = timeOnlyMatch[2].padStart(2, '0');
        const result = `${hours}:${minutes}`;
        console.log('✅ [formatTime] Result:', result);
        return result;
      }
      
      // Case 2: Full datetime format
      if (timeInput.includes('T') || timeInput.includes('-') || timeInput.includes('/')) {
        console.log('📅 [formatTime] Detected datetime format');
        const date = new Date(timeInput);
        if (!isNaN(date.getTime())) {
          const result = date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          console.log('✅ [formatTime] Datetime parsed result:', result);
          return result;
        }
      }
      
      // Case 3: Fallback for string - try direct parsing
      console.log('⚠️ [formatTime] Fallback string processing');
      return timeInput.substring(0, 5); // Take first 5 chars (HH:MM)
    }

    // Xử lý Date object
    if (timeInput instanceof Date) {
      console.log('📅 [formatTime] Processing Date object');
      const result = timeInput.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      console.log('✅ [formatTime] Date result:', result);
      return result;
    }

    // Final fallback
    console.log('❌ [formatTime] Unknown format, returning fallback');
    return '00:00';
    
  } catch (error) {
    console.error('❌ [formatTime] Error:', error, timeInput);
    return '00:00';
  }
};

export default formatTime; 
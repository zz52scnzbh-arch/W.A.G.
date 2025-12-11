const WEEKDAYS_DA = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

/**
 * Get Danish weekday name
 */
const getDanishWeekday = (date) => {
  return WEEKDAYS_DA[date.getDay()];
};

/**
 * Format date as YYYY-MM-DD
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Get start of day (00:00:00)
 */
const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get end of day (23:59:59)
 */
const getEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Check if date is in Danish school holiday periods (approximate)
 */
const isDanishHoliday = (date) => {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  // Summer holiday (approximately week 25-33, roughly July and early August)
  if (month === 7 || (month === 8 && day <= 15)) {
    return true;
  }
  
  // Christmas holiday (December 23 - January 2)
  if ((month === 12 && day >= 23) || (month === 1 && day <= 2)) {
    return true;
  }
  
  // Fall break (approximately week 42, mid-October)
  if (month === 10 && day >= 10 && day <= 20) {
    return true;
  }
  
  // Winter break (approximately week 7-8, mid-February)
  if (month === 2 && day >= 12 && day <= 22) {
    return true;
  }
  
  // Easter holiday (variable, roughly early April - simplified)
  if (month === 4 && day <= 15) {
    return true;
  }
  
  return false;
};

module.exports = {
  getDanishWeekday,
  formatDate,
  getStartOfDay,
  getEndOfDay,
  isDanishHoliday,
  WEEKDAYS_DA
};

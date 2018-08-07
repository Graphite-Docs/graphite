export function getMonthDayYear() {
  console.warn('getMonthDayYear called from helper...')
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const monthDayYear = month + "/" + day + "/" + year;
  console.warn('getMonthDayYear returning monthDayYear: ', monthDayYear)
  return monthDayYear
}

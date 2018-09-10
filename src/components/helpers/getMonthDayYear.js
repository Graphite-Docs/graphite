export function getMonthDayYear() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const monthDayYear = month + "/" + day + "/" + year;
  return monthDayYear
}

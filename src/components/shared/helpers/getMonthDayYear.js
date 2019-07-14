export function getMonthDayYear(params) {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    if(params) {

    } else {
        const monthDayYear = month + "/" + day + "/" + year;
        return monthDayYear;
    }
  }
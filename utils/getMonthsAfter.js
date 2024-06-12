export const getMonthsAfter = (startDateString, duration) => {
  const startDate = new Date(`${startDateString}`);
  const newDate = new Date(startDate.setMonth(startDate.getMonth() + duration));
  console.log(newDate);
  return newDate.toLocaleDateString();
};

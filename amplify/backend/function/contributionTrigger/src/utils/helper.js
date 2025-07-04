const helper = {
  calculateDifference(startDate, variant) {
    const start = new Date(startDate);
    const now = new Date();

    // Ensure time doesn't affect day/month comparison
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    if (variant === 'days') {
      // Days since start (including start day as 1)
      // return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
      return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    } else if (variant === 'weeks') {
      // Full weeks since start (start day counts as 1)
      const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      return Math.floor(daysPassed / 7) + 1;
    } else if (variant === 'months') {
      // Full months since start (start month counts as 1)
      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const startDay = start.getDate();

      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();

      let monthDiff =
        (currentYear - startYear) * 12 + (currentMonth - startMonth);

      // If current day >= start day, increment count
      if (currentDay >= startDay) {
        monthDiff++;
      }
      // Ensure minimum of 1 (start month counts as 1)
      return Math.max(1, monthDiff);
    } else {
      return 0;
    }
  },
};

module.exports = helper;

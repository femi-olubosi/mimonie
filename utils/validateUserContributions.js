export const validateUserContributions = (contributions, type) => {
  let activeCount = 0;

  for (const contribution of contributions) {
    if (['closed', 'completed', 'stopped'].includes(contribution.status)) {
      continue;
    }

    if (contribution.type === type) {
      activeCount++;
    }

    if (activeCount >= 2) {
      return true;
    }
  }

  return false;
};

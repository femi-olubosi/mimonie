export const getNextDate = (contribution, currentParticipant) => {
  const startDate = contribution?.start_date;
  const current_count = contribution?.current_count || 0;
  const variant = contribution?.variant;
  const start = new Date(startDate);
  const nextDate = new Date(start);
  const today = new Date();
  const lastSuccessfulRound = currentParticipant?.last_successful_round || 0;

  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);

  // Calculate the next due date
  switch (variant) {
    case 'days':
      nextDate.setDate(start.getDate() + lastSuccessfulRound);
      break;

    case 'weeks':
      nextDate.setDate(start.getDate() + lastSuccessfulRound * 7);
      break;

    case 'months':
      nextDate.setMonth(start.getMonth() + lastSuccessfulRound);
      if (nextDate.getDate() !== start.getDate()) {
        nextDate.setDate(0); // Handle month-end
      }
      break;
  }

  // Format the date
  const formattedDate = nextDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (
    contribution.type === 'group' &&
    currentParticipant?.status === 'in progress'
  ) {
    return `You are collecting today (${formattedDate})`;
  }

  if (
    currentParticipant?.status !== 'in progress' &&
    contribution.current_count === currentParticipant?.last_successful_round
  ) {
    return `Paid for this round`;
  }

  if (
    nextDate.getTime() === today.getTime() &&
    current_count > lastSuccessfulRound
  ) {
    return `${formattedDate} (Please fund your card)`;
  }

  // Case 2: Due date has passed and payment failed
  if (
    nextDate.getTime() < today.getTime() &&
    current_count > lastSuccessfulRound
  ) {
    return `Overdue: ${formattedDate} (Please fund your card)`;
  }

  return formattedDate;
};

export const getCollectionDate = (
  startDate,
  participantIndex,
  variant,
  num_of_month,
  type
) => {
  const start = new Date(startDate);
  const collectionDate = new Date(start);

  // Reset time to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  collectionDate.setHours(0, 0, 0, 0);

  if (type === 'personal') {
    // Personal savings - fixed duration
    switch (variant) {
      case 'days':
        collectionDate.setDate(start.getDate() + num_of_month);
        break;

      case 'weeks':
        collectionDate.setDate(start.getDate() + num_of_month * 7);
        break;

      case 'months':
        collectionDate.setMonth(start.getMonth() + num_of_month);
        // Handle month-end dates (e.g., Jan 31 → Feb 28)
        if (collectionDate.getDate() !== start.getDate()) {
          collectionDate.setDate(0); // Last day of previous month
        }
        break;

      default:
        return 'Invalid period';
    }
  } else {
    // Group savings - rotated collection
    switch (variant) {
      case 'days':
        collectionDate.setDate(start.getDate() + participantIndex);
        break;

      case 'weeks':
        // Find next occurrence of start's weekday (e.g., if start was Wednesday)
        const startDayOfWeek = start.getDay();
        collectionDate.setDate(
          start.getDate() +
            ((startDayOfWeek - collectionDate.getDay() + 7) % 7) + // Align to same weekday
            (participantIndex - 1) * 7
        ); // Add weeks based on index
        break;

      case 'months':
        collectionDate.setMonth(start.getMonth() + participantIndex - 1);
        // Use same date or last day if doesn't exist
        if (collectionDate.getDate() !== start.getDate()) {
          collectionDate.setDate(0);
        }
        break;

      default:
        return 'Invalid period';
    }
  }

  return collectionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

import { StyleSheet, Text, View } from 'react-native';

const NextContributionDay = ({ contribution, parsed, userProfile }) => {
  const getNextContributionDay = () => {
    if (contribution?.status === 'open') {
      return 'Not running';
    }

    if (['completed', 'closed'].includes(contribution?.status)) {
      return 'Completed';
    }

    if (
      contribution?.type === 'group' &&
      contribution?.current_count !== 0 &&
      contribution?.current_count >= parsed.length
    ) {
      return '-';
    }

    const today = new Date();
    let nextContributionDay;

    // Dynamic function to get the next target day of the week
    const getNextTargetDay = (date, targetDay) => {
      const dayOfWeek = date.getDay();
      const daysUntilNextDay = (targetDay - dayOfWeek + 7) % 7 || 7;
      const nextTargetDay = new Date(date);
      nextTargetDay.setDate(date.getDate() + daysUntilNextDay);
      return nextTargetDay;
    };

    // Dynamic target day based on contribution_id
    const getTargetDayOfWeek = () => {
      return contribution?.id === 'eacd86aa-2c49-4d4e-a9b8-38036505b0ac'
        ? 3
        : 1; // 3 = Wednesday, 1 = Monday
    };

    // Check if the participant is collecting this period
    const isReceivingDay = (participant) => {
      return (
        participant?.status === 'in progress' &&
        contribution?.variant === 'days'
      );
    };

    const isReceivingWeek = (participant) => {
      return (
        participant?.status === 'in progress' &&
        contribution?.variant === 'weeks'
      );
    };

    const isReceivingMonth = (participant) => {
      return (
        participant?.status === 'in progress' &&
        contribution?.variant === 'months'
      );
    };

    const currentParticipant = parsed?.find(
      (participant) => participant.userId === userProfile.userId
    );

    // Handling contribution types based on variant (days, weeks, months)
    if (currentParticipant?.status === 'in progress') {
      switch (contribution?.variant) {
        case 'days':
          nextContributionDay = new Date(today);
          nextContributionDay.setDate(today.getDate() + 2);
          if (isReceivingDay(currentParticipant)) {
            nextContributionDay.setDate(nextContributionDay.getDate() + 1); // Skip receiving day
          }
          break;

        case 'weeks':
          nextContributionDay = getNextTargetDay(today, getTargetDayOfWeek()); // Use dynamic day
          if (isReceivingWeek(currentParticipant)) {
            nextContributionDay.setDate(nextContributionDay.getDate() + 7); // Skip receiving week
          }
          break;

        case 'months':
          nextContributionDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            28
          );
          if (today.getDate() > 28) {
            nextContributionDay.setMonth(today.getMonth() + 1);
          }
          if (isReceivingMonth(currentParticipant)) {
            nextContributionDay.setMonth(nextContributionDay.getMonth() + 1); // Skip receiving month
          }
          break;

        default:
          nextContributionDay = 'Invalid contribution period';
      }

      return typeof nextContributionDay === 'string'
        ? nextContributionDay
        : nextContributionDay.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
          });
    }

    // Default case for next contribution when not "in progress"
    switch (contribution?.variant) {
      case 'days':
        nextContributionDay = new Date(today);
        nextContributionDay.setDate(today.getDate() + 1);
        break;

      case 'weeks':
        nextContributionDay = getNextTargetDay(today, getTargetDayOfWeek()); // Use dynamic day
        break;

      case 'months':
        nextContributionDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          28
        );
        if (today.getDate() > 28) {
          nextContributionDay.setMonth(today.getMonth() + 1);
        }
        break;

      default:
        nextContributionDay = 'Invalid contribution period';
    }

    return typeof nextContributionDay === 'string'
      ? nextContributionDay
      : nextContributionDay.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
        });
  };

  return (
    <View style={styles.detailContainer}>
      <Text style={styles.label}>Next Contribution Day</Text>
      <Text style={styles.value}>{getNextContributionDay()}</Text>
    </View>
  );
};

export default NextContributionDay;

const styles = StyleSheet.create({
  detailContainer: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'ir',
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'isb',
  },
});

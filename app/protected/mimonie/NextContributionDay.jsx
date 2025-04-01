import { StyleSheet, Text, View } from 'react-native';
import { getNextDate } from '@/utils/savings_contribution_helper';

const NextContributionDay = ({ contribution, parsed, userProfile }) => {
  const currentParticipant = parsed?.find(
    (participant) => participant.user_id === userProfile?.user_id
  );

  const getNextContributionDay = () => {
    if (['closed', 'completed'].includes(contribution.status)) {
      return 'Completed';
    }

    if (contribution?.status === 'open') {
      return 'Not running';
    }
    return getNextDate(contribution, currentParticipant);
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

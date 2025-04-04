import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { getNextDate } from '@/utils/savings_contribution_helper';
import { endStatus } from '@/data/contributionStatuses';

const NextContributionDay = ({ contribution, currentParticipant }) => {
  const current_count = contribution?.current_count || 0;
  const lastSuccessfulRound = currentParticipant?.last_successful_round || 0;
  const updateMe =
    currentParticipant?.status !== 'in progress' &&
    current_count > lastSuccessfulRound;

  const getNextContributionDay = () => {
    if (endStatus.includes(contribution?.status)) {
      return contribution?.status;
    }

    if (contribution?.status === 'open') {
      return 'Not running';
    }
    return getNextDate(contribution, currentParticipant);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Text
        style={[
          styles.text,
          {
            fontSize: 10,
            fontFamily: 'ir',
            color: updateMe ? '#FF7F7F' : 'white',
          },
        ]}
      >
        Due Date: {getNextContributionDay() || '-'}
      </Text>
    </View>
  );
};

export default NextContributionDay;

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: 'white',
  },
});

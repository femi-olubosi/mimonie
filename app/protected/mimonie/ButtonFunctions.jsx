import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import CopyLink from '../../../components/CopyLink';
import { Colors } from '../../../constants/Colors';

const Button = ({ title, onPress, disabled }) => {
  return (
    <Pressable style={styles.fab} onPress={onPress} disabled={disabled}>
      <Text style={styles.fabText}>{title}</Text>
    </Pressable>
  );
};

const ButtonFunctions = ({
  contribution,
  parsed,
  handlePaystackStartTransaction,
  userProfile,
  handleStartContribution,
  setVisible,
  setWithdrawModal,
  isLoading,
  setConfirmJoinModal,
}) => {
  const isParticipant = parsed?.some(
    (participant) => participant.userId === userProfile.userId
  );

  const isOwner = contribution?.owner === userProfile?.name;
  const isPersonal = contribution?.type === 'personal';
  const isGroup = contribution?.type === 'group';
  const isOpen = contribution?.status === 'open';
  const isRunning = contribution?.status === 'running';
  const isCompleted = contribution?.status === 'completed';
  const isClosed = contribution?.status === 'closed';
  const invisible = !['running', 'closed', 'completed'].includes(
    contribution?.status
  );

  // const shouldShowPayButton =
  //   isParticipant &&
  //   parsed?.some(
  //     (participant) =>
  //       participant.userId === userProfile.userId &&
  //       participant.status !== 'in progress' &&
  //       participant?.last_successful_round < contribution?.current_count
  //   );

  const shouldShowStartButton =
    ((parsed?.length === contribution?.num_of_month && isOwner) ||
      isPersonal) &&
    invisible;

  const shouldShowInviteButton = isOpen && isOwner && isGroup;

  const shouldShowJoinButton = !isParticipant && isOpen && isGroup;

  const shouldShowWithdrawButton =
    isPersonal && !isClosed && contribution?.currently_at > 0;

  const shouldShowCopyLink = isGroup && !isCompleted;

  return (
    <View
      style={{
        flexDirection: 'row',
        columnGap: 20,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 10,
      }}
    >
      {/* {shouldShowPayButton && (
        <Pressable style={styles.fab} onPress={handlePaystackStartTransaction}>
          <Text style={{ color: 'white' }}>Pay Via Transfer</Text>
        </Pressable>
      )} */}

      {shouldShowStartButton && (
        <Button
          title={isLoading ? 'Starting...' : 'Start'}
          onPress={handleStartContribution}
          disabled={isLoading}
        />
      )}

      {shouldShowInviteButton && (
        <Button title="Invite" onPress={() => setVisible(true)} />
      )}

      {shouldShowJoinButton && (
        <Button
          title={isLoading ? 'Joining...' : 'Join'}
          onPress={() => setConfirmJoinModal(true)}
          disabled={isLoading}
        />
      )}

      {shouldShowWithdrawButton && (
        <Button
          title="Withdraw"
          onPress={() => setWithdrawModal(true)}
          disabled={isLoading}
        />
      )}

      {shouldShowCopyLink && <CopyLink inviteLink={contribution.id} />}
    </View>
  );
};

export default ButtonFunctions;

const styles = StyleSheet.create({
  fab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.pri,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  fabText: {
    color: 'white',
    fontFamily: 'im',
  },
});

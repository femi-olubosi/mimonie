import {
  ActivityIndicator,
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

const Button = ({ title, onPress, disabled, styleOverride }) => {
  return (
    <Pressable
      style={[styles.fab, { ...styleOverride }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.fabText}>{title}</Text>
    </Pressable>
  );
};

const ButtonFunctions = ({
  contribution,
  parsed,
  userProfile,
  handleStartContribution,
  setVisible,
  setWithdrawModal,
  isLoading,
  setConfirmJoinModal,
  setStopSavingsModal,
  checkingExisting,
  isExisting,
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
  const isStopped = contribution?.status === 'stopped';
  const isClosed = contribution?.status === 'closed';
  const invisible = !['running', 'closed', 'completed', 'stopped'].includes(
    contribution?.status
  );

  const shouldShowStartButton =
    ((parsed?.length === contribution?.num_of_month && isOwner) ||
      isPersonal) &&
    invisible;

  const shouldShowInviteButton = isGroup && isOpen && isOwner;

  const shouldShowJoinButton = isGroup && isOpen && !isParticipant;

  const shouldShowWithdrawButton =
    isPersonal && !isClosed && !isExisting && (isCompleted || isStopped);

  const shouldShowCopyLink = isGroup && !isCompleted;

  const shouldShowStopSavings = isPersonal && isRunning;

  if (checkingExisting) {
    return (
      <View style={{ marginBottom: 10 }}>
        <ActivityIndicator color={Colors.pri} size={'large'} />
      </View>
    );
  }

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
      {isExisting && (
        <Button
          title="Request Processing"
          styleOverride={{ backgroundColor: 'black' }}
        />
      )}

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

      {shouldShowStopSavings && (
        <Button
          title="Stop Savings"
          onPress={() => setStopSavingsModal(true)}
          disabled={isLoading}
          styleOverride={{
            backgroundColor: 'red',
          }}
        />
      )}

      {shouldShowWithdrawButton && (
        <Button
          title="Request Withdrawal"
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

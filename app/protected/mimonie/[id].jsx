import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { PageView } from '@/components/Reusable';
import { useGlobalContext } from '../../../store/StoreContext';
import {
  findContributionByID,
  joinContribution,
} from '@/api/contributions.service';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { statusCheck } from '@/utils/statusCheck';
import { naira } from '@/constants/Currency';
import { Colors } from '@/constants/Colors';
import ContactModal from '@/components/ContactModal';
import { updateInvite } from '@/api/invite.service';
import { safeParseJSON } from '@/utils/safeJSON';
import { fetchUserProfile } from '@/api/user.service';
import Hide from '@/components/Hide';
import { processFirstSavings } from '../../../api/payment.service';
import { updateContribution } from '../../../api/contributions.service';
import ModalWrapper from '../../../components/modals/ModalWrapper';
import Drag from './Drag';
import NextContributionDay from './NextContributionDay';
import ParticipantList from './ParticipantList';
import SkeletonLoaderComp from './SkeletonLoader';
import ButtonFunctions from './ButtonFunctions';
import Balance from './Balance';
import { validateUserContributions } from '../../../utils/validateUserContributions';
import ConfirmJoinModal from './ConfirmJoinModal';
import { isLastDaysOfMonth } from '../../../utils/helper';
import StartSavingsModal from './StartSavingsModal';
import StopSavingsModal from './StopSavingsModal';
import WithdrawalModal from './WithdrawalModal';
import { earlyWithdrawalCharge } from '../../../constants/charges';
import { get } from 'aws-amplify/api';
import { isEarly } from '../../../utils/isEarlyWithdrawal';

const ContributionDetails = () => {
  const {
    setContributions,
    contributions,
    currentUser,
    userProfile,
    setIsLoading,
    setInviteArray,
    hideValues,
    isLoading,
    parsed: connected,
  } = useGlobalContext();
  const { id } = useLocalSearchParams();
  const [visible, setVisible] = useState(false);
  const [contribution, setContribution] = useState({});
  const [parsed, setParsed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState({});
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [openParticipantEditModal, setOpenParticipantEditModal] =
    useState(false);
  const [confirmJoinModal, setConfirmJoinModal] = useState(false);
  const [confirmStartModal, setConfirmStartModal] = useState(false);
  const [processingCharge, setProcessingCharge] = useState(false);
  const [stopSavingsModal, setStopSavingsModal] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  useEffect(() => {
    const fetchContribution = async () => {
      try {
        setLoading(true); // Start loading

        const contribution = await findContributionByID(id, setContribution);
        if (contribution) {
          setContribution(contribution); // Update state with the fetched contribution
        } else {
          console.error('Contribution not found.');
        }
      } catch (error) {
        console.error('Error fetching contribution:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    if (id) {
      fetchContribution();
    }
  }, [id]);

  useEffect(() => {
    if (contribution) {
      const parsedData = safeParseJSON(contribution?.participant, []);
      setParsed(parsedData);
    }
  }, [contribution]);

  useEffect(() => {
    fetchUserProfile(setOwnerProfile, {
      userId: contribution?.participant_ids?.[0],
    });
  }, [contribution]);

  useEffect(() => {
    const checkExistingRequest = async () => {
      setCheckingExisting(true);
      try {
        const restOperation = get({
          apiName: 'userInfo',
          path: `/request-withdrawal/${id}`,
        });

        const response = await restOperation.response;
        const existing = await response.body.json();

        setIsExisting(existing?.request?.length > 0);
      } catch (error) {
        console.log('error', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    if (
      contribution?.type === 'personal' &&
      ['stopped', 'completed'].includes(contribution?.status)
    ) {
      checkExistingRequest();
    }
  }, [id, contribution]);

  const handleJoinContribution = async () => {
    setConfirmJoinModal(false);
    if (validateUserContributions(contributions, 'group')) {
      Alert.alert(
        'Error',
        'You can only be in one active group contribution at a time.'
      );
      return;
    }

    if (!userProfile.is_bvn_verified) {
      Alert.alert('Please verify your bvn');
      return;
    }

    if (!userProfile.is_nin_verified) {
      Alert.alert('Please verify your identity');
      return;
    }

    if (!userProfile.auth_url) {
      Alert.alert(
        'Sorry!!',
        'You cannot create/join contribution at the moment. Add a card to continue'
      );
      return;
    }

    if (userProfile?.income_from < contribution?.amount) {
      Alert.alert(
        'Sorry!!',
        'Your income is too low to join this contribution'
      );
      return;
    }

    if (
      connected.find(
        (e) =>
          e.senderId !== ownerProfile.userId ||
          e.receiverId !== ownerProfile.userId
      )
    ) {
      Alert.alert('Error joining', 'You are not connected to this user');
      return;
    }

    if (
      parsed.some((participant) => participant.userId === currentUser.userId)
    ) {
      Alert.alert('Error', 'You are already a member of this contribution');
      return;
    }

    try {
      setIsLoading(true);
      await joinContribution(
        contribution.id,
        currentUser,
        userProfile,
        setContributions
      );
      setInviteArray((prev) => prev.filter((e) => e.id !== contribution.id));
      await updateInvite(userProfile.userId, contribution.id);
      setIsLoading(false);
      Alert.alert(
        'Success',
        'You have successfully joined the contribution',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartContribution = async () => {
    setIsLoading(true);
    try {
      const date = new Date();
      const start_date = date.toLocaleDateString('en-CA');

      const res = await updateContribution(contribution?.id, {
        start_date: start_date,
        status: 'running',
      });
      await findContributionByID(id, setContribution);
      Alert.alert(
        'Contribution Started Successfully',
        `${res.name} contribution started successfully`
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSavingContribution = async () => {
    setProcessingCharge(true);

    const participant = parsed.find(
      (participant) => participant.userId === currentUser.userId
    );
    const date = new Date();
    const start_date = date.toLocaleDateString('en-CA');

    try {
      const response = await processFirstSavings(
        participant,
        contribution,
        userProfile,
        start_date
      );

      if (!response.success) {
        Alert.alert('We could not start you savings', response.message);
        return;
      }
      await findContributionByID(id, setContribution);
      setConfirmStartModal(false);
      Alert.alert(
        'Savings Started Successfully',
        `Your savings to ${contribution?.name} has been started successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error processing charge:', error);
      Alert.alert('Error', 'An error occurred while processing the charge');
    } finally {
      setProcessingCharge(false);
    }
  };

  const triggerStartButton = () => {
    if (!contribution) return;

    if (contribution?.variant === 'months' && isLastDaysOfMonth(new Date())) {
      Alert.alert(
        'Monthly Contribution Restriction',
        'Monthly contributions can only be started between the 1st and 28th of the month.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (contribution?.type === 'group') {
      Alert.alert(
        'Start Group Contribution?',
        'This will begin the contribution cycle for all members.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start', onPress: handleStartContribution },
        ]
      );
    } else {
      setConfirmStartModal(true);
    }
  };

  const startDate = new Date(contribution?.start_date);

  const isEarlyWithdrawal = isEarly(
    contribution?.currently_at,
    contribution?.num_of_month,
    contribution?.variant
  );

  const handleWithdrawFund = async () => {
    setWithdrawModal(false);
    router.push({
      pathname: '/protected/transfer_screen',
      params: {
        contribution: JSON.stringify(contribution),
        isEarly: isEarlyWithdrawal,
        participant: JSON.stringify(parsed[0]),
      },
    });
  };

  const handleStopSavings = async () => {
    setStopSavingsModal(false);
    setIsLoading(true);
    try {
      const savings = await updateContribution(contribution?.id, {
        status: 'stopped',
      });
      await findContributionByID(id, setContribution);
      Alert.alert(
        'Savings Stopped Successfully',
        `Your savings to ${savings?.name} have been stopped successfully.`
      );
    } catch (error) {
      console.error('Error stopping savings:', error);
      Alert.alert('Error', 'An error occurred while stopping the savings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageView title={'Contribution Details'} route={'protected/mimonie'}>
      <View style={styles.container}>
        {loading ? (
          <SkeletonLoaderComp />
        ) : (
          <>
            <ButtonFunctions
              setConfirmJoinModal={setConfirmJoinModal}
              handleStartContribution={triggerStartButton}
              setVisible={setVisible}
              setWithdrawModal={setWithdrawModal}
              contribution={contribution}
              parsed={parsed}
              userProfile={userProfile}
              isLoading={isLoading}
              setStopSavingsModal={setStopSavingsModal}
              checkingExisting={checkingExisting}
              isExisting={isExisting}
            />

            <Balance parsed={parsed} amount={contribution?.amount} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={async () => {
                    setRefreshing(true);
                    await findContributionByID(id, setContribution);
                    setRefreshing(false);
                  }}
                  tintColor={Colors.pri}
                  colors={[Colors.pri]}
                />
              }
            >
              <View style={styles.detailContainer}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{contribution?.name}</Text>
              </View>

              <View style={styles.detailContainer}>
                <Text style={styles.label}>Date Started</Text>
                <Text style={styles.value}>
                  {contribution?.start_date
                    ? startDate.toLocaleDateString()
                    : 'Not running'}
                </Text>
              </View>

              <View style={styles.detailContainer}>
                <Text style={styles.label}>Status</Text>
                <View
                  style={{
                    backgroundColor: statusCheck(contribution?.status),
                    alignSelf: 'flex-start',
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 4,
                  }}
                >
                  <Text style={[styles.value, { color: 'white' }]}>
                    {capitalizeFirstLetter(contribution?.status)}
                  </Text>
                </View>
              </View>
              {contribution?.type === 'group' && (
                <ParticipantList
                  parsed={parsed}
                  contribution={contribution}
                  setOpenParticipantEditModal={setOpenParticipantEditModal}
                  imageUrls={imageUrls}
                  setImageUrls={setImageUrls}
                  userProfile={userProfile}
                />
              )}
              <View style={styles.detailContainer}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.value}>
                  {naira}
                  {hideValues ? (
                    <Hide color={'black'} />
                  ) : (
                    new Intl.NumberFormat('en-US').format(contribution?.amount)
                  )}
                </Text>
              </View>
              <View style={styles.detailContainer}>
                <Text style={styles.label}>Target</Text>
                <Text style={styles.value}>
                  {naira}
                  {hideValues ? (
                    <Hide color={'black'} />
                  ) : (
                    new Intl.NumberFormat('en-US').format(contribution?.target)
                  )}
                </Text>
              </View>

              {contribution?.type === 'group' && (
                <>
                  <View style={styles.detailContainer}>
                    <Text style={styles.label}>Number of Contributors</Text>
                    <Text style={styles.value}>
                      {parsed.length === contribution.num_of_month
                        ? `${parsed.length} (Completed)`
                        : `${parsed.length} contributor(s) joined out of ${contribution.num_of_month} expected contributors`}
                    </Text>
                  </View>
                </>
              )}
              <NextContributionDay
                contribution={contribution}
                parsed={parsed}
                userProfile={userProfile}
              />
              {contribution?.type === 'group' && (
                <>
                  <View style={styles.detailContainer}>
                    <Text style={styles.label}>Owner</Text>
                    <Text style={styles.value}>{contribution?.owner}</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </>
        )}
      </View>
      <ContactModal
        visible={visible}
        setVisible={setVisible}
        invite_link={contribution?.id}
        participants={contribution?.participant_ids}
      />
      <ModalWrapper
        visible={openParticipantEditModal}
        onClose={() => setOpenParticipantEditModal(false)}
      >
        <Drag
          parsed={parsed}
          setParsed={setParsed}
          imageUrls={imageUrls}
          contribution={contribution}
          onFinished={() => setOpenParticipantEditModal(false)}
        />
      </ModalWrapper>
      <ConfirmJoinModal
        visible={confirmJoinModal}
        onClose={() => setConfirmJoinModal(false)}
        onConfirm={handleJoinContribution}
      />
      <StartSavingsModal
        visible={confirmStartModal}
        onClose={() => setConfirmStartModal(false)}
        onConfirm={handleStartSavingContribution}
        processingCharge={processingCharge}
      />
      <StopSavingsModal
        visible={stopSavingsModal}
        onClose={() => setStopSavingsModal(false)}
        onConfirm={handleStopSavings}
        contribution={contribution}
        breakFeePercentage={earlyWithdrawalCharge}
        isLoading={isLoading}
      />
      <WithdrawalModal
        visible={withdrawModal}
        onClose={() => setWithdrawModal(false)}
        onConfirm={handleWithdrawFund}
        isEarlyWithdrawal={isEarlyWithdrawal}
        balance={parsed[0]?.balance}
      />
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
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
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'ir',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default ContributionDetails;

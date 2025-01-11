import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  Button,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { PageView, SkeletonLoader } from '@/components/Reusable';
import { useGlobalContext } from '../../../store/StoreContext';
import {
  findContributionByID,
  joinContribution,
  updateContribution,
  updateContributionForUser,
  fetchUserContributions,
} from '@/api/contributions.service';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { statusCheck } from '@/utils/statusCheck';
import { naira } from '@/constants/Currency';
import { Colors } from '@/constants/Colors';
import ContactModal from '@/components/ContactModal';
import { updateInvite } from '@/api/invite.service';
import { safeParseJSON } from '@/utils/safeJSON';
import CopyLink from '@/components/CopyLink';
import { fetchUserProfile } from '@/api/user.service';
import Hide from '@/components/Hide';
import { verifyTransfer, withdrawFunds } from '../../../api/payment.service';
import { Paystack } from '@/paystackDev';
import { updatePersonalContribution } from '../../../api/contributions.service';
import ModalWrapper from '../../../components/modals/ModalWrapper';
import Drag from './Drag';
import NextContributionDay from './NextContributionDay';
import ParticipantList from './ParticipantList';
import { fetchUserConnections } from '../../../api/network.service';

const ContributionDetails = () => {
  const {
    setContributions,
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
  const paystackWebViewRef = useRef();
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [openParticipantEditModal, setOpenParticipantEditModal] =
    useState(false);

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

  const handleSuccess = async (res) => {
    try {
      setIsLoading(true);
      const verificationResponse = await verifyTransfer(
        res?.transactionRef?.reference
      );
      if (verificationResponse?.status === 'success') {
        if (contribution?.type === 'group') {
          await updateContributionForUser(contribution, userProfile);
        } else {
          await updatePersonalContribution(contribution, userProfile);
        }
        await fetchUserContributions(currentUser?.userId, setContributions);
        Alert.alert(
          'Payment Successful',
          'Your contribution has been updated',
          [
            {
              text: 'OK',
              onPress: () => router.push('/protected/mimonie'),
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Payment Failed', 'Could not verify payment');
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      Alert.alert('Error', 'Something went wrong while verifying payment');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile(setOwnerProfile, {
      userId: contribution?.participant_ids?.[0],
    });
  }, [contribution]);

  const handleJoinContribution = async () => {
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

  const startDate = new Date(contribution?.start_date);

  const recipient = parsed?.find(
    (participant) => participant.status === 'in progress'
  );

  const isEarlyWithdrawal =
    contribution?.currently_at < contribution?.num_of_month;

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

  const transactionCharge = Math.round(contribution?.amount * 0.035);

  // Adjust the amount to include the transaction charge
  const adjustedAmount = contribution?.amount + transactionCharge;

  return (
    <PageView title={'Contribution Details'} route={'protected/mimonie'}>
      <View style={styles.container}>
        {loading ? (
          <View style={{ rowGap: 6 }}>
            <View style={{ marginVertical: 10 }}>
              <SkeletonLoader width="100%" height={20} />
              <SkeletonLoader width="60%" height={20} />
              <SkeletonLoader width="80%" height={20} />
            </View>
            <View style={{ marginVertical: 10 }}>
              <SkeletonLoader width="100%" height={20} />
              <SkeletonLoader width="60%" height={20} />
              <SkeletonLoader width="80%" height={20} />
            </View>
            <View style={{ marginVertical: 10 }}>
              <SkeletonLoader width="100%" height={20} />
              <SkeletonLoader width="60%" height={20} />
              <SkeletonLoader width="80%" height={20} />
            </View>
            <View style={{ marginVertical: 10 }}>
              <SkeletonLoader width="100%" height={20} />
              <SkeletonLoader width="60%" height={20} />
              <SkeletonLoader width="80%" height={20} />
            </View>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                columnGap: 20,
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginBottom: 10,
              }}
            >
              {parsed?.some(
                (participant) =>
                  participant.userId === currentUser.userId &&
                  participant.status !== 'in progress' &&
                  participant?.last_successful_round <
                    contribution?.current_count
              ) && (
                <Pressable
                  style={styles.fab}
                  onPress={() => paystackWebViewRef.current.startTransaction()}
                >
                  <Text style={{ color: 'white' }}>Pay Via Transfer</Text>
                </Pressable>
              )}
              {(parsed?.some(
                (participant) => participant.userId === currentUser.userId
              ) &&
                contribution?.owner !== userProfile?.name) ||
              ['completed', 'running', 'closed']?.includes(
                contribution?.status
              ) ? null : (
                <Pressable
                  style={styles.fab}
                  onPress={() => {
                    if (
                      (parsed?.length === contribution?.num_of_month &&
                        contribution?.owner === userProfile?.name) ||
                      contribution?.type === 'personal'
                    ) {
                      handleStartContribution();
                    } else if (
                      contribution?.status === 'open' &&
                      contribution?.owner === userProfile?.name
                    ) {
                      setVisible(!visible);
                    } else {
                      handleJoinContribution();
                    }
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.fabText}>
                    {isLoading
                      ? 'Joining ...'
                      : (parsed?.length === contribution?.num_of_month &&
                          contribution?.owner === userProfile?.name) ||
                        contribution?.type === 'personal'
                      ? 'Start'
                      : contribution?.status === 'open' &&
                        contribution?.owner === userProfile?.name
                      ? 'Invite'
                      : 'Join'}
                  </Text>
                </Pressable>
              )}
              {contribution?.type === 'group' &&
              contribution?.status !== 'completed' ? (
                <CopyLink inviteLink={contribution.id} />
              ) : contribution?.type === 'personal' &&
                contribution?.status !== 'closed' &&
                contribution?.currently_at > 0 ? (
                <Pressable
                  style={styles.fab}
                  onPress={() => setWithdrawModal(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.fabText}>Withdraw</Text>
                </Pressable>
              ) : null}
            </View>

            {parsed?.[0]?.balance || parsed?.[0]?.balance === 0 ? (
              <View
                style={{
                  height: 100,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.pri,
                  marginVertical: 20,
                  padding: 20,
                }}
              >
                <Text style={styles.label}>Withdrawable Balance:</Text>
                <Text
                  style={{
                    fontSize: 40,
                    color: Colors.pri,
                    fontFamily: 'isb',
                  }}
                >
                  {naira}{' '}
                  {new Intl.NumberFormat('en-US').format(parsed?.[0]?.balance)}
                </Text>
              </View>
            ) : null}

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
                  {/* <View style={styles.detailContainer}>
                    <Text style={styles.label}>User role</Text>
                    <Text style={styles.value}>
                      {contribution?.owner === userProfile?.name
                        ? 'Creator'
                        : 'invitee'}
                    </Text>
                  </View> */}
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
      <Paystack
        ref={paystackWebViewRef}
        paystackKey={process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY}
        amount={adjustedAmount}
        billingEmail={userProfile?.email}
        bearer={'account'}
        transaction_charge={transactionCharge}
        firstName={userProfile?.name}
        activityIndicatorColor={Colors.pri}
        subaccount={recipient?.subaccount_code}
        channels={['bank_transfer']}
        onCancel={(e) => {
          console.log('cancelled');
        }}
        onSuccess={(res) => {
          handleSuccess(res);
        }}
      >
        <View style={{ rowGap: 4 }}>
          <Text style={{ fontFamily: 'im', fontSize: 14, letterSpacing: 1 }}>
            You are paying NGN {contribution?.amount}
          </Text>
          <Text style={{ fontFamily: 'im', fontSize: 14, letterSpacing: 1 }}>
            for {contribution?.name} contribution
          </Text>
        </View>
      </Paystack>
      <Modal visible={withdrawModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEarlyWithdrawal ? 'Continue' : 'Confirm Withdrawal'}
            </Text>
            <Text style={styles.modalText}>
              {isEarlyWithdrawal
                ? 'Withdrawing before the liquidation date will incur a 10% penalty. Please confirm if you wish to proceed.'
                : 'Are you sure you want to withdraw your funds? There are no penalties for withdrawing now. Please confirm if you wish to proceed.'}
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Cancel" onPress={() => setWithdrawModal(false)} />
              <Button title="Continue" onPress={handleWithdrawFund} />
            </View>
          </View>
        </View>
      </Modal>
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

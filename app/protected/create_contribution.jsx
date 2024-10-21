import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PageView } from '@/components/Reusable';
import { DateTimeSelector, SelectInput } from '../../components/Reusable';
import { useGlobalContext } from '../../store/StoreContext';
import {
  createContribution,
  createPersonalContribution,
} from '../../api/contributions.service';
import { getContributionGroups } from '../../api/groups.service';
import ContactModal from '../../components/ContactModal';
import { Colors } from '../../constants/Colors';
import { ErrorCheck } from '../../utils/errorCheck';
import CopyLink from '../../components/CopyLink';
import { naira } from '@/constants/Currency';

const dateOption = [
  'en-US',
  {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
];

const variantOptions = [
  { label: 'Weekly', value: 'weeks' },
  { label: 'Monthly', value: 'months' },
];

const variantOptionsPersonal = [
  { label: 'Daily', value: 'days' },
  { label: 'Weekly', value: 'weeks' },
  { label: 'Monthly', value: 'months' },
];

const amountOptions = [
  { label: '₦5,000', value: 5000 },
  { label: '₦10,000', value: 10000 },
  { label: '₦20,000', value: 20000 },
  { label: '₦30,000', value: 30000 },
  { label: '₦40,000', value: 40000 },
  { label: '₦50,000', value: 50000 },
  { label: '₦100,000', value: 100000 },
  { label: '₦200,000', value: 200000 },
  { label: '₦300,000', value: 300000 },
  { label: '₦400,000', value: 400000 },
  { label: '₦500,000', value: 500000 },
  { label: '₦1,000,000', value: 1000000 },
];

const participantOptions = [
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
];

const CreateContribution = () => {
  const [contributionName, setContributionName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState({});
  const [newContribution, setNewContribution] = useState({});
  const [contributionType, setContributionType] = useState('group');
  const [variant, setVariant] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [amountSelected, setAmountSelected] = useState({});
  const [numOfParticipants, setNumOfParticipants] = useState({});

  const {
    contributionGroups,
    setContributionGroups,
    currentUser,
    setContributions,
    setIsLoading,
    userProfile,
    parsed,
  } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    getContributionGroups(setContributionGroups);
  }, []);

  const myConnections = parsed?.filter((e) => e.status === 'accepted');

  const createGroupContribution = async () => {
    const details = {
      contributionName,
      groupName: 'Default',
      groupId: 'f75fbf99-4e9d-4e3e-ad62-b1b94a9162d9',
      userId: currentUser.userId,
      username: currentUser.preferred_username,
      target: amountSelected.value * (numOfParticipants.value - 1),
      amount: amountSelected.value,
      num_of_month: numOfParticipants.value,
      variant: variant.value,
    };

    if (
      ErrorCheck({
        contributionName,
        amount: amountSelected.value,
        participants: numOfParticipants.value,
        frequency: variant.value,
      })
    ) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await createContribution(
        details,
        setContributions,
        currentUser,
        userProfile
      );
      setNewContribution(res);
      setModalVisible(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createContributionPersonal = async () => {
    const date = new Date();
    const start_date = date.toLocaleDateString('en-CA');

    const details = {
      contributionName,
      groupName: 'Default',
      groupId: 'f75fbf99-4e9d-4e3e-ad62-b1b94a9162d9',
      userId: currentUser.userId,
      username: currentUser.preferred_username,
      target: selectedValue.p_target,
      amount: selectedValue.p_amount,
      num_of_month: Math.ceil(selectedValue.p_target / selectedValue.p_amount),
      variant: variant.value,
    };

    if (
      ErrorCheck({
        contributionName,
        target: selectedValue.p_target,
        amount: selectedValue.p_amount,
      })
    ) {
      return;
    }

    if (selectedValue.p_target === selectedValue.p_amount) {
      Alert.alert(
        'Invalid Target Amount',
        'The target amount must be more than the contribution amount.'
      );
      return;
    }

    if (selectedValue.p_target % selectedValue.p_amount !== 0) {
      Alert.alert(
        'Invalid Target Amount',
        `The target amount must be a multiple contribution amount. ${
          selectedValue.p_amount * 3
        } or  ${selectedValue.p_amount * 4} or  ${
          selectedValue.p_amount * 5
        } etc`
      );
      return;
    }

    setIsLoading(true);
    try {
      await createPersonalContribution(
        details,
        setContributions,
        currentUser,
        userProfile
      );

      Alert.alert(
        'Contribution Created',
        'Your personal contribution has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/protected/mimonie'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Error',
        'An error occurred while creating the contribution.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      Alert.alert(
        'Terms Not Accepted',
        'You must accept the terms and conditions before proceeding.'
      );
      return;
    }

    if (
      !userProfile.income_from ||
      selectedValue.amount > userProfile.income_from
    ) {
      Alert.alert(
        'Sorry!!',
        'You cannot create contribution under this category. Update your income'
      );
      return;
    }

    if (!userProfile.auth_url) {
      Alert.alert(
        'Sorry!!',
        'You cannot create contribution at the moment. Add a card to continue'
      );
      return;
    }

    if (contributionType === 'group') {
      if (myConnections?.length < 4) {
        Alert.alert(
          'Sorry!!',
          'You can only create group contribution when you have up to 4 connections.',
          [
            {
              text: 'Go to Contacts',
              onPress: () => router.push('/protected/contact'),
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]
        );
        return;
      }
      await createGroupContribution();
    } else if (contributionType === 'personal') {
      await createContributionPersonal();
    }
  };

  const groupNameAndValue = contributionGroups.map((item) => ({
    label: item.title,
    value: item.id,
    ...item,
  }));

  const handleInvite = async () => {
    setContactVisible(true);
    setModalVisible(false);
  };

  const isVerified =
    userProfile?.is_nin_verified && userProfile?.is_bvn_verified;

  const collection = (amountSelected?.value * (numOfParticipants?.value - 1))
    ?.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    ?.split('.')[0];

  return (
    <PageView title={'Create Contribution'}>
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {!isVerified ? (
              <View
                style={{
                  backgroundColor: 'red',
                  paddingVertical: 5,
                  paddingHorizontal: 5,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'ir',
                    fontSize: 12,
                    alignItems: 'center',
                  }}
                >
                  You cannot create a contribution at the moment. Please
                  complete your identity verification
                  <Link href={'/protected/account'}>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'ib',
                        fontSize: 12,
                      }}
                    >
                      Verify Now
                    </Text>
                  </Link>
                </Text>
              </View>
            ) : null}
            <View style={{ marginVertical: 20 }}>
              <Text style={styles.instructions}>
                Choose your contribution type:
              </Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    contributionType === 'group' && styles.activeButton,
                  ]}
                  onPress={() => {
                    setContributionType('group');
                    setContributionName('');
                    setVariant({});
                    setSelectedValue({});
                    setAmountSelected({});
                    setNumOfParticipants({});
                  }}
                >
                  <Text
                    style={[
                      styles.switchText,
                      {
                        color: contributionType === 'group' ? 'white' : 'black',
                      },
                    ]}
                  >
                    Group Contribution
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    contributionType === 'personal' && styles.activeButton,
                  ]}
                  onPress={() => {
                    setContributionType('personal'), setContributionName('');
                    setVariant({});
                    setSelectedValue({});
                  }}
                >
                  <Text
                    style={[
                      styles.switchText,
                      {
                        color:
                          contributionType === 'personal' ? 'white' : 'black',
                      },
                    ]}
                  >
                    Personal Savings
                  </Text>
                </TouchableOpacity>
              </View>
              {contributionType === 'personal' && (
                <Text style={{ fontSize: 12, color: '#000000' }}>
                  Achieve your financial goals at your own pace
                </Text>
              )}
            </View>

            {contributionType === 'group' ? (
              <View style={{ rowGap: 20 }}>
                <View style={{ rowGap: 14 }}>
                  <Text style={styles.label}>Contribution Name</Text>
                  <TextInput
                    style={styles.input}
                    value={contributionName}
                    onChangeText={setContributionName}
                    placeholder="Enter Contribution Name"
                  />
                </View>
                <View style={{ rowGap: 14 }}>
                  <Text style={styles.label}>Frequency</Text>
                  <SelectInput
                    options={variantOptions}
                    selectedValue={variant}
                    setSelectedValue={setVariant}
                    defaultValue={variant.value}
                  />
                </View>
                <View style={{ rowGap: 14 }}>
                  <Text style={styles.label}>Amount {variant.label}</Text>
                  <SelectInput
                    options={amountOptions}
                    selectedValue={amountSelected}
                    setSelectedValue={setAmountSelected}
                    defaultValue={amountSelected.value}
                    useHeight={false}
                  />
                </View>
                <View style={{ rowGap: 14 }}>
                  <Text style={styles.label}>Number of Participant</Text>
                  <SelectInput
                    options={participantOptions}
                    selectedValue={numOfParticipants}
                    setSelectedValue={setNumOfParticipants}
                    defaultValue={numOfParticipants.value}
                    useHeight={false}
                  />
                </View>
                {numOfParticipants.value && (
                  <>
                    <View style={{ rowGap: 14 }}>
                      <Text style={styles.label}>Duration</Text>
                      <TextInput
                        style={styles.input}
                        value={`${numOfParticipants?.value} ${variant?.value}`}
                        placeholder="Duration"
                        readOnly={true}
                      />
                    </View>
                    <View style={{ rowGap: 14 }}>
                      <Text style={styles.label}>
                        Collection Per Participant
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={`${naira}${collection}`}
                        placeholder="Collection Per Participant"
                        readOnly={true}
                      />
                    </View>
                  </>
                )}
                {/* <View style={{ rowGap: 14 }}>
                  <Text style={styles.label}>Group Category</Text>
                  <SelectInput
                    options={groupNameAndValue}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                    defaultValue={selectedValue?.label}
                  />
                </View> */}
              </View>
            ) : (
              <View style={{ rowGap: 20 }}>
                <View style={{ rowGap: 14 }}>
                  <Text style={styles.label}>Contribution Name</Text>
                  <TextInput
                    style={styles.input}
                    value={contributionName}
                    onChangeText={setContributionName}
                    placeholder="Enter Contribution Name"
                  />
                </View>

                {userProfile?.dva?.enabled ? (
                  <>
                    <View style={{ rowGap: 14 }}>
                      <Text style={styles.label}>Frequency</Text>
                      <SelectInput
                        options={variantOptionsPersonal}
                        selectedValue={variant}
                        setSelectedValue={setVariant}
                        defaultValue={variant.value}
                      />
                    </View>
                    <View style={{ rowGap: 14 }}>
                      <Text style={styles.label}>Amount {variant?.label}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Amount"
                        keyboardType="numeric"
                        value={selectedValue.amount}
                        onChangeText={(val) =>
                          setSelectedValue({
                            ...selectedValue,
                            p_amount: Number(val),
                          })
                        }
                      />
                    </View>
                    <View style={{ rowGap: 14 }}>
                      <Text style={styles.label}>Target</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Target"
                        keyboardType="numeric"
                        value={selectedValue.target}
                        onChangeText={(val) =>
                          setSelectedValue({
                            ...selectedValue,
                            p_target: Number(val),
                          })
                        }
                      />
                    </View>
                  </>
                ) : (
                  <Pressable
                    onPress={() => router.push('/protected/settings')}
                    style={styles.warningContainer}
                  >
                    <Text style={styles.warningText}>
                      You have not enabled personal contribution.{' '}
                      <Text style={styles.linkText}>Enable Now</Text>
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
            <TouchableOpacity onPress={() => setTermsVisible(true)}>
              <Text style={styles.termsLink}>
                Read and Accept Terms & Conditions
              </Text>
            </TouchableOpacity>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                <View
                  style={[
                    styles.checkboxIndicator,
                    termsAccepted ? styles.checked : {},
                  ]}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                I accept the terms and conditions
              </Text>
            </View>
          </ScrollView>
        </View>

        <View style={{ justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  !isVerified || !contributionType || !userProfile?.dva?.enabled
                    ? 'gray'
                    : Colors.pri,
              },
            ]}
            disabled={
              !isVerified || !contributionType || !userProfile?.dva?.enabled
            }
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalText}>
                Your contribution has been created successfully.
              </Text>
              <Text style={styles.modalText}>
                Invite friends from your contact to join {newContribution.title}
              </Text>
              <Pressable style={styles.inviteLink} onPress={handleInvite}>
                <Text>Click to invite friends</Text>
              </Pressable>
              <Text style={{ marginBottom: 12 }}>Or</Text>
              <CopyLink inviteLink={newContribution.id} />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  router.push('/protected/mimonie');
                }}
              >
                <Text style={styles.modalButtonText}>Not Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={termsVisible}
          onRequestClose={() => setTermsVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalView, { maxHeight: '70%' }]}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <ScrollView style={styles.termsContainer}>
                {terms(contributionType)}
              </ScrollView>
              <TouchableOpacity onPress={() => setTermsVisible(false)}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <ContactModal
          visible={contactVisible}
          setVisible={setContactVisible}
          invite_link={newContribution.id}
        />
      </View>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    overflow: 'hidden',
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#1F2937',
    fontFamily: 'ir',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9095A1',
    padding: 12,
    height: 53,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    columnGap: 20,
  },
  switchButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f4f4f4',
  },
  activeButton: {
    backgroundColor: Colors.pri,
    borderColor: Colors.pri,
  },
  switchText: {
    color: '#1F2937',
    fontFamily: 'isb',
  },
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    height: 44,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'isb',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  inviteLink: {
    fontSize: 14,
    color: '#2563EB',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 8,
  },
  warningText: {
    color: 'red',
    textAlign: 'center',
    fontFamily: 'ir',
    fontSize: 12,
  },
  linkText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  termsLink: {
    color: '#2563EB',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: Colors.pri,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'ir',
    color: '#1F2937',
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsContent: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'left',
    lineHeight: 22,
  },
  modalButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateContribution;

const terms = (type) => {
  return type === 'group' ? (
    <Text style={styles.termsContent}>
      1. Payouts are made one day after the actual deduction day.
      {'\n'}
      {'\n'}
      2. Paystack charges 1.5% + NGN 100 from each contribution, and Mimonie
      charges 5%.
      {'\n'}
      {'\n'}
      3. You are liable for participants you invite. If one person defaults, you
      are responsible for ensuring they fund their account.
      {'\n'}
      {'\n'}
      4. For weekly contributions, deductions occur on Mondays and payouts on
      Tuesdays.
      {'\n'}
      {'\n'}
      5. For monthly contributions, deductions occur on the 28th, with payouts
      on the 29th, unless there is a default or issue.
      {'\n'}
      {'\n'}
      6. Payouts will not be processed on public holidays or weekends.
    </Text>
  ) : (
    <Text style={styles.termsContent}>
      1. Admin fee of 5%.
      {'\n'}
      {'\n'}
      2. Early withdrawal requests are subject to extra charges.
      {'\n'}
      {'\n'}
      3. Payouts for personal contributions are processed one day after the
      withdrawal request is made.
      {'\n'}
      {'\n'}
      4. No payouts are processed during weekends or public holidays.
    </Text>
  );
};

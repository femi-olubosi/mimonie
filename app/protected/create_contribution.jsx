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
import { createContribution } from '../../api/contributions.service';
import { getContributionGroups } from '../../api/groups.service';
import ContactModal from '../../components/ContactModal';
import { Colors } from '../../constants/Colors';
import { ErrorCheck } from '../../utils/errorCheck';
import CopyLink from '../../components/CopyLink';

const dateOption = [
  'en-US',
  {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
];

const variantOptions = [
  { label: 'Daily', value: 'days' },
  { label: 'Weekly', value: 'weeks' },
  { label: 'Monthly', value: 'months' },
];

const CreateContribution = () => {
  const [contributionName, setContributionName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newContribution, setNewContribution] = useState({});
  const [contributionType, setContributionType] = useState('group');
  const [variant, setVariant] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  const [date, setDate] = useState(new Date());
  const {
    contributionGroups,
    setContributionGroups,
    currentUser,
    setContributions,
    setIsLoading,
    userProfile,
  } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    getContributionGroups(setContributionGroups);
  }, []);

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

    const details = {
      contributionName,
      groupName: selectedValue.title,
      groupId: selectedValue.value,
      // date: date.toLocaleDateString('en-CA'),
      userId: currentUser.userId,
      username: currentUser.preferred_username,
      target: selectedValue.target,
      amount: selectedValue.amount,
      num_of_month: selectedValue.num_of_month,
      variant: variant.value,
    };
    if (ErrorCheck({ contributionName, groupName: selectedValue.title })) {
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

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
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

  return (
    <PageView title={'Create Contribution'}>
      <View style={styles.container}>
        <ScrollView>
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
                You cannot create a contribution at the moment. Please complete
                your identity verification
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
                onPress={() => setContributionType('group')}
              >
                <Text
                  style={[
                    styles.switchText,
                    { color: contributionType === 'group' ? 'white' : 'black' },
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
                onPress={() => setContributionType('personal')}
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
                  Personal Contribution
                </Text>
              </TouchableOpacity>
            </View>
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
                <Text style={styles.label}>Group Category</Text>
                <SelectInput
                  options={groupNameAndValue}
                  selectedValue={selectedValue}
                  setSelectedValue={setSelectedValue}
                  defaultValue={selectedValue?.label}
                />
              </View>
              <View style={{ rowGap: 14 }}>
                <Text style={styles.label}>Contribution Variant</Text>
                <SelectInput
                  options={variantOptions}
                  selectedValue={variant}
                  setSelectedValue={setVariant}
                  defaultValue={variant.value}
                />
              </View>
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
                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Amount"
                      keyboardType="numeric"
                      value={selectedValue.amount}
                      onChangeText={(val) =>
                        setSelectedValue({ ...selectedValue, amount: val })
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
                        setSelectedValue({ ...selectedValue, target: val })
                      }
                    />
                  </View>
                  <View style={{ rowGap: 14 }}>
                    <Text style={styles.label}>Variant</Text>
                    <SelectInput
                      options={variantOptions}
                      selectedValue={variant}
                      setSelectedValue={setVariant}
                      defaultValue={variant.value}
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

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  !isVerified ||
                  !contributionType ||
                  (!userProfile.recipient_code &&
                    contributionType === 'personal')
                    ? 'gray'
                    : Colors.pri,
              },
            ]}
            disabled={
              !isVerified ||
              !contributionType ||
              (!userProfile.recipient_code && contributionType === 'personal')
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
    borderRadius: 12,
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
    marginTop: 100,
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
      1. Paystack charges 1.5% + NGN 100 from each contribution, and Mimonie
      charges 5%.
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

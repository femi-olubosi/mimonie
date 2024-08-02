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

const dateOption = [
  'en-US',
  {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
];

const CreateContribution = () => {
  const [contributionName, setContributionName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newContribution, setNewContribution] = useState({});

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
  const isVerified = userProfile.is_nin_verified && userProfile.is_bvn_verified;

  return (
    <PageView title={'Create Contribution'}>
      <View style={styles.container}>
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
              <Link href={'/protected/kyc'}>
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
        <Text style={styles.instructions}>
          Create a contribution schedule and invite friends to join
        </Text>

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
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isVerified ? Colors.pri : 'gray',
            },
          ]}
          disabled={!isVerified}
          onPress={handleConfirm}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>

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
        <ContactModal
          visible={contactVisible}
          setVisible={setContactVisible}
          invite_link={newContribution.invite_link}
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
  inputSearch: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9095A1',
    padding: 12,
    height: 40,
    width: '90%',
    alignSelf: 'center',
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
  modalContainerContact: {
    flex: 1,
    justifyContent: 'flex-end',
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
  modalViewContact: {
    width: '95%',
    height: '85%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 20,
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
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },

  contactName: {
    fontSize: 14,
    fontFamily: 'ir',
  },
  phoneNumber: {
    color: 'blue',
  },
  inviteText: {
    color: 'green',
  },
});

export default CreateContribution;

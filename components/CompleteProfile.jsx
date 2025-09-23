import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { fetchUserProfile, updateUserProfile } from '@/api/user.service';
import { createPaystackCustomer } from '@/api/payment.service';
import { useGlobalContext } from '@/store/StoreContext';
import { DateTimeSelector, PageView } from '@/components/Reusable';
import { updateAttributes } from '../api/user.service';
import { ErrorCheck } from '../utils/errorCheck';
import {
  createNotification,
  fetchUserNotification,
} from '../api/notifications.service';
import { convertToAWSDate } from '../utils/toAWSDate';
import { sendOtp } from '../api/token.service';
import SelectModal from './modals/SelectModal';
import { Entypo } from '@expo/vector-icons';

const dateOption = [
  'en-US',
  { day: '2-digit', month: '2-digit', year: 'numeric' },
];

const CompleteProfile = () => {
  const [infoDetails, setInfoDetails] = useState({
    country_of_origin: 'Nigeria',
  });
  const {
    currentUser,
    setIsLoading,
    userProfile,
    setUserProfile,
    setNotifications,
    setConfirmationResult,
  } = useGlobalContext();
  const router = useRouter();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [datePick, setDatePick] = useState();
  const [selectedValue, setSelectedValue] = useState({});
  const [selectedStateOfResidence, setSelectedStateOfResidence] = useState({});
  const [incomeModal, setIncomeModal] = useState(false);
  const [sOfRModal, setSOfRModal] = useState(false);

  const handleInputChange = (value, name) => {
    setInfoDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setInfoDetails((prev) => ({
      ...prev,
      birthdate: selectedDate.toLocaleDateString(...dateOption),
    }));
    setDatePick(selectedDate);
    setShowDatePicker(false);
  };

  useEffect(() => {
    if (Object.keys(selectedValue || {})?.length > 0) {
      setInfoDetails((prev) => ({
        ...prev,
        income_from: Number(selectedValue?.value?.split('-')[0]?.trim()),
        income_to: Number(selectedValue?.value?.split('-')[1]?.trim()),
      }));
    }
  }, [selectedValue]);

  useEffect(() => {
    if (Object.keys(selectedStateOfResidence || {})?.length > 0) {
      setInfoDetails((prev) => ({
        ...prev,
        state_of_residence: selectedStateOfResidence.value,
      }));
    }
  }, [selectedStateOfResidence]);

  const handleSubmit = async () => {
    const fname = infoDetails?.firstname?.trim?.() || '';
    const lname = infoDetails?.lastname?.trim?.() || '';
    const name = `${fname} ${lname}`.trim();

    const data = {
      name,
      birthdate: convertToAWSDate(infoDetails?.birthdate),
      address: infoDetails?.address,
      occupation: infoDetails?.occupation,
      income_from: infoDetails?.income_from,
      income_to: infoDetails?.income_to,
      country_of_origin: 'Nigeria',
      state_of_residence: infoDetails?.state_of_residence,
    };

    if (ErrorCheck(data)) return;

    setIsLoading(true);
    try {
      const res = await createPaystackCustomer(
        currentUser.email,
        infoDetails.firstname,
        infoDetails.lastname,
        currentUser.phone_number
      );

      await updateUserProfile(
        { ...data, customer_code: res.data.customer_code },
        currentUser,
        userProfile
      );

      await updateAttributes({ name });

      await createNotification(
        {
          title: 'Account Created',
          content: `Hi ${infoDetails.firstname}, You have joined mimonie network.`,
          type: 'account',
          userId: currentUser.userId,
          read: false,
        },
        setNotifications
      );
      await fetchUserNotification(currentUser.userId, setNotifications);
      const profile = await fetchUserProfile(setUserProfile, currentUser);

      const resOtp = await sendOtp(profile.phone_number);
      setConfirmationResult({ ...resOtp, type: 'phone_verification' });
      router.push('/(protected)/verification_check');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  return (
    <PageView title={'Complete Sign Up'} backIcon={false}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        nestedScrollEnabled={true}
      >
        {formElement.map((item, index) => (
          <View key={index}>
            <Pressable
              style={[
                styles.infoContainer,
                { marginBottom: item.helperText ? 2 : 16 },
              ]}
              onPress={() =>
                item.name === 'birthdate' ? toggleDatePicker() : {}
              }
            >
              <Text style={styles.label}>{item.label}</Text>

              {item.eType === 'select' ? (
                item.name === 'income_from' ? (
                  <TouchableOpacity
                    onPress={() => setIncomeModal(true)}
                    style={styles.selectBox}
                  >
                    <Text>{selectedValue.label || `Select Income Range`}</Text>
                    <Entypo name="triangle-down" size={24} color="black" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => setSOfRModal(true)}
                    style={styles.selectBox}
                  >
                    <Text>
                      {selectedStateOfResidence.label ||
                        `Select State of Residence`}
                    </Text>
                    <Entypo name="triangle-down" size={24} color="black" />
                  </TouchableOpacity>
                )
              ) : (
                <View
                  style={{
                    flexDirection: item.name === 'birthdate' ? 'row' : '',
                    justifyContent: 'space-between',
                  }}
                >
                  <TextInput
                    style={styles.value}
                    value={
                      item.name === 'birthdate'
                        ? datePick?.toLocaleDateString(...dateOption) || ''
                        : infoDetails[item.name]
                    }
                    onChangeText={(value) =>
                      handleInputChange(value, item.name)
                    }
                    editable={
                      item.name !== 'birthdate' &&
                      item.name !== 'country_of_origin'
                    }
                    placeholder={item.placeholder}
                    placeholderTextColor={'silver'}
                    onPress={() =>
                      item.name === 'birthdate' ? toggleDatePicker() : {}
                    }
                    keyboardType={'default'}
                    scrollEnabled={true}
                  />
                  {item.name === 'birthdate' && (
                    <DateTimeSelector
                      show={showDatePicker}
                      setShow={setShowDatePicker}
                      date={date}
                      setDate={handleDateChange}
                      setDatePick={setDatePick}
                      mode={'date'}
                    />
                  )}
                </View>
              )}
            </Pressable>
            {item.helperText && (
              <Text style={styles.helper}>{item.helperText}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={'Complete'}
          color={Colors.pri}
          onPress={handleSubmit}
          outline
        />
      </View>

      {/* Modals */}
      <SelectModal
        visible={sOfRModal}
        onClose={() => setSOfRModal(false)}
        data={nigerianStates}
        selectedItem={selectedStateOfResidence}
        onSelect={(item) => setSelectedStateOfResidence(item)}
        title="Select State of Residence"
      />

      <SelectModal
        visible={incomeModal}
        onClose={() => setIncomeModal(false)}
        data={income_range_options}
        selectedItem={selectedValue}
        onSelect={(item) => setSelectedValue(item)}
        title="Select Income Range"
      />
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  listContent: { padding: 20 },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: { fontSize: 14, color: '#1F2937', marginBottom: 4 },
  value: { fontSize: 16, color: '#6B7280', flex: 1, height: 40 },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  helper: { fontSize: 10, color: 'gray', marginBottom: 16, marginLeft: 5 },
  buttonContainer: { paddingVertical: 10, width: '50%', alignSelf: 'center' },
});

export default CompleteProfile;

const formElement = [
  {
    label: 'First Name',
    name: 'firstname',
    placeholder: '',
    helperText: 'Use first name as on official document',
  },
  {
    label: 'Last Name',
    name: 'lastname',
    placeholder: '',
    helperText: 'Use last name as on official document',
  },
  { label: 'Date of Birth', name: 'birthdate', placeholder: '' },
  { label: 'Occupation', name: 'occupation', placeholder: '' },
  {
    label: 'Contact Address',
    name: 'address',
    placeholder: '01, Street/Estate name, Area/LG name',
    helperText:
      'Warning: incomplete or fake addresses may delay or prevent account verification.',
  },
  { label: 'State of Residence', name: 'state_of_residence', eType: 'select' },
  {
    label: 'Country of Origin',
    name: 'country_of_origin',
    placeholder: 'Nigeria',
  },
  { label: 'Income Range', name: 'income_from', eType: 'select' },
];

const income_range_options = [
  { label: '₦100,000 - ₦250,000', value: '100000 - 250000', id: 1 },
  { label: '₦250,000 - ₦500,000', value: '250000 - 500000', id: 2 },
  { label: '₦500,000 - ₦750,000', value: '500000 - 750000', id: 3 },
  { label: '₦750,000 - ₦1,000,000', value: '750000 - 1000000', id: 4 },
  { label: '₦1,000,000 - ₦5,000,000', value: '1000000 - 5000000', id: 5 },
  { label: '₦5,000,000 - Above', value: '5000000 - 100000000', id: 6 },
];

const nigerianStates = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
].map((state, index) => ({ label: state, value: state, id: index + 1 }));

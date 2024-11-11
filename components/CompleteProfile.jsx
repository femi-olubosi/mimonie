import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { fetchUserProfile, updateUserProfile } from '@/api/user.service';
import { createPaystackCustomer } from '@/api/payment.service';
import { useGlobalContext } from '@/store/StoreContext';
import { DateTimeSelector, PageView, SelectInput } from '@/components/Reusable';
import { topBar } from '@/cStyle';
import { naira } from '@/constants/Currency';
import { fetchCurrUser } from '../api/user.service';
import { ErrorCheck } from '../utils/errorCheck';
import {
  createNotification,
  fetchUserNotification,
} from '../api/notifications.service';
import { convertToAWSDate } from '../utils/toAWSDate';
import { fetchCountries } from '../api/payment.service';
import { sendOtp } from '../api/token.service';

const dateOption = [
  'en-US',
  {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
];

const CompleteProfile = () => {
  const [infoDetails, setInfoDetails] = useState({});
  const {
    currentUser,
    setCurrentUser,
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
  const [selectedCountry, setSelectedCountry] = useState({});
  const [selectedOrigin, setSelectedOrigin] = useState({});
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchCurrUser(setCurrentUser);
  }, []);

  useEffect(() => {
    const fetchCountry = async () => {
      const res = await fetchCountries();
      setCountries(res);
    };
    fetchCountry();
  }, []);

  const handleInputChange = (value, name) => {
    setInfoDetails((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (userProfile?.income_from) {
      setSelectedValue({
        label:
          naira +
          userProfile?.income_from +
          ' - ' +
          naira +
          userProfile?.income_to,
        value: userProfile?.income_from + ' - ' + userProfile?.income_to,
      });
    }
  }, [userProfile]);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setInfoDetails((prev) => ({
      ...prev,
      birthdate: selectedDate.toLocaleDateString(...dateOption),
    }));
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
    if (Object.keys(selectedCountry || {})?.length > 0) {
      setInfoDetails((prev) => ({
        ...prev,
        country_of_residence: selectedCountry.value,
      }));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (Object.keys(selectedOrigin || {})?.length > 0) {
      setInfoDetails((prev) => ({
        ...prev,
        country_of_origin: selectedOrigin.value,
      }));
    }
  }, [selectedOrigin]);

  const handleSubmit = async () => {
    const data = {
      name: infoDetails.firstname + ' ' + infoDetails.lastname,
      birthdate: convertToAWSDate(infoDetails.birthdate),
      address: infoDetails.address,
      occupation: infoDetails.occupation,
      income_from: infoDetails.income_from,
      income_to: infoDetails.income_to,
      country_of_residence: infoDetails.country_of_residence,
      country_of_origin: infoDetails.country_of_origin,
      email: currentUser.email,
      preferred_username: 'username',
      phone_number: currentUser.phone_number,
    };

    if (ErrorCheck(data)) {
      return;
    }
    setIsLoading(true);
    try {
      // await updateUserProfile(data, currentUser);
      // const user = await fetchUserProfile(setUserProfile, currentUser);
      // console.log({ user });
      const res = await createPaystackCustomer(
        currentUser.email,
        infoDetails.firstname,
        infoDetails.lastname,
        currentUser.phone_number
      );

      const update = await updateUserProfile(
        { ...data, customer_code: res.data.customer_code },
        currentUser
      );
      console.log({ update });
      await createNotification(
        {
          title: 'Account Created',
          content: `Hi ${infoDetails.firstname}, You have joined mimonie network. Navigate to account screen to complete your KYC to start contributing`,
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
      router.push('/protected/login_verify');
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

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
                <SelectInput
                  options={
                    item.name === 'income_from'
                      ? income_range_options
                      : countries
                  }
                  selectedValue={
                    item.name === 'income_from'
                      ? selectedValue
                      : item.name === 'country_of_origin'
                      ? selectedOrigin
                      : selectedCountry
                  }
                  setSelectedValue={
                    item.name === 'income_from'
                      ? setSelectedValue
                      : item.name === 'country_of_origin'
                      ? setSelectedOrigin
                      : setSelectedCountry
                  }
                  defaultValue={
                    item.name === 'income_from'
                      ? selectedValue.value
                      : item.name === 'country_of_origin'
                      ? selectedOrigin.value
                      : selectedCountry.value
                  }
                />
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
                        ? datePick?.toLocaleDateString(...dateOption)
                        : infoDetails[item.name]
                    }
                    onChangeText={(value) =>
                      handleInputChange(value, item.name)
                    }
                    editable={item.name !== 'birthdate'}
                    placeholder={item.placeholder}
                    onPress={() =>
                      item.name === 'birthdate' ? toggleDatePicker() : {}
                    }
                    keyboardType={
                      item.name === 'phone_number' ? 'number-pad' : 'default'
                    }
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
              <Text
                style={{
                  fontSize: 10,
                  color: 'gray',
                  marginBottom: 16,
                  marginLeft: 5,
                }}
              >
                {item.helperText}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          title={'Complete'}
          color={Colors.pri}
          onPress={handleSubmit}
          outline={true}
        />
      </View>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: Platform.OS === 'android' ? 128 : 80,
    paddingTop: topBar,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  buttonContainer: {
    paddingVertical: 10,
    width: '50%',
    alignSelf: 'center',
  },
});

export default CompleteProfile;

const formElement = [
  {
    label: 'First Name',
    name: 'firstname',
    placeholder: '',
    helperText: 'Use  first name as on official document',
  },
  {
    label: 'Last Name',
    name: 'lastname',
    placeholder: '',
    helperText: 'Use  last name as on official document',
  },
  // { label: 'User Name', name: 'preferred_username', placeholder: 'Username' },
  // {
  //   label: 'Phone Number',
  //   name: 'phone_number',
  //   placeholder: '+234 0X17 XX4 24X3',
  // },
  { label: 'Date of Birth', name: 'birthdate', placeholder: '' },
  {
    label: 'Contact Address',
    name: 'address',
    placeholder: '',
  },
  { label: 'Occupation', name: 'occupation', placeholder: '' },
  {
    label: 'Income Range',
    name: 'income_from',
    eType: 'select',
    placeholder: '',
  },
  // {
  //   label: 'Income To',
  //   name: 'custom:income_to',
  //   placeholder: '200000',
  // },
  {
    label: 'Country of Origin',
    name: 'country_of_origin',
    eType: 'select',
    placeholder: '',
  },
  {
    label: 'Country of Residence',
    name: 'country_of_residence',
    eType: 'select',
    placeholder: '',
  },
];

const income_range_options = [
  {
    label: '₦100,000 - ₦250,000',
    value: '100000 - 250000',
  },
  {
    label: '₦250,000 - ₦500,000',
    value: '250000 - 500000',
  },
  {
    label: '₦500,000 - ₦750,000',
    value: '500000 - 750000',
  },
  {
    label: '₦750,000 - ₦1,000,000',
    value: '750000 - 1000000',
  },
];

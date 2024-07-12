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
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';
import { useGlobalContext } from '../../store/StoreContext';
import {
  DateTimeSelector,
  PageView,
  SelectInput,
} from '../../components/Reusable';
import { topBar } from '../../cStyle';
import { naira } from '../../constants/Currency';
import { ErrorCheck } from '../../utils/errorCheck';
import { fetchCountries } from '../../api/payment.service';

const dateOption = [
  'en-US',
  {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
];

const ProfileEdit = () => {
  const [infoDetails, setInfoDetails] = useState({});
  const {
    currentUser,
    setCurrentUser,
    setIsLoading,
    userProfile,
    setUserProfile,
  } = useGlobalContext();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedValue, setSelectedValue] = useState({});
  const [selectedCountry, setSelectedCountry] = useState({});
  const [selectedOrigin, setSelectedOrigin] = useState({});
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountry = async () => {
      const res = await fetchCountries();
      setCountries(res);
    };
    fetchCountry();
  }, []);

  useEffect(() => {
    setInfoDetails({
      ...userProfile,
      firstname: userProfile.name.split(' ')[0],
      lastname: userProfile.name.split(' ')[1],
    });
    setSelectedCountry((prev) => ({
      ...prev,
      label: userProfile.country_of_residence,
    }));
    setSelectedOrigin((prev) => ({
      ...prev,
      label: userProfile.country_of_origin,
    }));
  }, [userProfile]);

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
      birthdate: infoDetails.birthdate,
      address: infoDetails.address,
      occupation: infoDetails.occupation,
      income_from: infoDetails.income_from,
      income_to: infoDetails.income_to,
      country_of_residence: infoDetails.country_of_residence,
      country_of_origin: infoDetails.country_of_origin,
    };
    if (ErrorCheck(data)) {
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile(data, currentUser);
      await fetchUserProfile(setUserProfile, currentUser);
      router.back();
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
    <PageView title={'Edit Personal Information'}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
                        ? date.toLocaleDateString(...dateOption)
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
          title={'Cancel'}
          color={'red'}
          onPress={() => router.back()}
          outline={true}
          styleOverride={{ flex: 1 }}
        />
        <Button
          title={'Update'}
          color={Colors.pri}
          onPress={handleSubmit}
          outline={true}
          styleOverride={{ flex: 1 }}
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
    alignSelf: 'center',
    flexDirection: 'row',
    width: '90%',
    columnGap: 20,
  },
});

export default ProfileEdit;

const formElement = [
  {
    label: 'First Name',
    name: 'firstname',
    placeholder: 'Jimoh',
    helperText: 'Use  first name as on official document',
  },
  {
    label: 'Last Name',
    name: 'lastname',
    placeholder: 'Alfonso',
    helperText: 'Use  last name as on official document',
  },
  // {
  //   label: 'Phone Number',
  //   name: 'phone_number',
  //   placeholder: '+234 0X17 XX4 24X3',
  // },
  { label: 'Date of Birth', name: 'birthdate', placeholder: '30 July, 1950' },
  {
    label: 'Contact Address',
    name: 'address',
    placeholder: '200, Kilode Close, Ajangbadi, Lagos',
  },
  { label: 'Occupation', name: 'occupation', placeholder: 'Cab Driver' },
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
    label: 'County of Origin',
    name: 'country_of_origin',
    eType: 'select',
    placeholder: 'Nigeria',
  },
  {
    label: 'County of Residence',
    name: 'country_of_residence',
    eType: 'select',
    placeholder: 'Nigeria',
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

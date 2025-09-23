import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';
import { useGlobalContext } from '../../store/StoreContext';
import { PageView } from '../../components/Reusable';
import { topBar } from '../../cStyle';
import { naira } from '../../constants/Currency';
import { ErrorCheck } from '../../utils/errorCheck';
import { Entypo } from '@expo/vector-icons';
import SelectModal from '../../components/modals/SelectModal';

const ProfileEdit = () => {
  const [infoDetails, setInfoDetails] = useState({});
  const { currentUser, setIsLoading, userProfile, setUserProfile } =
    useGlobalContext();
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState({});
  const [selectedStateOfResidence, setSelectedStateOfResidence] = useState({});
  const [sOfRModal, setSOfRModal] = useState(false);
  const [incomeModal, setIncomeModal] = useState(false);

  useEffect(() => {
    setSelectedStateOfResidence({
      value: userProfile.state_of_residence,
      label: userProfile.state_of_residence,
    });
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

    if (userProfile.address) {
      setInfoDetails((prev) => ({ ...prev, address: userProfile.address }));
    }

    if (userProfile.occupation) {
      setInfoDetails((prev) => ({
        ...prev,
        occupation: userProfile.occupation,
      }));
    }
  }, [userProfile]);

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
    const data = {
      address: infoDetails.address,
      state_of_residence: infoDetails.state_of_residence,
      occupation: infoDetails.occupation,
      income_from: infoDetails.income_from,
      income_to: infoDetails.income_to,
    };
    if (ErrorCheck(data)) {
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile(data, currentUser, userProfile);
      await fetchUserProfile(setUserProfile, currentUser);
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
            >
              <Text style={styles.label}>{item.label}</Text>

              {item.eType === 'select' ? (
                item.name === 'income_from' ? (
                  <TouchableOpacity
                    onPress={() => {
                      setIncomeModal(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 5,
                    }}
                  >
                    <Text>{selectedValue.label || `Select Income Range`}</Text>
                    <Entypo name="triangle-down" size={24} color="black" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setSOfRModal(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 5,
                    }}
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
                    value={infoDetails[item.name]}
                    onChangeText={(value) =>
                      handleInputChange(value, item.name)
                    }
                    editable={item.editable}
                    placeholder={item.placeholder}
                    keyboardType={'default'}
                    scrollEnabled={true}
                  />
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

      <SelectModal
        visible={sOfRModal}
        onClose={() => setSOfRModal(false)}
        data={nigerianStates}
        selectedItem={selectedStateOfResidence}
        onSelect={(item) => {
          setSelectedStateOfResidence(item);
        }}
        title="Select State of Residence"
      />

      <SelectModal
        visible={incomeModal}
        onClose={() => setIncomeModal(false)}
        data={income_range_options}
        selectedItem={selectedValue}
        onSelect={(item) => {
          setSelectedValue(item);
        }}
        title="Select Income Range"
      />
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
    label: 'Contact Address',
    name: 'address',
    placeholder: '200, Kilode Close, Ajangbadi, Lagos',
    editable: true,
    helperText:
      'Warning: incomplete or fake addresses may delay or prevent account verification.',
  },
  {
    label: 'State of Residence',
    name: 'state_of_residence',
    eType: 'select',
    placeholder: 'Lagos',
    editable: true,
  },
  {
    label: 'Occupation',
    name: 'occupation',
    placeholder: 'Cab Driver',
    editable: true,
  },
  {
    label: 'Income Range',
    name: 'income_from',
    eType: 'select',
    placeholder: '',
    editable: true,
  },
];

const income_range_options = [
  {
    label: '₦100,000 - ₦250,000',
    value: '100000 - 250000',
    id: 1,
  },
  {
    label: '₦250,000 - ₦500,000',
    value: '250000 - 500000',
    id: 2,
  },
  {
    label: '₦500,000 - ₦750,000',
    value: '500000 - 750000',
    id: 3,
  },
  {
    label: '₦750,000 - ₦1,000,000',
    value: '750000 - 1000000',
    id: 4,
  },
  {
    label: '₦1,000,000 - ₦5,000,000',
    value: '1000000 - 5000000',
    id: 5,
  },
  {
    label: '₦5,000,000 - Above',
    value: '5000000 - 100,000,000',
    id: 6,
  },
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

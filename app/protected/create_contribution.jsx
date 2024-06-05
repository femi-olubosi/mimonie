import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PageView } from '@/components/Reusable';
import { DateTimeSelector, SelectInput } from '../../components/Reusable';

const dateOption = [
  'en-US',
  {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
];

const CreateContribution = () => {
  const [contributionName, setContributionName] = useState('');
  const [groupCategory, setGroupCategory] = useState('');
  const [commencementDate, setCommencementDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState('Select a category');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const router = useRouter();

  const handleConfirm = () => {
    // Logic to handle the creation of the contribution
    setModalVisible(true);
  };

  const handleDateChange = () => {};

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  return (
    <PageView title={'Create Contribution'}>
      <View style={styles.container}>
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
              options={categoryOptions}
              selectedValue={selectedValue}
              setSelectedValue={setSelectedValue}
              defaultValue={selectedValue}
            />
          </View>

          <View style={{ rowGap: 14 }}>
            <Text style={styles.label}>Commencement Date</Text>
            <Pressable
              style={[
                styles.input,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
              ]}
              onPress={toggleDatePicker}
            >
              <TextInput
                value={date.toLocaleDateString(...dateOption)}
                placeholder="MM / DD / YYYY"
              />
              <DateTimeSelector
                show={showDatePicker}
                setShow={setShowDatePicker}
                date={date}
                setDate={handleDateChange}
                mode={'date'}
              />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
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
                Invite friends to join using the link below:
              </Text>
              <Text style={styles.inviteLink}>
                https://app.com/invite/12345
              </Text>
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
  button: {
    backgroundColor: '#006EBD',
    borderRadius: 12,
    // padding: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
});

export default CreateContribution;

const categoryOptions = [
  {
    label: 'Platinum',
    value: 'Platinum',
  },
  {
    label: 'Gold',
    value: 'Gold',
  },
  {
    label: 'Silver',
    value: 'Sliver',
  },
];

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';

const PersonalInformation = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [infoItems, setInfoItems] = useState([
    { label: 'Full Name', value: '', placeholder: 'Jimoh Alfonso' },
    { label: 'Phone Number', value: '', placeholder: '+234 0X17 XX4 24X3' },
    { label: 'Date of Birth', value: '', placeholder: '30 July 1950' },
    {
      label: 'Contact Address',
      value: '',
      placeholder: '200, Kilode Close, Ajangbadi, Lagos',
    },
    { label: 'Occupation', value: '', placeholder: 'Cab Driver' },
    {
      label: 'Income Range',
      value: '',
      placeholder: 'N100,000 - N200,000/month',
    },
    { label: 'County of Origin', value: '', placeholder: 'Nigeria' },
    { label: 'County of Residence', value: '', placeholder: 'Nigeria' },
  ]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (value, index) => {
    const updatedItems = [...infoItems];
    updatedItems[index].value = value;
    setInfoItems(updatedItems);
  };

  const handleSubmit = () => {
    setIsEditing(false);
    // Add your submit handling logic here
    console.log('Submitted data:', infoItems);
  };

  const isProfileComplete = infoItems.every((item) => item.value.trim() !== '');

  const renderItem = ({ item, index }) => (
    <View style={styles.infoContainer}>
      <Text style={styles.label}>{item.label}</Text>
      <TextInput
        style={styles.value}
        value={item.value}
        onChangeText={(value) => handleInputChange(value, index)}
        editable={isEditing}
        placeholder={item.placeholder}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="black"
          onPress={() => router.back()}
        />
        <View>
          <Text style={[styles.headerTitle, { marginBottom: 5 }]}>
            Personal Information
          </Text>
          {isEditing ? (
            <Text style={[styles.label, { textAlign: 'center' }]}>
              Editing...
            </Text>
          ) : !isProfileComplete ? (
            <Text style={[styles.label, { textAlign: 'center' }]}>
              Complete your profile
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={handleEditToggle}
          style={{
            backgroundColor: isEditing ? Colors.pri : 'transparent',
            padding: isEditing ? 4 : 0,
            borderRadius: 4,
          }}
        >
          <AntDesign
            name="edit"
            size={20}
            color={isEditing ? 'white' : 'black'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <FlatList
          data={infoItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
        {isEditing && (
          <View style={styles.buttonContainer}>
            <Button
              title={'Update'}
              color={Colors.pri}
              onPress={handleSubmit}
              outline={true}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
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
    padding: 16,
    height: 100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  infoContainer: {
    marginBottom: 16,
    padding: 16,
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
  },
  buttonContainer: {
    padding: 16,
    width: '50%',
    alignSelf: 'center',
  },
});

export default PersonalInformation;

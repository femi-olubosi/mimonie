import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useGlobalContext } from '../../store/StoreContext';
import { topBar } from '../../cStyle';
import { PageView } from '../../components/Reusable';

const PersonalInformation = () => {
  const { currentUser } = useGlobalContext();
  const router = useRouter();

  return (
    <PageView title={'Personal Information'} right={true}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>{'Full Name'}</Text>
            <TextInput
              style={styles.value}
              value={currentUser.name ?? 'Complete your profile'}
              editable={false}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>{'Phone Number'}</Text>
            <TextInput
              style={styles.value}
              value={currentUser.phone_number ?? 'Complete your profile'}
              editable={false}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>{'Date of Birth'}</Text>
            <TextInput
              style={styles.value}
              value={currentUser.birthdate ?? 'Complete your profile'}
              editable={false}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>{'Contact Address'}</Text>
            <TextInput
              style={styles.value}
              value={currentUser.address ?? 'Complete your profile'}
              editable={false}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>{'Occupation'}</Text>
            <TextInput
              style={styles.value}
              value={
                currentUser['custom:occupation'] ?? 'Complete your profile'
              }
              editable={false}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>{'Income Range'}</Text>
            <TextInput
              style={styles.value}
              value={
                currentUser['custom:income_from'] +
                ' - ' +
                currentUser['custom:income_to']
              }
              editable={false}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>{'Country of Origin'}</Text>
            <TextInput
              style={styles.value}
              value={
                currentUser['custom:country_of_origin'] ??
                'Complete your profile'
              }
              editable={false}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>{'Country of Residence'}</Text>
            <TextInput
              style={styles.value}
              value={
                currentUser['custom:country_of_residence'] ??
                'Complete your profile'
              }
              editable={false}
            />
          </View>
        </ScrollView>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
    marginBottom: 16,
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
  },
  buttonContainer: {
    padding: 16,
    width: '50%',
    alignSelf: 'center',
  },
});

export default PersonalInformation;

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import { PageView } from '@/components/Reusable';
import { Colors } from '@/constants/Colors';

const Mimonie = () => {
  const { currentUser } = useGlobalContext();
  const router = useRouter();

  // Dummy data for contributions
  const [contributions] = useState([
    {
      id: '1',
      name: 'Contribution 1',
      dateCreated: '2023-01-01',
      amount: '$100',
      numContributors: 10,
      currentMonth: 'June',
      targetMonth: 'December',
      nextContributionDate: '2023-07-01',
      userRole: 'Creator',
      isCreator: true,
      status: 'Open',
      createdBy: 'Sammy Oboma',
    },
    {
      id: '2',
      name: 'Contribution 2',
      dateCreated: '2023-02-01',
      amount: '$200',
      numContributors: 5,
      currentMonth: 'June',
      targetMonth: 'November',
      nextContributionDate: '2023-07-15',
      userRole: 'Invitee',
      isCreator: false,
      status: 'Closed',
      createdBy: 'Sammy Oboma',
    },
  ]);

  const renderContribution = ({ item }) => (
    <TouchableOpacity
      style={styles.contributionContainer}
      onPress={() => router.push(`/protected/contribution_details`)}
    >
      <Text style={styles.contributionName}>{item.name}</Text>
      <View style={styles.contributionInfo}>
        <Text style={styles.contributionAmount}>{item.amount}</Text>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: item.status === 'Open' ? 'green' : 'gray',
          }}
        >
          <Text style={styles.contributionStatus}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.contributionInfo}>
        <Text style={styles.contributionAmount}>{item.dateCreated}</Text>
        <Text style={styles.contributionAmount}>By: {item.createdBy}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <PageView title={'My Contributions'} backIcon={false}>
      <View style={{ flex: 1, padding: 20 }}>
        <FlatList
          data={contributions}
          renderItem={renderContribution}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/protected/create_contribution')}
        >
          <AntDesign name="plus" size={24} color="white" />
          <Text style={styles.buttonText}>Create New Contribution</Text>
        </TouchableOpacity>
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
  listContent: {
    paddingBottom: 20,
  },
  contributionContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    rowGap: 10,
  },
  contributionName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  contributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributionAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  contributionStatus: {
    fontSize: 14,
    color: 'white',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: Colors.pri,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default Mimonie;

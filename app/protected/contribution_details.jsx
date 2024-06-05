import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PageView } from '../../components/Reusable';

const contributions = [
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
  },
];

const ContributionDetails = () => {
  const { id } = useLocalSearchParams();
  const contribution = contributions.find((item) => item.id === '1');

  if (!contribution) {
    return (
      <PageView title={'Contribution Details'} right={true}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Contribution not found</Text>
        </View>
      </PageView>
    );
  }

  return (
    <PageView title={'Contribution Details'} right={true}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{contribution.name}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Date Created</Text>
            <Text style={styles.value}>{contribution.dateCreated}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>{contribution.amount}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Number of Contributors</Text>
            <Text style={styles.value}>{contribution.numContributors}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Current Month</Text>
            <Text style={styles.value}>{contribution.currentMonth}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Target Month</Text>
            <Text style={styles.value}>{contribution.targetMonth}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Next Contribution Date</Text>
            <Text style={styles.value}>
              {contribution.nextContributionDate}
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>User Role</Text>
            <Text style={styles.value}>{contribution.userRole}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Is Creator</Text>
            <Text style={styles.value}>
              {contribution.isCreator ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{contribution.status}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  detailContainer: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default ContributionDetails;

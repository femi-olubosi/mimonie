import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PageView } from '@/components/Reusable';
import { useGlobalContext } from '../../../store/StoreContext';
import Button from '../../../components/Button';
import { deleteContribution } from '../../../api/contributions.service';

const ContributionDetails = () => {
  const { contributions } = useGlobalContext();
  const { id } = useLocalSearchParams();
  const contribution = contributions.find((item) => item.id === id);

  const handleDelete = async () => {
    await deleteContribution(id);
    router.push('/protected/mimonie');
  };

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
            <Text style={styles.value}>{contribution.createdAt}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>{contribution.amount}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Number of Contributors</Text>
            <Text style={styles.value}>{contribution.participant.length}</Text>
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
        <View>
          <Button
            title={'Delete Contribution'}
            color={'red'}
            onPress={handleDelete}
            outline={false}
          />
        </View>
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
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'ir',
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'ib',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default ContributionDetails;

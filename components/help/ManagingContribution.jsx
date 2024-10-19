import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

const ManagingContribution = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>How to Manage Your Contributions</Text>

      <Text style={styles.sectionTitle}>Step 1: View Your Contributions</Text>
      <Text style={styles.text}>
        Navigate to the **Contributions** section to see your ongoing and
        completed contributions.
      </Text>

      <Text style={styles.sectionTitle}>Step 2: Join a Contribution Group</Text>
      <Text style={styles.text}>
        Join a group by clicking the invite link shared by the organizer.
        Confirm the details to join.
      </Text>

      <Text style={styles.sectionTitle}>Step 3: Create a New Contribution</Text>
      <Text style={styles.text}>
        Go to the **Create Contribution** section, fill in the required details,
        and invite participants.
      </Text>

      <Text style={styles.sectionTitle}>Step 4: Track Progress</Text>
      <Text style={styles.text}>
        Track your contribution status, how much has been contributed, and how
        much remains.
      </Text>

      <Text style={styles.sectionTitle}>Step 5: Make Payments</Text>
      <Text style={styles.text}>
        Pay your contribution using your saved card or set up automatic payments
        to avoid missing cycles.
      </Text>

      <Text style={styles.sectionTitle}>Step 6: Withdraw Funds</Text>
      <Text style={styles.text}>
        When it’s your turn to collect, make sure your bank details are correct
        to withdraw funds.
      </Text>

      <Text style={styles.sectionTitle}>
        Step 7: Review Contribution History
      </Text>
      <Text style={styles.text}>
        View the history of all contributions made and received to stay on
        track.
      </Text>

      <Text style={styles.text}>
        For further assistance, visit the Help section or contact support.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.pri,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
});

export default ManagingContribution;

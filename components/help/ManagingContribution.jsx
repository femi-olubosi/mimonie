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
        Contributions will be automatically deducted from your linked card. Make
        sure your card has sufficient funds at each deduction interval.
      </Text>

      <Text style={styles.sectionTitle}>Step 6: Collection</Text>
      <Text style={styles.text}>
        When it’s your turn to collect, Funds will be deposited into your linked
        bank account within 24 hours of your withdrawal request.
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

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

const ManagingPersonalContribution = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        How to Manage Your Personal Contributions
      </Text>

      <Text style={styles.sectionTitle}>
        Step 1: Create a Personal Contribution
      </Text>
      <Text style={styles.text}>
        Navigate to the **Personal Contribution** section. Enter the target
        amount, contribution frequency, and the amount you’ll contribute at each
        interval. This will help you reach your financial goals.
      </Text>

      <Text style={styles.sectionTitle}>Step 2: Track Your Progress</Text>
      <Text style={styles.text}>
        Monitor your progress by checking how much you’ve contributed and how
        close you are to achieving your target. You can view this in the
        **Contribution Dashboard**.
      </Text>

      <Text style={styles.sectionTitle}>Step 3: Make Contributions</Text>
      <Text style={styles.text}>
        Contributions will be automatically deducted from your linked card. Make
        sure your card has sufficient funds at each deduction interval.
      </Text>

      <Text style={styles.sectionTitle}>Step 4: Set Up a Withdrawal Pin</Text>
      <Text style={styles.text}>
        Set up a 6-digit pin to secure your withdrawals from the app.
      </Text>

      <Text style={styles.sectionTitle}>Step 5: Withdraw Your Funds</Text>
      <Text style={styles.text}>
        Once you’ve reached your target, you can withdraw your funds. Funds will
        be deposited into your linked bank account within 24 hours of your
        withdrawal request.
      </Text>

      <Text style={styles.sectionTitle}>Step 6: Early Withdrawals</Text>
      <Text style={styles.text}>
        If you withdraw before reaching your target, you’ll be subject to an
        early withdrawal fee of 10%. Please review your options before making an
        early withdrawal.
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

export default ManagingPersonalContribution;

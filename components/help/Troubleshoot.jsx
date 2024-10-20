import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

const TroubleshootingHelp = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Troubleshooting Common Issues</Text>

      <Text style={styles.sectionTitle}>Can't Receive Verification Code</Text>
      <Text style={styles.text}>
        Ensure your phone has a stable network connection and that you entered
        the correct phone number.
      </Text>

      <Text style={styles.sectionTitle}>Unable to Complete a Transaction</Text>
      <Text style={styles.text}>
        Verify your card details, internet connection, and balance before
        attempting the transaction again.
      </Text>

      <Text style={styles.sectionTitle}>
        Contribution Not Showing in My Account
      </Text>
      <Text style={styles.text}>
        Refresh your contributions list and ensure the transaction was completed
        successfully.
      </Text>

      <Text style={styles.sectionTitle}>App Crashing or Not Loading</Text>
      <Text style={styles.text}>
        Update the app to the latest version or try reinstalling the app.
      </Text>

      <Text style={styles.sectionTitle}>
        Verification Issues (BVN, NIN, Bank)
      </Text>
      <Text style={styles.text}>
        Ensure your BVN, NIN, or bank account details are correct and match your
        registered information.
      </Text>

      <Text style={styles.sectionTitle}>Forgot Your Transfer PIN</Text>
      <Text style={styles.text}>
        Reset your transfer PIN via the Account Settings or contact support for
        help.
      </Text>

      <Text style={styles.sectionTitle}>Failed Withdrawals</Text>
      <Text style={styles.text}>
        Double-check your bank details and balance before trying again. Reach
        out to support for assistance.
      </Text>

      <Text style={styles.sectionTitle}>Push Notifications Not Working</Text>
      <Text style={styles.text}>
        Ensure notifications are enabled in both your device settings and the
        Mimonie app.
      </Text>

      <Text style={styles.sectionTitle}>
        Linking a New Bank Account or Card
      </Text>
      <Text style={styles.text}>
        Ensure all entered details are correct and match your profile
        information.
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

export default TroubleshootingHelp;

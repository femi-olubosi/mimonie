import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

const VerificationHelp = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>How to Complete Verifications</Text>

      <Text style={styles.sectionTitle}>
        Step 1: Email Address Verification
      </Text>
      <Text style={styles.text}>
        Verify your email address by entering the 6-digit code sent to your
        email.
      </Text>

      <Text style={styles.sectionTitle}>Step 2: Phone Number Verification</Text>
      <Text style={styles.text}>
        Verify your phone number by entering the 6-digit code sent to your
        phone.
      </Text>

      <Text style={styles.sectionTitle}>Step 3: BVN Verification</Text>
      <Text style={styles.text}>
        Verify your BVN by entering your bank verification number in the Account
        Settings.
      </Text>

      <Text style={styles.sectionTitle}>Step 4: NIN Verification</Text>
      <Text style={styles.text}>
        Verify your identity by entering your National Identity Number (NIN) in
        the Account Settings.
      </Text>

      <Text style={styles.sectionTitle}>Step 5: Bank Verification</Text>
      <Text style={styles.text}>
        Add your bank account by selecting your bank and entering your account
        number.
      </Text>

      <Text style={styles.sectionTitle}>Step 6: Card Verification</Text>
      <Text style={styles.text}>
        Link your debit card to enable automatic contributions and payments.
      </Text>

      <Text style={styles.sectionTitle}>Step 7: Monitoring Verifications</Text>
      <Text style={styles.text}>
        Monitor your verification status in the Account Settings and re-verify
        if required.
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
    fontFamily: 'ib',
    color: Colors.pri,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'im',
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    fontFamily: 'ir',
  },
});

export default VerificationHelp;

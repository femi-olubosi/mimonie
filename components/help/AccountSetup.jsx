import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

const AccountSetup = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>How to Set Up Your Mimonie Account</Text>

      <Text style={styles.sectionTitle}>Step 1: Register Your Account</Text>
      <Text style={styles.text}>
        Create your account using your email, phone number, and password.
      </Text>

      <Text style={styles.sectionTitle}>Step 2: Verify Your Email Address</Text>
      <Text style={styles.text}>
        Enter the verification code sent to your email address for email
        verification.
      </Text>

      <Text style={styles.sectionTitle}>Step 3: Verify Your Phone Number</Text>
      <Text style={styles.text}>
        Enter the verification code sent to your phone via SMS.
      </Text>

      <Text style={styles.sectionTitle}>Step 4: Verify Your Identity</Text>
      <Text style={styles.text}>
        In the **Account** section, provide your BVN and valid ID for identity
        verification.
      </Text>

      <Text style={styles.sectionTitle}>Step 5: Add a Bank Card</Text>
      <Text style={styles.text}>
        In the **Payment** section, link your bank card for contributions and
        withdrawals.
      </Text>

      <Text style={styles.sectionTitle}>Step 6: Join Network of Friends</Text>
      <Text style={styles.text}>
        Invite people to your trust circle or accept connection request. It is
        recommended that you have a minimum of 4 connections before you can
        create a contribution
      </Text>

      <Text style={styles.sectionTitle}>Step 7: Start Contributing</Text>
      <Text style={styles.text}>
        Join or create a contribution group to start participating.
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

export default AccountSetup;

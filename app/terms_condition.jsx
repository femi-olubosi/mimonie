import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { PageView } from '../components/Reusable';

const TermsAndConditions = () => {
  return (
    <PageView title={'Terms and Conditions'}>
      <View style={styles.container}>
        <ScrollView style={{}} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}></Text>
          <Text style={styles.lastUpdated}>Last updated: 20-102024</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing or using Mimonie, you agree to the terms and conditions
            outlined in this agreement. These terms apply to all users of the
            app, including users who are vendors, buyers, contributors, or
            simply viewers of the content.
          </Text>

          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.text}>
            - To use certain features of the app, you must create an account.
            {'\n'}- You are responsible for maintaining the confidentiality of
            your login credentials.
            {'\n'}- You agree to provide accurate, current, and complete
            information during the registration process.
          </Text>

          <Text style={styles.sectionTitle}>3. Contributions and Payments</Text>
          <Text style={styles.text}>
            - Users can create, join, and manage contributions within the app.
            {'\n'}- Payments are handled through third-party payment gateways,
            and by using Mimonie, you agree to be bound by the payment
            provider’s terms and conditions.
            {'\n'}- You are responsible for ensuring that all payments made
            through Mimonie are authorized and comply with all applicable laws.
          </Text>

          <Text style={styles.sectionTitle}>4. Privacy Policy</Text>
          <Text style={styles.text}>
            Your privacy is important to us. Our Privacy Policy explains how we
            collect, use, and protect your personal information. By using the
            app, you consent to the collection and use of your data as outlined
            in the Privacy Policy.
          </Text>

          <Text style={styles.sectionTitle}>5. Prohibited Activities</Text>
          <Text style={styles.text}>
            You agree not to:
            {'\n'}- Use the app for any unlawful purpose.
            {'\n'}- Misrepresent your identity or impersonate any person or
            entity.
            {'\n'}- Interfere with the security of the app or attempt to gain
            unauthorized access to the system.
            {'\n'}- Violate any applicable laws or regulations while using
            Mimonie.
          </Text>

          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.text}>
            We reserve the right to terminate or suspend your account at any
            time for violation of these terms. Upon termination, you must stop
            using the app and all services.
          </Text>

          <Text style={styles.sectionTitle}>7. Dispute Resolution</Text>
          <Text style={styles.text}>
            In case of any disputes arising from or related to the use of the
            app, both parties agree to attempt to resolve them informally. If
            informal resolution is not possible, the disputes will be settled in
            accordance with the laws of [Insert Jurisdiction].
          </Text>

          <Text style={styles.sectionTitle}>
            8. Changes to Terms and Conditions
          </Text>
          <Text style={styles.text}>
            We reserve the right to modify these terms at any time. Users will
            be notified of any significant changes, and continued use of the app
            after such changes implies acceptance of the modified terms.
          </Text>
        </ScrollView>
      </View>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'esb',
    color: Colors.pri,
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'esb',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'justify',
  },
  contact: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

export default TermsAndConditions;

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { PageView } from '@/components/Reusable';
import { Colors } from '@/constants/Colors';

const PrivacySecurityScreen = () => {
  return (
    <PageView title="Privacy & Security">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Data Collection</Text>
        <Text style={styles.paragraph}>
          We prioritize the security of your data and ensure that all
          information collected during your usage of the app is kept
          confidential. Any personal data you provide, such as your name, email,
          and payment details, is encrypted and stored securely on our servers.
        </Text>

        <Text style={styles.sectionTitle}>Third-Party Sharing</Text>
        <Text style={styles.paragraph}>
          We do not share your personal data with any third parties unless it is
          necessary for the operation of the services you use, such as payment
          processing or fraud prevention. We ensure that any third-party
          services adhere to strict data protection regulations.
        </Text>

        <Text style={styles.sectionTitle}>Account Security</Text>
        <Text style={styles.paragraph}>
          To keep your account secure, we encourage you to enable two-factor
          authentication (2FA) and use a strong, unique password. If you notice
          any suspicious activity in your account, please contact our support
          team immediately.
        </Text>

        <Text style={styles.sectionTitle}>Encryption</Text>
        <Text style={styles.paragraph}>
          All communication between your device and our servers is encrypted
          using industry-standard encryption protocols (SSL/TLS). This ensures
          that your data is (protected) against unauthorized access.
        </Text>

        <Text style={styles.sectionTitle}>Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to access, update, and delete your personal
          information at any time. If you wish to exercise any of these rights,
          you can do so through your account settings or by contacting our
          support team.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any concerns about your privacy or the security of your
          data, feel free to reach out to us via the support section of the app.
          We are committed to resolving any issues as quickly as possible.
        </Text>
      </ScrollView>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.pri,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: Colors.darkGray,
  },
  paragraph: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 10,
  },
});

export default PrivacySecurityScreen;

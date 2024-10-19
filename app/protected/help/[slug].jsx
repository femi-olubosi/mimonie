import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PageView } from '@/components/Reusable';
import AccountSetup from '../../../components/help/AccountSetup';
import ManagingContribution from '../../../components/help/ManagingContribution';
import VerificationHelp from '../../../components/help/Verification';
import TroubleshootingHelp from '../../../components/help/Troubleshoot';

const help = () => {
  const { slug } = useLocalSearchParams();

  const render = () => {
    switch (slug) {
      case 'Account Setup':
        return <AccountSetup />;
      case 'Contributions Help':
        return <ManagingContribution />;
      case 'Verification Help':
        return <VerificationHelp />;
      case 'Troubleshooting Help':
        return <TroubleshootingHelp />;
      case 'transfer':
        return <Text>Transfer</Text>;
      case 'contact-support':
        return <Text>Contact Support</Text>;
      case 'faq':
        return <Text>FAQ</Text>;
      default:
        return <AccountSetup />;
    }
  };
  return (
    <PageView title={slug}>
      <View style={styles.container}>{render()}</View>
    </PageView>
  );
};

export default help;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});

import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Button from '../../../components/Button';
import Container from '../../../components/Container';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

const Account = () => {
  const { signOut } = useAuthenticator();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Container>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Button
            title={'Sign Out'}
            color={'red'}
            onPress={() => signOut()}
            outline={false}
          />
        </View>
      </Container>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({});

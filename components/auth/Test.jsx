import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { Amplify } from 'aws-amplify';
import {
  Authenticator,
  ThemeProvider,
  useAuthenticator,
  useTheme,
} from '@aws-amplify/ui-react-native';
import { Colors } from '@/constants/Colors';

// import awsconfig from './aws-exports';
// Amplify.configure(awsconfig);

const MyAppHeader = () => {
  const {
    tokens: { space, fontSizes },
  } = useTheme();
  return <View></View>;
};

function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button onPress={signOut} title="Sign Out" />;
}

function Test() {
  const {
    tokens: { colors },
  } = useTheme();

  return (
    <ThemeProvider
      theme={{
        tokens: {
          colors: {
            primary: {
              10: '{colors.pink.10}',
              20: '{colors.pink.20}',
              40: '{colors.pink.40}',
              60: '{colors.pink.60}',
              80: '{colors.pink.80}',
              90: '{colors.pink.90}',
              100: '{colors.pink.100}',
            },
          },
        },
      }}
    >
      <Authenticator.Provider>
        <Authenticator
          // will wrap every subcomponent
          Container={(props) => (
            // reuse default `Container` and apply custom background
            <Authenticator.Container
              {...props}
              style={{ backgroundColor: 'white' }}
            />
          )}
          // will render on every subcomponent
          Header={MyAppHeader}
        >
          <View style={style.container}>
            <SignOutButton />
          </View>
        </Authenticator>
      </Authenticator.Provider>
    </ThemeProvider>
  );
}

const style = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default Test;

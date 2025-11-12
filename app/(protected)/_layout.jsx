import { View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react-native';
import { router, Stack } from 'expo-router';
import LoginForm from '../../components/auth/LoginForm';
import SignUp from '../../components/auth/SignUpForm';
import { formFields } from '../../data/authFormField';
import { StatusBar } from 'expo-status-bar';
import UserInactivityProvider from '../../components/UserInactivityProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import ForgotPassword from '../../components/auth/ForgotPassword';
import ConfirmForgotPassword from '../../components/auth/ConfirmResetPassword';

const ProtectedLayout = () => {
  return (
    <ThemeProvider
      theme={{
        tokens: {
          colors: {
            primary: {
              10: '#ffffff',
              20: '#ffffff',
              40: '#ffffff',
              60: '#ffffff',
              80: '#ffffff',
              90: '#ffffff',
              100: '#ffffff',
            },
            font: {
              primary: '#FFFFFF',
              secondary: '#FFFFFF',
              tertiary: '#FFFFFF',
            },
            input: {
              background: '#FFFFFF',
              color: Colors.pri,
              border: '#FFFFFF',
              placeholder: '#87CEFA',
            },
            border: {
              primary: '#FFFFFF',
            },
            button: {
              primary: {
                color: Colors.pri,
                borderColor: '#FFFFFF',
              },
            },
          },

          radii: {
            small: 8,
            medium: 12,
          },
        },
      }}
    >
      <Authenticator.Provider>
        <ProtectedContent />
      </Authenticator.Provider>
    </ThemeProvider>
  );
};

export default ProtectedLayout;

const ProtectedContent = () => {
  useEffect(() => {
    const loadSignupData = async () => {
      try {
        const data = await AsyncStorage.getItem('local_details');
        if (data) {
          const signupData = JSON.parse(data);
          if (!signupData.email_verified) {
            router.replace('/email_verify');
          }
        }
      } catch (error) {
        console.error('Error reading signup_details:', error);
      }
    };

    loadSignupData();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Authenticator
        formFields={formFields}
        Container={(props) => (
          <Authenticator.Container {...props} style={styles.container} />
        )}
        components={{
          SignIn: (props) => {
            return <LoginForm {...props} />;
          },
          SignUp: (props) => {
            return <SignUp {...props} />;
          },
          ForgotPassword: (props) => {
            return <ForgotPassword {...props} />;
          },
          ConfirmResetPassword: (props) => {
            return <ConfirmForgotPassword {...props} />;
          },
        }}
        services={{
          handleSignUp: async ({ username, password, attributes }) => {
            console.log(username, password, attributes);
          },
          handleSignIn: async ({ username, password }) => {
            console.log(username, password);
          },
        }}
      >
        <UserInactivityProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="personal_info"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile_edit"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="groups" options={{ headerShown: false }} />
            <Stack.Screen
              name="mimonie/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="help/[slug]" options={{ headerShown: false }} />
            <Stack.Screen
              name="create_contribution"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="cards" options={{ headerShown: false }} />
            <Stack.Screen name="paystack" options={{ headerShown: false }} />
            <Stack.Screen name="kyc" options={{ headerShown: false }} />
            <Stack.Screen
              name="transfer_screen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="complete_profile"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="verification_check"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="notifications"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="bvn" options={{ headerShown: false }} />
            <Stack.Screen
              name="login_verify"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="flow" options={{ headerShown: false }} />
            <Stack.Screen name="my_invites" options={{ headerShown: false }} />
            <Stack.Screen name="my_network" options={{ headerShown: false }} />
            <Stack.Screen name="faq" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="support" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
            <Stack.Screen name="smile_id" options={{ headerShown: false }} />
            <Stack.Screen name="take_selfie" options={{ headerShown: false }} />
            <Stack.Screen name="upload_doc" options={{ headerShown: false }} />
            <Stack.Screen name="blog" options={{ headerShown: false }} />
            <Stack.Screen
              name="completed_screen"
              options={{ headerShown: false }}
            />
          </Stack>
        </UserInactivityProvider>
      </Authenticator>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.pri,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  footerText: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

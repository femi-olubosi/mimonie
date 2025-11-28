import { View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import {
  Authenticator,
  ThemeProvider,
  useAuthenticator,
} from '@aws-amplify/ui-react-native';
import { router, Stack } from 'expo-router';
import LoginForm from '../../components/auth/LoginForm';
import SignUp from '../../components/auth/SignUpForm';
import { formFields } from '../../data/authFormField';
import { StatusBar } from 'expo-status-bar';
import UserInactivityProvider from '../../components/UserInactivityProvider';
import { Colors } from '../../constants/Colors';
import ForgotPassword from '../../components/auth/ForgotPassword';
import ConfirmForgotPassword from '../../components/auth/ConfirmResetPassword';
import { fetchCurrUser } from '../../api/user.service';
import { useGlobalContext } from '../../store/StoreContext';
import { sendOtp } from '../../api/token.service';

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
  const { route } = useAuthenticator((context) => [context.route]);
  const { setCurrentUser, setConfirmationResult } = useGlobalContext();

  useEffect(() => {
    const loadSignupData = async () => {
      try {
        const data = await fetchCurrUser(setCurrentUser);
        if (!data) return;

        if (!data.email_verified) {
          return router.replace('/email_verify');
        }

        if (!data.name) {
          return router.replace('/(protected)/complete_profile');
        }

        const phoneVerified =
          data.phone_number_verified || data['custom:phone_verified'];

        if (!phoneVerified) {
          const res = await sendOtp(data?.phone_number);
          setConfirmationResult({ ...res, type: 'phone_verification' });
          router.replace('/(protected)/verification_check');
        }
      } catch (error) {
        console.error('Error reading signup_details:', error);
      }
    };

    if (route === 'authenticated') {
      loadSignupData();
    }
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

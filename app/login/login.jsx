import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image } from 'react-native';
import LoginForm from '../../components/auth/LoginForm';
import { Colors } from '../../constants/Colors';
import { Auth } from 'aws-amplify';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../../src/amplifyconfiguration.json';
Amplify.configure(amplifyconfig);
const Login = () => {
  const handleLogin = async (username, password) => {
    // Handle login logic here
    console.log(`Username: ${username}, Password: ${password}`);
    try {
      const user = await Auth.signIn(username, password);
    } catch (error) {
      console.log('error signing in', error);
    }
  };

  // import { Authenticator } from '@aws-amplify/ui-react-native';

  return (
    <View style={styles.safeArea}>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.pri,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../assets/logo/mimonie-logo.png')}
          style={{ width: 120, height: 120 }}
        />
      </View>
      <View
        style={{
          flex: 2,
          borderRadius: 10,
          paddingTop: 10,
          backgroundColor: 'white',
        }}
      >
        <LoginForm onSubmit={handleLogin} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.pri,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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

export default Login;

// const components = {
//   Header() {
//     const { tokens } = useTheme();

//     return (
//       <View textAlign="center" padding={tokens.space.large}>
//         <Image
//           alt="Amplify logo"
//           src="https://docs.amplify.aws/assets/logo-dark.svg"
//         />
//       </View>
//     );
//   },

//   Footer() {
//     const { tokens } = useTheme();

//     return (
//       <View textAlign="center" padding={tokens.space.large}>
//         <Text color={tokens.colors.neutral[80]}>
//           &copy; All Rights Reserved
//         </Text>
//       </View>
//     );
//   },

//   SignIn: {
//     Header() {
//       const { tokens } = useTheme();

//       return (
//         <Heading
//           padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
//           level={3}
//         >
//           Login
//         </Heading>
//       );
//     },
//     Footer() {
//       const { toForgotPassword } = useAuthenticator();

//       return (
//         <View textAlign="center">
//           <Button
//             fontWeight="normal"
//             onClick={toForgotPassword}
//             size="small"
//             variation="link"
//           >
//             Reset Password
//           </Button>
//         </View>
//       );
//     },
//   },

//   SignUp: {
//     Header() {
//       const { tokens } = useTheme();

//       return (
//         <Heading
//           padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
//           level={3}
//         >
//           Create a new account
//         </Heading>
//       );
//     },
//     Footer() {
//       const { toSignIn } = useAuthenticator();

//       return (
//         <View textAlign="center">
//           <Button
//             fontWeight="normal"
//             onClick={toSignIn}
//             size="small"
//             variation="link"
//           >
//             Back to Sign In
//           </Button>
//         </View>
//       );
//     },
//   },
//   ConfirmSignUp: {
//     Header() {
//       const { tokens } = useTheme();
//       return (
//         <Heading
//           padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
//           level={3}
//         >
//           Enter Information:
//         </Heading>
//       );
//     },
//     Footer() {
//       return <Text>Footer Information</Text>;
//     },
//   },
//   SetupTotp: {
//     Header() {
//       const { tokens } = useTheme();
//       return (
//         <Heading
//           padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
//           level={3}
//         >
//           Enter Information:
//         </Heading>
//       );
//     },
//     Footer() {
//       return <Text>Footer Information</Text>;
//     },
//   },
//   ConfirmSignIn: {
//     Header() {
//       const { tokens } = useTheme();
//       return (
//         <Heading
//           padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
//           level={3}
//         >
//           Enter Information:
//         </Heading>
//       );
//     },
//     Footer() {
//       return <Text>Footer Information</Text>;
//     },
//   },
//   ForgotPassword: {
//     Header() {
//       const { tokens } = useTheme();
//       return (
//         <Heading
//           padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
//           level={3}
//         >
//           Enter Information:
//         </Heading>
//       );
//     },
//     Footer() {
//       return <Text>Footer Information</Text>;
//     },
//   },
//   ConfirmResetPassword: {
//     Header() {
//       const { tokens } = useTheme();
//       return (
//         <Heading
//           padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
//           level={3}
//         >
//           Enter Information:
//         </Heading>
//       );
//     },
//     Footer() {
//       return <Text>Footer Information</Text>;
//     },
//   },
// };

// const formFields = {
//   signIn: {
//     username: {
//       placeholder: 'Enter your username',
//     },
//   },
//   signUp: {
//     password: {
//       label: 'Password:',
//       placeholder: 'Enter your Password:',
//       isRequired: false,
//       order: 2,
//     },
//     confirm_password: {
//       label: 'Confirm Password:',
//       order: 1,
//     },
//   },
//   forceNewPassword: {
//     password: {
//       placeholder: 'Enter your Password:',
//     },
//   },
//   forgotPassword: {
//     username: {
//       placeholder: 'Enter your email:',
//     },
//   },
//   confirmResetPassword: {
//     confirmation_code: {
//       placeholder: 'Enter your Confirmation Code:',
//       label: 'New Label',
//       isRequired: false,
//     },
//     confirm_password: {
//       placeholder: 'Enter your Password Please:',
//     },
//   },
//   setupTotp: {
//     QR: {
//       totpIssuer: 'test issuer',
//       totpUsername: 'amplify_qr_test_user',
//     },
//     confirmation_code: {
//       label: 'New Label',
//       placeholder: 'Enter your Confirmation Code:',
//       isRequired: false,
//     },
//   },
//   confirmSignIn: {
//     confirmation_code: {
//       label: 'New Label',
//       placeholder: 'Enter your Confirmation Code:',
//       isRequired: false,
//     },
//   },
// };

// export default function App() {
//   return (
//     <Authenticator formFields={formFields} components={components}>
//       {({ signOut }) => <button onClick={signOut}>Sign out</button>}
//     </Authenticator>
//   );
// }

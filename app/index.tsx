import { StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import Login from './login/login';
import { Authenticator } from '@aws-amplify/ui-react-native';

const index = () => {
  return <Redirect href={'/protected'} />;
  // return (
  //   <Authenticator.Provider>
  //     <Login />
  //   </Authenticator.Provider>
  // );
};

export default index;

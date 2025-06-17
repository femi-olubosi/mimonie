import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { Redirect, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { fetchCurrUser, fetchProfile } from '../../api/user.service';

const index = () => {
  const { authStatus, signOut, user } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [targetRedirectPath, setTargetRedirectPath] = useState(null);
  const pathname = usePathname();

  const { noAuth } = useGlobalContext();

  // useEffect(() => {
  //   let isMounted = true;

  //   const runInitialChecks = async () => {
  //     if (authStatus === 'authenticated' && !targetRedirectPath) {
  //       setLoadingInitialData(true);
  //       try {
  //         const profile = await fetchProfile(user);

  //         if (profile) {
  //           setTargetRedirectPath('/(tabs)');
  //         }
  //       } catch (error) {
  //         if (isMounted) {
  //           noAuth();
  //           signOut();
  //           setLoadingInitialData(false);
  //         }
  //       } finally {
  //         if (isMounted) {
  //           setLoadingInitialData(false);
  //         }
  //       }
  //     } else if (authStatus !== 'authenticated') {
  //       if (isMounted) {
  //         noAuth();
  //         signOut();
  //         setLoadingInitialData(false);
  //       }
  //     }
  //   };

  //   runInitialChecks();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [authStatus, targetRedirectPath]);

  // if (loadingInitialData) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         backgroundColor: Colors.pri,
  //       }}
  //     >
  //       <ActivityIndicator size="large" color={'white'} />
  //       <Text style={{ fontSize: 12, color: 'white', marginTop: 5 }}>
  //         Preparing Profiles
  //       </Text>
  //     </View>
  //   );
  // }

  // if (targetRedirectPath && pathname !== targetRedirectPath) {
  //   return <Redirect href={targetRedirectPath} />;
  // }

  return <Redirect href={'/(tabs)'} />;
};

export default index;

// const runInitialChecks = async () => {
//   if (authStatus === 'authenticated' && !targetRedirectPath) {
//     setLoadingInitialData(true);
//     try {
//       const path = await fetchAndCheckUser(
//         setCurrentUser,
//         setConfirmationResult,
//         setUserActivities,
//         setProfilePicture,
//         setUserProfile
//       );

//       if (isMounted) {
//         setTargetRedirectPath(path);
//         console.log('ProtectedIndex: Path determined by helper:', path);
//       }
//     } catch (error) {
//       if (isMounted) {
//         noAuth();
//         signOut();
//         setLoadingInitialData(false);
//       }
//     } finally {
//       if (isMounted) {
//         setLoadingInitialData(false);
//       }
//     }
//   } else if (authStatus !== 'authenticated') {
//     if (isMounted) {
//       noAuth();
//       signOut();
//       setLoadingInitialData(false);
//     }
//   }
// };

import { fetchCurrUser, fetchUserProfile } from '@/api/user.service';
import { sendOtp } from '@/api/token.service';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

const index = () => {
  const { currentUser, setCurrentUser, setUserProfile, setConfirmationResult } =
    useGlobalContext();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetchCurrUser(setCurrentUser);
        const user = await fetchUserProfile(setUserProfile, res);

        if (!user.name) {
          router.push('/protected/complete_profile');
        } else if (!user?.phone_verified) {
          const res = await sendOtp(user.phone_number);
          setConfirmationResult({ ...res, type: 'phone_verification' });
          router.push('/verification_check');
        } else {
          console.log(user?.name);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.pri }}>
      <Redirect href={'/protected'} />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: 'red',
  },

  buttonUpdate: {
    backgroundColor: Colors.pri,
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

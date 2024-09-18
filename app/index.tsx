import { Colors } from '@/constants/Colors';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Text, Pressable } from 'react-native';

const index = () => {
  // const [updateAvailable, setUpdateAvailable] = useState(false);
  // async function onFetchUpdateAsync() {
  //   try {
  //     const update = await Updates.checkForUpdateAsync();

  //     if (update.isAvailable) {
  //       setUpdateAvailable(true);
  //       await Updates.fetchUpdateAsync();
  //       await Updates.reloadAsync();
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // useEffect(() => {
  //   if (!__DEV__) {
  //     onFetchUpdateAsync();
  //   }
  // }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.pri }}>
      {/* {updateAvailable ? (
        <View style={styles.centeredView}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={updateAvailable}
            onRequestClose={() => {
              setUpdateAvailable(false);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Update Available!</Text>
                <View
                  style={{ flexDirection: 'row', columnGap: 40, marginTop: 40 }}
                >
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => setUpdateAvailable(!updateAvailable)}
                  >
                    <Text style={styles.textStyle}>Not now</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonUpdate]}
                    onPress={() => onFetchUpdateAsync()}
                  >
                    <Text style={styles.textStyle}>Update</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      ) : ( */}
      <Redirect href={'/protected'} />
      {/* )} */}
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

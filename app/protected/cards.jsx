import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { PageView } from '../../components/Reusable';
import { Colors } from '../../constants/Colors';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { Paystack } from 'react-native-paystack-webview';
import { router } from 'expo-router';
import { useGlobalContext } from '../../store/StoreContext';
import { deleteCards, fetchCards } from '../../api/payment.service';
import { getBankLogo } from '../../utils/bankLogo';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';

const Cards = () => {
  const [userCards, setUserCards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { currentUser, setIsLoading } = useGlobalContext();
  const [pushObj, setPushObj] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchCards(setUserCards, currentUser);
  }, []);

  const handleAddCardPress = () => {
    setModalVisible(true);
  };

  const handlePay = () => {
    setModalVisible(false);
    router.push('/protected/paystack');
  };

  const handleDeleteCard = async () => {
    setIsLoading(true);
    try {
      await deleteCards(pushObj.id, setUserCards, currentUser);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  const renderCards = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{ flexDirection: 'row', columnGap: 20, alignItems: 'center' }}
        >
          <Image
            source={getBankLogo(item.bank)}
            style={{ width: 50, height: 50 }}
          />
          <View style={{ rowGap: 5 }}>
            <Text style={{ fontSize: 16, fontFamily: 'ir' }}>{item.bank}</Text>

            <Text style={{ alignSelf: 'flex-end' }}>
              ********{item.last4}
              {'  '}
              {capitalizeFirstLetter(item.type)}
            </Text>
          </View>
        </View>
        <FontAwesome
          name="trash"
          size={24}
          color="red"
          onPress={() => setPushObj(item)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <PageView title={'Bank Cards'} route={'/protected/account'}>
      <View style={{ flex: 1, padding: 20 }}>
        <FlatList
          data={userCards}
          renderItem={renderCards}
          keyExtractor={(item, id) => id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddCardPress}>
          <AntDesign name="plus" size={24} color="white" />
          <Text style={styles.buttonText}>Add a Bank Card</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text
              style={[styles.modalText, { lineHeight: 25, fontFamily: 'ir' }]}
            >
              Adding a card requires a charge of 50 Naira for verification. Do
              you wish to continue?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: 'red' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePay}
              >
                <Text style={[styles.modalButtonText, { color: Colors.pri }]}>
                  Pay Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text
              style={[styles.modalText, { lineHeight: 25, fontFamily: 'ir' }]}
            >
              Are you sure you want to delete your {pushObj.bank} card
            </Text>
            <Text
              style={[
                styles.modalText,
                {
                  lineHeight: 25,
                  fontFamily: 'ir',
                  fontSize: 12,
                  color: 'gray',
                },
              ]}
            >
              This will affect your contribution progress
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: 'red' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteCard}
              >
                <Text style={[styles.modalButtonText, { color: Colors.pri }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </PageView>
  );
};

export default Cards;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  contributionContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    rowGap: 10,
  },
  contributionName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  contributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributionAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  contributionStatus: {
    fontSize: 14,
    color: 'white',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: Colors.pri,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '70%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    // backgroundColor: 'gray',
  },
  confirmButton: {
    // backgroundColor: Colors.pri,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

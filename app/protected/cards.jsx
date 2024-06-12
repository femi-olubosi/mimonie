import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { PageView } from '../../components/Reusable';
import { Colors } from '../../constants/Colors';
import { AntDesign } from '@expo/vector-icons';
import { Paystack } from 'react-native-paystack-webview';
import { router } from 'expo-router';

const Cards = () => {
  const [userCards, setUserCards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const renderContribution = ({ item }) => {
    const createdAtDate = new Date(item.createdAt);

    return (
      <TouchableOpacity
        style={styles.contributionContainer}
        onPress={() => router.push(`/protected/mimonie/${item.id}`)}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={styles.contributionName}>{item.name}</Text>
          <Text style={{ fontSize: 10 }}>{item.category}</Text>
        </View>
        <View style={styles.contributionInfo}>
          <Text style={styles.contributionAmount}>{item.amount}</Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: item.status === 'open' ? 'green' : 'gray',
            }}
          >
            <Text style={styles.contributionStatus}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.contributionInfo}>
          <Text style={styles.contributionAmount}>
            {createdAtDate.toLocaleDateString()}
          </Text>
          <Text style={styles.contributionAmount}>By: {item.owner}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddCardPress = () => {
    setModalVisible(true);
  };

  const handlePay = () => {
    setModalVisible(false);
    router.push('/protected/paystack');
  };

  return (
    <PageView title={'Bank Cards'}>
      <View style={{ flex: 1, padding: 20 }}>
        <FlatList
          data={userCards}
          renderItem={renderContribution}
          keyExtractor={(item) => item.id}
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
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePay}
              >
                <Text style={styles.modalButtonText}>Pay Now</Text>
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
    width: '80%',
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
    backgroundColor: 'gray',
  },
  confirmButton: {
    backgroundColor: Colors.pri,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

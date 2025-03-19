import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
} from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { getBankLogo } from '@/utils/bankLogo';
import { Colors } from '../../constants/Colors';

const Banks = ({
  setAddBankModal,
  handleDeleteCard,
  handleSelectCard,
  bankDetails,
}) => {
  const renderBanks = (item) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: 'gray',
          paddingVertical: 5,
        }}
        key={item.id}
        onPress={() => handleSelectCard(item)}
      >
        <View
          style={{ flexDirection: 'row', columnGap: 10, alignItems: 'center' }}
        >
          <View style={{ width: 20 }}>
            {item.status === 'active' && (
              <AntDesign name="check" size={22} color={Colors.pri} />
            )}
          </View>
          <Image
            source={getBankLogo(item.bank_name)}
            style={{
              width: 40,
              height: 40,
              objectFit: 'contain',
            }}
          />
          <View style={{ rowGap: 5, marginLeft: 10 }}>
            <Text style={{ fontSize: 14, fontFamily: 'ir' }}>
              {item.bank_name}
            </Text>

            <Text style={{ fontSize: 12 }}>{item.bank_number}</Text>
          </View>
        </View>
        <FontAwesome
          name="trash"
          size={24}
          color="red"
          onPress={() => {
            Alert.alert(
              'Delete Bank Account',
              'Are you sure you want to delete this bank account?',
              [
                {
                  text: 'Yes',
                  onPress: () => handleDeleteCard(item),
                  style: 'destructive',
                },
                { text: 'No', style: 'cancel' },
              ]
            );
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={{ minHeight: '20%', width: '100%' }}>
        {bankDetails.length > 0 ? (
          bankDetails.map((item) => {
            return renderBanks(item);
          })
        ) : (
          <Text style={{ textAlign: 'center' }}>
            You dont have any account to transfer to
          </Text>
        )}
      </View>
      <Button
        title="Add Bank Account"
        onPress={() => setAddBankModal(true)}
        color={Colors.pri}
      />
    </View>
  );
};

export default Banks;

const styles = StyleSheet.create({});

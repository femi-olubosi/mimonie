import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { naira } from '@/constants/Currency';
import { Colors } from '../../../constants/Colors';

const Balance = ({ participantList, amount, contribution }) => {
  // const canGetAllFunds = contribution.cu;
  // const withdrawable = new Intl.NumberFormat('en-US').format(
  //   participantList?.[0]?.balance - amount
  // );

  return (
    <>
      {participantList?.[0]?.balance || participantList?.[0]?.balance === 0 ? (
        <View
          style={{
            height: 100,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.pri,
            marginVertical: 20,
            padding: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={styles.label}>Total Balance:</Text>
            <Text
              style={{
                fontSize: 30,
                color: Colors.pri,
                fontFamily: 'isb',
              }}
            >
              {naira}{' '}
              {new Intl.NumberFormat('en-US').format(
                participantList?.[0]?.balance
              )}
            </Text>
          </View>
          {/* <View>
            <Text style={styles.label}>Withdrawable Balance:</Text>
            <Text
              style={{
                fontSize: 24,
                color: Colors.pri,
                fontFamily: 'isb',
              }}
            >
              {naira} {withdrawable}
            </Text>
          </View> */}
        </View>
      ) : null}
    </>
  );
};

export default Balance;

const styles = StyleSheet.create({});

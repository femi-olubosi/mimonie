import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { naira } from '@/constants/Currency';
import { Colors } from '../../../constants/Colors';

const Balance = ({ parsed }) => {
  return (
    <>
      {parsed?.[0]?.balance || parsed?.[0]?.balance === 0 ? (
        <View
          style={{
            height: 100,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.pri,
            marginVertical: 20,
            padding: 20,
          }}
        >
          <Text style={styles.label}>Withdrawable Balance:</Text>
          <Text
            style={{
              fontSize: 40,
              color: Colors.pri,
              fontFamily: 'isb',
            }}
          >
            {naira}{' '}
            {new Intl.NumberFormat('en-US').format(parsed?.[0]?.balance)}
          </Text>
        </View>
      ) : null}
    </>
  );
};

export default Balance;

const styles = StyleSheet.create({});

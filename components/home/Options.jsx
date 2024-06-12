import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';

const Options = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
      }}
    >
      <Pressable
        style={{ rowGap: 5, justifyContent: 'center', alignItems: 'center' }}
        onPress={() => router.push('/protected/groups')}
      >
        <Image
          source={require('../../assets/logo/group.png')}
          style={{ width: 33.5, height: 21.8 }}
        />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Groups</Text>
      </Pressable>
      <Pressable
        style={{ rowGap: 5, justifyContent: 'center', alignItems: 'center' }}
      >
        <Image
          source={require('../../assets/logo/bill.png')}
          style={{ width: 22, height: 22 }}
        />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Pay bills</Text>
      </Pressable>
      <Pressable
        style={{
          rowGap: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <AntDesign name="question" size={25} color="black" />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Help/FAQ</Text>
      </Pressable>
    </View>
  );
};

export default Options;

const styles = StyleSheet.create({});

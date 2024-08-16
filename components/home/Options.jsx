import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { processContributions } from '@/api/payment.service';

const Options = () => {
  // const tryNow = async () => {
  //   console.log('start');
  //   // return;
  //   const res = await processContributions();
  //   console.log('res', res);
  // };
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
        onPress={() => router.push('/protected/my_network')}
      >
        <FontAwesome6 name="people-roof" size={23} color="#555555" />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>My Network</Text>
      </Pressable>
      <Pressable
        style={{
          rowGap: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        // onPress={tryNow}
        // onPress={() => router.push('/protected/flow')}
      >
        <AntDesign name="question" size={25} color="black" />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Help/FAQ</Text>
      </Pressable>
    </View>
  );
};

export default Options;

const styles = StyleSheet.create({});

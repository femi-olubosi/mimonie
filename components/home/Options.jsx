import { Pressable, Text, View } from 'react-native';
import React from 'react';
import {
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';

const Options = ({ priText, setShowHelp, connect, pilot }) => {
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
        onPress={() => setShowHelp(true)}
      >
        <MaterialIcons name="support-agent" size={23} color="#555555" />
        <Text style={{ fontSize: 14, fontFamily: 'im', color: priText }}>
          Help
        </Text>
      </Pressable>
      <Pressable
        style={{
          rowGap: 5,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
        onPress={() => router.push('/protected/my_network')}
      >
        <View
          style={{
            width: 15,
            height: 15,
            borderRadius: 100,
            backgroundColor: 'red',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            right: 20,
            top: 0,
            zIndex: 10,
          }}
        >
          <Text style={{ fontSize: 8, fontFamily: 'ir', color: 'white' }}>
            {connect}
          </Text>
        </View>

        <FontAwesome6 name="people-roof" size={23} color="#555555" />
        <Text style={{ fontSize: 14, fontFamily: 'im', color: priText }}>
          My Trust Circle
        </Text>
      </Pressable>
      <Pressable
        style={{
          rowGap: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => router.push('/protected/faq')}
      >
        <MaterialCommunityIcons
          name="frequently-asked-questions"
          size={25}
          color={priText}
        />
        <Text style={{ fontSize: 14, fontFamily: 'im', color: priText }}>
          FAQ
        </Text>
      </Pressable>
    </View>
  );
};

export default Options;

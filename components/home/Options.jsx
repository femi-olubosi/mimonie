import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { processContributions } from '@/api/payment.service';

const Options = ({ userProfile }) => {
  const [parsedConnect, setParsedConnect] = useState([]);

  useEffect(() => {
    const safeParseJSON = (data, fallback) => {
      try {
        return JSON.parse(data);
      } catch (e) {
        return fallback;
      }
    };

    if (userProfile?.connections) {
      const parsedData = safeParseJSON(userProfile?.connections, []);
      setParsedConnect(parsedData);
    }
  }, [userProfile]);

  const pendingConnections = parsedConnect?.filter(
    (e) => e.type === 'request' && e.status === 'pending'
  );
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
            {pendingConnections?.length}
          </Text>
        </View>
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
        onPress={() => router.push('/protected/faq')}
      >
        <AntDesign name="question" size={25} color="black" />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Help/FAQ</Text>
      </Pressable>
    </View>
  );
};

export default Options;

const styles = StyleSheet.create({});

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  AntDesign,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { CopilotStep, walkthroughable } from 'react-native-copilot';

const CopilotPressable = walkthroughable(View);

const Options = ({ userProfile, priText, setShowHelp, connect, pilot }) => {
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

  // const networkText =
  //   connect && connect > 0 && connect < 5
  //     ? `Please connect with ${5 - connect} more friend${
  //         5 - connect > 1 ? 's' : ''
  //       } to start contributing. You currently have ${connect} connection${
  //         connect > 1 ? 's' : ''
  //       }.`
  //     : 'Open the Networks section to start connecting with friends from your contacts. Building connections is essential to creating or participating in contributions seamlessly.';

  const networkText =
    'Open the Networks section to start connecting with friends from your contacts. Building connections is essential to creating or participating in contributions seamlessly.';

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
      <CopilotStep
        text={networkText}
        order={2}
        name="networks"
        active={pilot.network}
        // active={true}
      >
        <CopilotPressable>
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
              My Network
            </Text>
          </Pressable>
        </CopilotPressable>
      </CopilotStep>
      <Pressable
        style={{
          rowGap: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        // onPress={tryNow}
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

const styles = StyleSheet.create({});

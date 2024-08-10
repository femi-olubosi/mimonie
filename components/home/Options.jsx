import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { get } from 'aws-amplify/api';
import { post } from 'aws-amplify/api';
import { useGlobalContext } from '@/store/StoreContext';
import {
  chargeAndSplitPayment,
  initialize,
  processContributions,
  testTrigger,
  verify,
  verifyBVN,
} from '@/api/payment.service';

const opt = {
  timestamp: '2018-03-13T21:04:11.193Z',
  signature: '5445722f5af1791eb434949cce9a88dd321e5959fd24a8562ecb12bb00c33fe',
  job_complete: true,
  job_success: true,
  result: {
    ResultText: 'Enroll User',
    SmileJobID: '0000001897',
    PartnerParams: {
      job_id: '52d0de86-be3b-4219-9e96-8195b0018944',
      user_id: 'e54e0e98-8b8c-4215-89f5-7f9ea42bf650',
      job_type: 4,
    },
    ConfidenceValue: '100',
  },
  image_links: {
    selfie_image:
      'https://smile-fr-results.s3.us-west-2.amazonaws.com/test/000000/023/023-0000001897-LoRSpxJUzmYgYS2R00XpaHJYLOiNXN/SID_Preview_FULL.jpg',
  },
  code: '2302',
  history: [
    {
      ResultCode: '1210',
      ResultText: 'Enroll User',
      SmileJobID: '0000000857',
      PartnerParams: {
        job_id: '52d0de86-be3b-4219-9e96-8195b0018944',
        user_id: '1511bf02-801a-4b57-ac8e-ef17e26bfeb4',
        job_type: '1',
        optional_info:
          'Partner can put whatever they want as long as it is a string',
        more_optional_info:
          'There can be as much or as little or no optional info',
      },
    },
    {
      ResultCode: '0814',
      ResultText: 'Provisional Enroll - Under Review',
      SmileJobID: '0000000857',
      ConfidenceValue: '97',
      PartnerParams: {
        job_id: '52d0de86-be3b-4219-9e96-8195b0018944',
        user_id: '1511bf02-801a-4b57-ac8e-ef17e26bfeb4',
        job_type: '1',
        optional_info:
          'Partner can put whatever they want as long as it is a string',
        more_optional_info:
          'There can be as much or as little or no optional info',
      },
    },
    {
      DOB: '1990-01-01',
      IDType: 'BVN',
      Country: 'Nigeria',
      FullName: 'Peter Parker',
      ExpirationDate: 'Not Available',
      IDNumber: 'A01234567',
      ResultCode: '1012',
      ResultText: 'ID Validated',
      SmileJobID: '0000000857',
      PartnerParams: {
        job_id: '52d0de86-be3b-4219-9e96-8195b0018944',
        user_id: '1511bf02-801a-4b57-ac8e-ef17e26bfeb4',
        job_type: '1',
        optional_info:
          'Partner can put whatever they want as long as it is a string',
        more_optional_info:
          'There can be as much or as little or no optional info',
        ExpirationDate: 'Not Available',
      },
    },
  ],
};
const Options = () => {
  const { userProfile, currentUser } = useGlobalContext();
  async function getTodo() {
    try {
      const restOperation = get({
        apiName: 'callback',
        path: '/smileid-callback',
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      console.log('Get call succeeded');
      console.log(response);
    } catch (e) {
      console.log('POST call failed: ', JSON.parse(e.response.body));
    }
  }

  const tryOut = async () => {
    if (userProfile.name !== 'Sherif-deen Abdur-roheem') {
      return;
    }
    await processContributions();
  };

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
        // onPress={() => router.push('/protected/complete_profile')}
        // onPress={getTodo}
        onPress={tryOut}
      >
        <Image
          source={require('../../assets/logo/bill.png')}
          style={{ width: 22, height: 22 }}
        />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Terms</Text>
      </Pressable>
      <Pressable
        style={{
          rowGap: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
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

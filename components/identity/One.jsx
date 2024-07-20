import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Button from '../Button';
import { Colors } from '../../constants/Colors';
import { router } from 'expo-router';

const One = ({ setStep }) => {
  return (
    <View
      style={{
        flex: 1,
        rowGap: 60,
        alignItems: 'center',
      }}
    >
      <Text style={{ textAlign: 'center', maxWidth: 300, fontFamily: 'im' }}>
        To verify your identity, we will need a quick selfie and yout ID
        information
      </Text>

      <View style={{ rowGap: 40, width: '100%', paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            columnGap: 20,
          }}
        >
          <View>
            <Image
              source={require('../../assets/images/id.jpeg')}
              style={{ width: 50, height: 40 }}
            />
          </View>
          <View style={{ rowGap: 4, flex: 1 }}>
            <Text style={{ fontSize: 18, fontFamily: 'im' }}>Valid ID</Text>
            <Text style={{ fontSize: 12, fontFamily: 'ir' }}>
              Make sure yuo provide valid ID images that belongs to you
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            columnGap: 20,
          }}
        >
          <View style={{}}>
            <Image
              source={require('../../assets/images/selfie.jpeg')}
              style={{ width: 50, height: 40 }}
            />
          </View>
          <View style={{ rowGap: 4, flex: 1 }}>
            <Text style={{ fontSize: 18, fontFamily: 'im' }}>Selfie Image</Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'ir',
                // width: 250,
              }}
            >
              Take a clear photos. Ensure the selfies & scans of the ID card
              yousubmit is clear and not blurry
            </Text>
          </View>
        </View>
      </View>
      <View style={{ alignItems: 'center', rowGap: 10 }}>
        <Button
          title={'I am ready'}
          color={Colors.pri}
          onPress={() => setStep(2)}
          styleOverride={{ paddingHorizontal: 40 }}
        />
        <Pressable onPress={() => router.push('/protected')}>
          <Text style={{ color: 'red', fontSize: 16, fontFamily: 'ir' }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default One;

const styles = StyleSheet.create({});

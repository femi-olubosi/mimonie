import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';

export const CardOne = () => {
  return (
    <Pressable
      style={[styles.card, { overflow: 'hidden', position: 'relative' }]}
    >
      <ThemedView
        style={{
          backgroundColor: 'transparent',
          rowGap: 5,
          paddingLeft: 10,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: 'white',
            fontFamily: 'isb',
            lineHeight: 20,
          }}
        >
          This App is for{'\n'}automating your Esusu{'\n'}(Ajo) contributions.
        </Text>
        <Text
          style={{
            fontSize: 22,
            color: 'white',
            fontFamily: 'isb',
          }}
        >
          Only invite{'\n'}people you{'\n'}know and{'\n'}trust.
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            columnGap: 5,
            backgroundColor: '#ffffff5b',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: 'white', fontFamily: 'ib' }}>
            Slide to continue
          </Text>
          <AntDesign name="arrowright" size={20} color="white" />
        </TouchableOpacity>
      </ThemedView>

      <Image
        source={require('@/assets/images/home-card.png')}
        style={{
          height: '100%',
          width: '55%',
          position: 'absolute',
          objectFit: 'cover',
          resizeMode: 'cover',
          right: 0,
        }}
      />
    </Pressable>
  );
};

export const CardTwo = () => {
  return (
    <Pressable
      style={[styles.card, { overflow: 'hidden', position: 'relative' }]}
    >
      <ThemedView
        style={{
          backgroundColor: 'transparent',
          rowGap: 5,
          paddingLeft: 10,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <View style={{ rowGap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              columnGap: 7,
            }}
          >
            <View
              style={{
                height: 10,
                width: 10,
                backgroundColor: 'white',
                borderRadius: 100,
                marginTop: 5,
              }}
            ></View>
            <Text
              style={{
                fontSize: 14,
                color: 'white',
                fontFamily: 'im',
              }}
            >
              Invite people you know{'\n'}and trust to your trust{'\n'}circle.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', columnGap: 7 }}>
            <View
              style={{
                height: 10,
                width: 10,
                backgroundColor: 'white',
                borderRadius: 100,
                marginTop: 5,
              }}
            ></View>
            <Text
              style={{
                fontSize: 14,
                color: 'white',
                fontFamily: 'im',
              }}
            >
              You will be able to invite{'\n'}people in your trust circle{'\n'}
              to your contribution.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', columnGap: 7 }}>
            <View
              style={{
                height: 10,
                width: 10,
                backgroundColor: 'white',
                borderRadius: 100,
                marginTop: 5,
              }}
            ></View>
            <Text
              style={{
                fontSize: 14,
                color: 'white',
                fontFamily: 'im',
              }}
            >
              People can also invite you{'\n'}to their contribution if{'\n'}you
              are in their trust circle.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: 5,
            backgroundColor: 'black',
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 5,
            width: 160,
          }}
          onPress={() => router.push(`/protected/my_network`)}
        >
          <Text style={{ color: 'white', fontFamily: 'ib' }}>
            Create Trust Circle
          </Text>
        </TouchableOpacity>
      </ThemedView>

      <Image
        source={require('@/assets/images/home-card.png')}
        style={{
          height: '100%',
          width: '48%',
          position: 'absolute',
          objectFit: 'cover',
          resizeMode: 'cover',
          right: 0,
        }}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  noContributionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    width: 200,
  },
  noContributionsText: {
    fontSize: 16,
    color: 'gray',
    fontFamily: 'ir',
  },
  card: {
    backgroundColor: '#C13A00',
    borderRadius: 10,
    marginStart: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    paddingRight: 95,
    minWidth: 280,
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
});

import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { getMonthsAfter } from '@/utils/getMonthsAfter';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { naira } from '@/constants/Currency';
import { FontAwesome6 } from '@expo/vector-icons';
import { useGlobalContext } from '@/store/StoreContext';
import { router } from 'expo-router';

const Cards = ({ contributions }) => {
  const { currentUser } = useGlobalContext();

  return (
    <ThemedView style={styles.container}>
      {contributions.length === 0 ? (
        <View
          style={{
            width: 200,
            height: 200,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            rowGap: 20,
          }}
        >
          <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'er' }}>
            You are not in any contribution
          </Text>
          <Pressable
            style={{
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: Colors.pri,
            }}
            onPress={() => router.push('/protected/create_contribution')}
          >
            <Text style={{ color: 'white' }}>Click to Create one</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={contributions}
          renderItem={({ item }) => {
            const num_of_contributions = 0;
            // console.log(JSON.parse(item.participant).index);
            // JSON.parse(item.participant[0])[0]?.contributions?.length || 0;
            return (
              <ThemedView
                style={[
                  styles.card,
                  { overflow: 'hidden', position: 'relative' },
                ]}
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
                    style={{ fontSize: 12, color: 'white', fontFamily: 'isb' }}
                  >
                    {item.name} by: {item.owner}
                  </Text>
                  <View style={{ rowGap: 2 }}>
                    <Text
                      style={{ fontSize: 12, color: 'white', fontFamily: 'im' }}
                    >
                      Group: {item.category}
                    </Text>
                    <Text
                      style={[styles.text, { fontSize: 12, fontFamily: 'isb' }]}
                    >
                      Duration: {item.num_of_month} months
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'white',
                        fontFamily: 'isb',
                      }}
                    >
                      Target:{' '}
                      <FontAwesome6 name="naira-sign" size={12} color="white" />
                      {item.target}
                    </Text>
                    <Text
                      style={[
                        styles.text,
                        { fontSize: 10, fontFamily: 'ir', marginTop: 2 },
                      ]}
                    >
                      Collect on{' '}
                      {item.status !== 'running'
                        ? ' (Not running yet)'
                        : getMonthsAfter(item.start_date, item.num_of_month)}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingVertical: 5,
                      rowGap: Platform.OS === 'android' ? 0 : 3,
                    }}
                  >
                    <Text
                      style={[styles.text, { fontSize: 12, fontFamily: 'ir' }]}
                    >
                      {num_of_contributions} contribution(s) so far
                    </Text>
                    <Text
                      style={[styles.text, { fontSize: 32, fontFamily: 'esb' }]}
                    >
                      <FontAwesome6 name="naira-sign" size={28} color="white" />
                      {num_of_contributions * item.amount}.00
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.text,
                      { fontSize: 12, marginTop: 10, fontFamily: 'ir' },
                    ]}
                  >
                    Upcoming Contribution
                  </Text>
                  <Text
                    style={[styles.text, { fontSize: 16, fontFamily: 'em' }]}
                  >
                    <FontAwesome6 name="naira-sign" size={16} color="white" />
                    {item.amount}
                  </Text>
                  <Text
                    style={[styles.text, { fontSize: 10, fontFamily: 'ir' }]}
                  >
                    Due Date:
                    {item.status !== 'running'
                      ? ' Not running'
                      : ` 28th  ${new Date().toLocaleString('en-US', {
                          month: 'long',
                        })}`}
                  </Text>
                </ThemedView>

                <Image
                  source={require('../../assets/images/home-card.png')}
                  style={{
                    height: '100%',
                    width: '48%',
                    position: 'absolute',
                    objectFit: 'cover',
                    resizeMode: 'cover',
                    right: 0,
                  }}
                />
              </ThemedView>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
};

export default Cards;

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
    backgroundColor: Colors.pri,
    borderRadius: 10,
    marginStart: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    paddingRight: 95,
    minWidth: 300,
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
});

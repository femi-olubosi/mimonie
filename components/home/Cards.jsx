import { FlatList, Image, Pressable, StyleSheet, Text } from 'react-native';
import React from 'react';
import { cards } from '../../model/card_model';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { Link } from 'expo-router';

const Cards = () => {
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cards}
        renderItem={({ item }) => (
          <ThemedView
            style={[styles.card, { overflow: 'hidden', padding: 10 }]}
          >
            <ThemedView style={{ backgroundColor: Colors.pri, width: '70%' }}>
              <ThemedText
                style={{ fontSize: 12, color: 'white', fontFamily: 'ir' }}
              >
                {item.group}
              </ThemedText>
              <Text style={[styles.text, { fontSize: 13, fontFamily: 'fr' }]}>
                {item.group_stake}/month x {item.num_of_month}
              </Text>
              <Text style={{ fontSize: 18, color: 'white', fontFamily: 'ir' }}>
                Target:{' '}
                <FontAwesome6 name="naira-sign" size={16} color="white" />
                {item.target}
              </Text>
              <Text style={[styles.text, { fontSize: 12, fontFamily: 'ir' }]}>
                Collect on {item.due_date_final}
              </Text>
              <ThemedText
                style={[
                  styles.text,
                  { fontSize: 14, marginTop: 10, fontFamily: 'ir' },
                ]}
              >
                {item.num_of_contributions} contributions so far
              </ThemedText>
              <ThemedText
                type="defaultSemibold"
                style={[
                  styles.text,
                  { fontSize: 28, fontWeight: 'bold', fontFamily: 'fb' },
                ]}
              >
                <FontAwesome6 name="naira-sign" size={28} color="white" />
                {item.contributions}.00
              </ThemedText>
              <Text
                style={[
                  styles.text,
                  { fontSize: 14, marginTop: 16, fontFamily: 'ir' },
                ]}
              >
                Upcoming Contributions
              </Text>
              <Text
                style={[styles.text, { fontWeight: '700', fontFamily: 'fsb' }]}
              >
                <FontAwesome6 name="naira-sign" size={16} color="white" />
                {item.upcoming}
              </Text>
              <Text style={[styles.text, { fontSize: 12, fontFamily: 'ir' }]}>
                Due {item.due_date_next}
              </Text>
            </ThemedView>
            <Link href={'/login'}>
              <ThemedText type="link" style={{ color: 'white' }}>
                Press
              </ThemedText>
            </Link>
            <Image
              source={require('../../assets/images/home-card.png')}
              style={{ position: 'absolute', right: 0, resizeMode: 'cover' }}
            />
          </ThemedView>
        )}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default Cards;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: Colors.pri,
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    width: 350,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    color: 'white',
  },
});

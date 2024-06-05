import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import { cards } from '../../model/card_model';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { useGlobalContext } from '@/store/StoreContext';

const Cards = () => {
  const { currentUser } = useGlobalContext();
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cards}
        renderItem={({ item }) => (
          <ThemedView
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
              <Text style={{ fontSize: 12, color: 'white', fontFamily: 'isb' }}>
                {currentUser.preferred_username}'s Contribution
              </Text>
              <View style={{ rowGap: 2 }}>
                <Text
                  style={{ fontSize: 12, color: 'white', fontFamily: 'im' }}
                >
                  Group: {item.group}
                </Text>
                <Text
                  style={[styles.text, { fontSize: 12, fontFamily: 'isb' }]}
                >
                  Duration: {item.num_of_month} months
                </Text>
                <Text
                  style={{ fontSize: 12, color: 'white', fontFamily: 'isb' }}
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
                  Collect on {item.due_date_final}
                </Text>
              </View>
              <View
                style={{
                  paddingVertical: 5,
                  rowGap: Platform.OS === 'android' ? 0 : 3,
                }}
              >
                <Text style={[styles.text, { fontSize: 12, fontFamily: 'ir' }]}>
                  {item.num_of_contributions} contribution(s) so far
                </Text>
                <Text
                  style={[styles.text, { fontSize: 32, fontFamily: 'esb' }]}
                >
                  <FontAwesome6 name="naira-sign" size={28} color="white" />
                  {item.contributions}.00
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
              <Text style={[styles.text, { fontSize: 16, fontFamily: 'em' }]}>
                <FontAwesome6 name="naira-sign" size={16} color="white" />
                {item.upcoming}
              </Text>
              <Text style={[styles.text, { fontSize: 10, fontFamily: 'ir' }]}>
                Due {item.due_date_next}
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
    backgroundColor: 'white',
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
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
});

import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import Hide from '@/components/Hide';
import NextContributionDay from './components/NextContributionDay';
import { safeParseJSON } from '@/utils/safeJSON';
import { getCollectionDate } from '@/utils/savings_contribution_helper';

const Cards = ({ contributions }) => {
  const { userProfile, hideValues } = useGlobalContext();

  return (
    <ThemedView style={styles.container}>
      {contributions?.length === 0 ? (
        <View
          style={{
            width: 200,
            height: 200,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            rowGap: 20,
            zIndex: 1,
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
            const participants = safeParseJSON(item?.participant, []);
            const currentParticipant = participants?.find(
              (e) => e.userId === userProfile?.userId
            );

            return (
              <Pressable
                style={[
                  styles.card,
                  { overflow: 'hidden', position: 'relative' },
                ]}
                onPress={() => router.push(`/protected/mimonie/${item.id}`)}
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
                    {item.name} by: {item.owner.split(' ')[0]}
                  </Text>
                  <View style={{ rowGap: 2 }}>
                    <Text
                      style={{ fontSize: 12, color: 'white', fontFamily: 'im' }}
                    >
                      Category:{' '}
                      {item.type === 'group'
                        ? item.category
                        : 'Personal Savings'}
                    </Text>
                    <Text
                      style={[styles.text, { fontSize: 12, fontFamily: 'isb' }]}
                    >
                      Duration: {item.num_of_month} {item.variant}
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
                      {hideValues ? (
                        <Hide />
                      ) : (
                        <>{item.target.toLocaleString('en-US')}</>
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.text,
                        { fontSize: 10, fontFamily: 'ir', marginTop: 2 },
                      ]}
                    >
                      {item.type === 'group' ? 'Collect on' : 'Withdraw on'}{' '}
                      {item.status === 'open'
                        ? ' (Not running yet)'
                        : getCollectionDate(
                            item.start_date,
                            currentParticipant?.index,
                            item.variant,
                            item.num_of_month,
                            item.type
                          )}
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
                      {currentParticipant?.contributions} contribution(s) so far
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: 4,
                      }}
                    >
                      <FontAwesome6
                        name="naira-sign"
                        size={28}
                        color={'white'}
                      />
                      <Text
                        style={[
                          styles.text,
                          {
                            fontSize: 32,
                            fontFamily: 'esb',
                            color: 'white',
                          },
                        ]}
                      >
                        {hideValues ? (
                          <Hide size={14} />
                        ) : (
                          (
                            currentParticipant?.contributions * item.amount || 0
                          ).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        )}
                      </Text>
                    </View>
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
                    {['completed', 'closed'].includes(item?.status) ? (
                      'Completed'
                    ) : (
                      <>
                        <FontAwesome6
                          name="naira-sign"
                          size={16}
                          color="white"
                        />
                        {item.amount.toLocaleString('en-US')}
                      </>
                    )}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {
                      <NextContributionDay
                        contribution={item}
                        currentParticipant={currentParticipant}
                      />
                    }
                  </View>
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
              </Pressable>
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

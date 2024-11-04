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
import { Entypo, FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import Hide from '@/components/Hide';

const safeParseJSON = (data, fallback) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

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
            const done =
              currentParticipant?.contributions !== 0 &&
              currentParticipant?.contributions >= participants?.length - 1;
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
                            item.id,
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
                    ) : item.type === 'group' && done ? (
                      'Completed your part'
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
                    {item.type === 'group' && done ? null : (
                      <NextContributionDay
                        contribution={item}
                        done={done}
                        currentParticipant={currentParticipant}
                      />
                    )}
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

const parseDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
};

const NextContributionDay = ({ contribution, done, currentParticipant }) => {
  const updateMe =
    contribution?.current_count !== currentParticipant?.index &&
    currentParticipant?.last_successful_round < contribution?.current_count;

  const getNextDayOfWeek = (date, targetDay) => {
    const dayOfWeek = date.getDay();
    const daysUntilNextDay = (targetDay - dayOfWeek + 7) % 7 || 7;
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + daysUntilNextDay);
    return nextDay;
  };

  const getNextContributionDay = () => {
    if (contribution?.status === 'open') {
      return 'Not running';
    }

    if (['completed', 'closed'].includes(contribution?.status)) {
      return 'Completed';
    }

    if (contribution.type === 'group' && done) {
      return '';
    }

    const today = new Date();
    let nextContributionDay;

    const targetDayOfWeek =
      contribution?.id === 'eacd86aa-2c49-4d4e-a9b8-38036505b0ac' ? 3 : 1;

    // If currentParticipant is 'in progress', calculate the next round day after the current round
    if (currentParticipant?.status === 'in progress') {
      switch (contribution?.variant) {
        case 'days':
          nextContributionDay = new Date(today);
          nextContributionDay.setDate(today.getDate() + 2); // Day after tomorrow
          break;

        case 'weeks':
          nextContributionDay = getNextDayOfWeek(today, targetDayOfWeek); // Use dynamic day
          break;

        case 'months':
          nextContributionDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            28
          );
          if (today.getDate() > 28) {
            nextContributionDay.setMonth(today.getMonth() + 1);
          }
          nextContributionDay.setMonth(nextContributionDay.getMonth() + 1);
          break;

        default:
          nextContributionDay = 'Invalid contribution period';
      }

      return typeof nextContributionDay === 'string'
        ? nextContributionDay
        : nextContributionDay.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
          });
    }

    // If no special case, calculate the normal next contribution day
    if (updateMe) {
      return 'Today (Payment failed. Please check activity log)';
    }

    switch (contribution?.variant) {
      case 'days':
        nextContributionDay = new Date(today);
        nextContributionDay.setDate(today.getDate() + 1);
        break;

      case 'weeks':
        nextContributionDay = getNextDayOfWeek(today, targetDayOfWeek); // Use dynamic day
        break;

      case 'months':
        nextContributionDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          28
        );
        if (today.getDate() > 28) {
          nextContributionDay.setMonth(today.getMonth() + 1);
        }
        break;

      default:
        nextContributionDay = 'Invalid contribution period';
    }

    return typeof nextContributionDay === 'string'
      ? nextContributionDay
      : nextContributionDay.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
        });
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Text
        style={[
          styles.text,
          {
            fontSize: 10,
            fontFamily: 'ir',
            color: updateMe ? '#FF7F7F' : 'white',
          },
        ]}
      >
        Due Date: {getNextContributionDay()}
      </Text>
      {/* {updateMe && <Entypo name="back-in-time" size={10} color="#FF7F7F" />} */}
    </View>
  );
};

const getCollectionDate = (
  startDate,
  participantIndex,
  variant,
  contribution_id,
  num_of_month,
  type
) => {
  const start = new Date(startDate);
  let collectionDate;

  const targetDayOfWeek =
    contribution_id === 'eacd86aa-2c49-4d4e-a9b8-38036505b0ac' ? 3 : 1;

  if (type === 'personal') {
    switch (variant) {
      case 'days':
        collectionDate = new Date(start);
        collectionDate.setDate(start.getDate() + num_of_month);
        break;

      case 'weeks':
        collectionDate = new Date(start);
        collectionDate.setDate(start.getDate() + num_of_month * 7);
        break;

      case 'months':
        collectionDate = new Date(start);
        collectionDate.setMonth(start.getMonth() + num_of_month);
        break;

      default:
        collectionDate = 'Invalid contribution period';
    }
  } else {
    switch (variant) {
      case 'days':
        collectionDate = new Date(start);
        collectionDate.setDate(start.getDate() + participantIndex);
        break;

      case 'weeks':
        collectionDate = new Date(start);
        const daysUntilNextDay =
          (targetDayOfWeek - collectionDate.getDay() + 7) % 7 || 7;
        collectionDate.setDate(
          start.getDate() + daysUntilNextDay + (participantIndex - 1) * 7
        );
        break;

      case 'months':
        collectionDate = new Date(start);
        collectionDate.setMonth(start.getMonth() + participantIndex);
        collectionDate.setDate(28);
        break;

      default:
        collectionDate = 'Invalid contribution period';
    }
  }

  return collectionDate instanceof Date
    ? collectionDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
      })
    : collectionDate;
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

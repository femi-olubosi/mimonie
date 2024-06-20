import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PageView } from '@/components/Reusable';
import { useGlobalContext } from '../../../store/StoreContext';
import Button from '../../../components/Button';
import {
  deleteContribution,
  fetchUserContributions,
  joinContribution,
  updateContribution,
} from '../../../api/contributions.service';
import {
  AntDesign,
  FontAwesome,
  Fontisto,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { capitalizeFirstLetter } from '../../../utils/capitalizeFirstLetter';
import { statusCheck } from '../../../utils/statusCheck';
import { naira } from '../../../constants/Currency';
import { Colors } from '../../../constants/Colors';
import ContactModal from '../../../components/ContactModal';

const ContributionDetails = () => {
  const {
    contributions,
    setContributions,
    currentUser,
    userProfile,
    setIsLoading,
  } = useGlobalContext();
  const { id } = useLocalSearchParams();
  const contribution = contributions.find((item) => item.id === id);
  const [visible, setVisible] = useState(false);

  const handleJoinContribution = async () => {
    try {
      await joinContribution(
        contribution.id,
        currentUser,
        userProfile,
        setContributions
      );
      Alert.alert('Success', 'You have successfully joined the contribution');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleStartContribution = async () => {
    // const start_date = new Date().toISOString();
    setIsLoading(true);
    try {
      const start_date = null;
      const res = await updateContribution(contribution.id, { start_date });
      await fetchUserContributions(currentUser.userId, setContributions);
      alert('Update Success', `${res.name} contribution updated successfully}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startDate = new Date(contribution.start_date);

  useEffect(() => {
    (async () => {
      if (contribution.participant.length === contribution.num_of_month) {
        const updates = {
          status: 'running',
        };
        await updateContribution(contribution.id, updates);
      }
    })();
  }, [contribution]);

  const next = JSON.parse(contribution.participant[0]).filter(
    (e) => e.status !== 'recieved'
  );

  return (
    <PageView title={'Contribution Details'}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{contribution.name}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Date Started</Text>
            <Text style={styles.value}>
              {contribution.start_date
                ? startDate.toLocaleDateString()
                : 'Not running'}
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Status</Text>
            <View
              style={{
                backgroundColor: statusCheck(contribution.status),
                alignSelf: 'flex-start',
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 8,
              }}
            >
              <Text style={[styles.value, { color: 'white' }]}>
                {capitalizeFirstLetter(contribution.status)}
              </Text>
            </View>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>
              {naira}
              {new Intl.NumberFormat('en-US').format(contribution.amount)}
            </Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Target</Text>
            <Text style={styles.value}>
              {naira}
              {new Intl.NumberFormat('en-US').format(contribution.target)}
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Number of Contributors</Text>
            <Text style={styles.value}>{contribution.participant.length}</Text>
          </View>
          <View
            style={[
              {
                minHeight: 85,
                maxHeight: 120,
                marginBottom: 16,
                paddingHorizontal: 20,
                paddingTop: 20,
                backgroundColor: 'white',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              },
            ]}
          >
            <Text style={styles.label}>Contributors</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ rowGap: 8 }}
            >
              {contribution.participant?.map((e, id) => {
                const eN = JSON.parse(e)[0];
                return (
                  <View
                    key={id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        columnGap: 10,
                        alignItems: 'center',
                      }}
                    >
                      {eN.picture ? (
                        <Image
                          source={{ uri: eN.picture }}
                          style={{ width: 20, height: 20, borderRadius: 10 }}
                        />
                      ) : (
                        <FontAwesome name="user-circle-o" color={'gray'} />
                      )}
                      <Text style={{ fontFamily: 'ir' }}>{eN.name}</Text>
                      {eN.status === 'received' ? (
                        <Fontisto
                          name="checkbox-active"
                          size={14}
                          color="green"
                        />
                      ) : eN.status === 'in progress' ? (
                        <MaterialCommunityIcons
                          name="progress-check"
                          size={14}
                          color="yellow"
                        />
                      ) : (
                        <AntDesign name="minussquareo" size={14} color="gray" />
                      )}
                      {next[0].userId === eN.userId ? (
                        <Text style={{ color: 'lightgreen', fontFamily: 'ir' }}>
                          Next
                        </Text>
                      ) : null}
                    </View>
                    <Text style={{ fontFamily: 'ir' }}>{id + 1}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
          {/* 
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Current Month</Text>
            <Text style={styles.value}>{contribution.currentMonth}</Text>
          </View> */}
          {/* 
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Target Month</Text>
            <Text style={styles.value}>{contribution.targetMonth}</Text>
          </View> */}

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Next Contribution Day</Text>
            <Text style={styles.value}>
              {contribution.status !== 'running'
                ? ' Not running'
                : ` 28th  ${new Date().toLocaleString('en-US', {
                    month: 'long',
                  })}`}
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>User role</Text>
            <Text style={styles.value}>
              {contribution.owner === currentUser.preferred_username
                ? 'Creator'
                : 'invitee'}
            </Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Owner</Text>
            <Text style={styles.value}>{contribution.owner}</Text>
          </View>
        </ScrollView>
        <Pressable
          style={styles.fab}
          onPress={() => {
            if (contribution.start_date) {
              // Do nothing or handle if needed
            } else if (
              contribution.participant.length === contribution.num_of_month &&
              contribution.owner === currentUser.preferred_username
            ) {
              handleStartContribution();
            } else if (contribution.owner === currentUser.preferred_username) {
              setVisible(!visible);
            } else {
              handleJoinContribution();
            }
          }}
        >
          <Text style={styles.fabText}>
            {contribution.start_date
              ? 'Running'
              : contribution.participant.length === contribution.num_of_month
              ? 'Start'
              : contribution.owner === currentUser.preferred_username
              ? 'Invite'
              : 'Join'}
          </Text>
        </Pressable>
      </View>
      <ContactModal visible={visible} setVisible={setVisible} />
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailContainer: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'ir',
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'isb',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    minWidth: 60,
    minHeight: 60,
    padding: 4,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.pri,
    bottom: 10,
    right: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  fabText: {
    color: 'white',
    fontFamily: 'im', // Ensure this font is loaded in your project
  },
});

export default ContributionDetails;

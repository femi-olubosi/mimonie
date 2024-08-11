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
import { useRouter, useLocalSearchParams, router } from 'expo-router';
import { PageView } from '@/components/Reusable';
import { useGlobalContext } from '../../../store/StoreContext';
import {
  fetchUserContributions,
  findContributionByID,
  joinContribution,
  updateContribution,
} from '@/api/contributions.service';
import {
  AntDesign,
  FontAwesome,
  Fontisto,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { statusCheck } from '@/utils/statusCheck';
import { naira } from '@/constants/Currency';
import { Colors } from '@/constants/Colors';
import ContactModal from '@/components/ContactModal';
import { calculateDifference } from '@/api/payment.service';

const ContributionDetails = () => {
  const { setContributions, currentUser, userProfile, setIsLoading } =
    useGlobalContext();
  const { id } = useLocalSearchParams();
  const [visible, setVisible] = useState(false);
  const [contribution, setContribution] = useState({});
  const [parsed, setParsed] = useState([]);

  useEffect(() => {
    findContributionByID(id, setContribution);
  }, [id]);

  const handleJoinContribution = async () => {
    if (!userProfile.is_bvn_verified) {
      Alert.alert('Please verify your bvn');
      return;
    }

    if (!userProfile.is_nin_verified) {
      Alert.alert('Please verify your identity');
      return;
    }

    if (!userProfile.auth_url) {
      Alert.alert(
        'Sorry!!',
        'You cannot create contribution at the moment. Add a card to continue'
      );
      return;
    }

    if (
      parsed.some((participant) => participant.userId === currentUser.userId)
    ) {
      Alert.alert('Error', 'You are already a member of this contribution');
      return;
    }

    try {
      await joinContribution(
        contribution.id,
        currentUser,
        userProfile,
        setContributions
      );

      Alert.alert(
        'Success',
        'You have successfully joined the contribution',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleStartContribution = async () => {
    setIsLoading(true);
    try {
      const date = new Date();
      const start_date = date.toLocaleDateString('en-CA');

      const res = await updateContribution(contribution.id, {
        start_date: start_date,
        status: 'running',
      });
      await findContributionByID(id, setContribution);
      Alert.alert(
        'Contribution Started Successfully',
        `${res.name} contribution updated successfully}`
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startDate = new Date(contribution?.start_date);

  useEffect(() => {
    const safeParseJSON = (data, fallback) => {
      try {
        return JSON.parse(data);
      } catch (e) {
        return fallback;
      }
    };

    if (contribution) {
      const parsedData = safeParseJSON(contribution?.participant, []);
      setParsed(parsedData);
    }
  }, [contribution]);

  const next = parsed?.find((e) => e.status !== 'received');

  return (
    <PageView title={'Contribution Details'}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{contribution?.name}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Date Started</Text>
            <Text style={styles.value}>
              {contribution?.start_date
                ? startDate.toLocaleDateString()
                : 'Not running'}
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Status</Text>
            <View
              style={{
                backgroundColor: statusCheck(contribution?.status),
                alignSelf: 'flex-start',
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 8,
              }}
            >
              <Text style={[styles.value, { color: 'white' }]}>
                {capitalizeFirstLetter(contribution?.status)}
              </Text>
            </View>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>
              {naira}
              {new Intl.NumberFormat('en-US').format(contribution?.amount)}
            </Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Target</Text>
            <Text style={styles.value}>
              {naira}
              {new Intl.NumberFormat('en-US').format(contribution?.target)}
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.label}>Number of Contributors</Text>
            <Text style={styles.value}>{parsed.length}</Text>
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
              contentContainerStyle={{ rowGap: 8, paddingBottom: 10 }}
            >
              {parsed?.map((eN, id) => {
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
                      <FontAwesome name="user-circle-o" color={'gray'} />

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
                          color="#ecb753"
                        />
                      ) : (
                        <AntDesign name="minussquareo" size={14} color="gray" />
                      )}
                      {next?.userId === eN.userId ? (
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
          <NextContributionDay contribution={contribution} parsed={parsed} />
          <View style={styles.detailContainer}>
            <Text style={styles.label}>User role</Text>
            <Text style={styles.value}>
              {contribution?.owner === userProfile?.name
                ? 'Creator'
                : 'invitee'}
            </Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.label}>Owner</Text>
            <Text style={styles.value}>{contribution?.owner}</Text>
          </View>
        </ScrollView>
        {parsed.some(
          (participant) => participant.userId === currentUser.userId
        ) && contribution?.owner !== userProfile?.name ? null : (
          <Pressable
            style={styles.fab}
            onPress={() => {
              if (
                contribution?.status === 'running' ||
                contribution?.status === 'completed'
              ) {
                // Do nothing or handle if needed
              } else if (
                parsed?.length === contribution?.num_of_month &&
                contribution?.owner === userProfile?.name
              ) {
                handleStartContribution();
              } else if (
                parsed?.length !== contribution?.num_of_month &&
                contribution?.owner === userProfile?.name
              ) {
                setVisible(!visible);
              } else {
                handleJoinContribution();
              }
            }}
          >
            <Text style={styles.fabText}>
              {contribution?.status === 'completed'
                ? 'Completed'
                : contribution?.status === 'running'
                ? 'Running'
                : parsed?.length === contribution?.num_of_month &&
                  contribution?.owner === userProfile?.name
                ? 'Start'
                : parsed?.length !== contribution?.num_of_month &&
                  contribution?.owner === userProfile?.name
                ? 'Invite'
                : 'Join'}
            </Text>
          </Pressable>
        )}
      </View>
      <ContactModal
        visible={visible}
        setVisible={setVisible}
        invite_link={contribution.invite_link}
      />
    </PageView>
  );
};

const NextContributionDay = ({ contribution, parsed }) => {
  const currentCount = calculateDifference(
    contribution.start_date,
    contribution.variant
  );

  const getNextContributionDay = () => {
    if (contribution?.status !== 'running') {
      return 'Not running';
    }

    const today = new Date();
    let nextContributionDay;

    switch (contribution?.variant) {
      case 'days':
        nextContributionDay = new Date(today);
        nextContributionDay.setDate(today.getDate() + 1);
        break;
      case 'weeks':
        nextContributionDay = new Date(today);
        nextContributionDay.setDate(
          today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7)
        );
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
    <View style={styles.detailContainer}>
      <Text style={styles.label}>Next Contribution Day</Text>
      <Text style={styles.value}>
        {contribution.status === 'completed'
          ? 'Completed'
          : currentCount >= parsed.length
          ? '-'
          : getNextContributionDay()}
      </Text>
    </View>
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

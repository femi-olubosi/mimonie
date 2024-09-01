import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  TouchableOpacity,
} from 'react-native';
import {
  useRouter,
  useLocalSearchParams,
  router,
  useFocusEffect,
} from 'expo-router';
import * as Linking from 'expo-linking';
import { PageView, SkeletonLoader } from '@/components/Reusable';
import { useGlobalContext } from '../../../store/StoreContext';
import {
  fetchUserContributions,
  findContributionByID,
  joinContribution,
  updateContribution,
  findContributionByInviteLink,
} from '@/api/contributions.service';
import {
  AntDesign,
  Feather,
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
import { updateInvite } from '../../../api/invite.service';
import { safeParseJSON } from '../../../utils/safeJSON';
import CopyLink from '../../../components/CopyLink';

const ContributionDetails = () => {
  const { setContributions, currentUser, userProfile, setIsLoading } =
    useGlobalContext();
  const { id } = useLocalSearchParams();
  const [visible, setVisible] = useState(false);
  const [contribution, setContribution] = useState({});
  const [parsed, setParsed] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const fetchContribution = async () => {
      setLoading(true);
      await findContributionByID(id, setContribution);
      setLoading(false);
    };

    fetchContribution();
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
        'You cannot create/join contribution at the moment. Add a card to continue'
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
      await updateInvite(userProfile.userId, contribution.invite_link);
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

      const res = await updateContribution(contribution?.id, {
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
    if (contribution) {
      const parsedData = safeParseJSON(contribution?.participant, []);
      setParsed(parsedData);
    }
  }, [contribution]);

  const next = parsed?.find((e) => e.status !== 'received');

  return (
    <PageView title={'Contribution Details'} route={'protected/mimonie'}>
      <View style={styles.container}>
        {loading ? (
          <View style={{ rowGap: 6 }}>
            <View style={{ marginVertical: 10 }}>
              <SkeletonLoader width="100%" height={20} />
              <SkeletonLoader width="60%" height={20} />
              <SkeletonLoader width="80%" height={20} />
            </View>
            <View style={{ marginVertical: 10 }}>
              <SkeletonLoader width="100%" height={20} />
              <SkeletonLoader width="60%" height={20} />
              <SkeletonLoader width="80%" height={20} />
            </View>
            <View style={{ marginVertical: 10 }}>
              <SkeletonLoader width="100%" height={20} />
              <SkeletonLoader width="60%" height={20} />
              <SkeletonLoader width="80%" height={20} />
            </View>
            <View style={{ marginVertical: 10 }}>
              <SkeletonLoader width="100%" height={20} />
              <SkeletonLoader width="60%" height={20} />
              <SkeletonLoader width="80%" height={20} />
            </View>
          </View>
        ) : (
          <>
            <CopyLink inviteLink={contribution.id} />
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
                    // minHeight: 85,
                    marginBottom: 16,
                    backgroundColor: 'white',
                    borderRadius: 8,
                  },
                ]}
              >
                <Text style={styles.label}>Contributors</Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ columnGap: 8, paddingBottom: 10 }}
                  nestedScrollEnabled={true}
                  horizontal={true}
                >
                  {parsed?.map((eN, id) => {
                    return (
                      <View
                        key={id}
                        style={{
                          justifyContent: 'center',
                          height: 100,
                          minWidth: 200,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          backgroundColor: 'white',
                          paddingHorizontal: 8,
                          rowGap: 10,
                          shadowColor: 'gray',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            columnGap: 10,
                            alignItems: 'center',
                          }}
                        >
                          <View>
                            {eN.picture ? (
                              <Image
                                source={{ uri: eN.picture }}
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 8,
                                  backgroundColor: '#E5E7EB',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Feather
                                name="image"
                                color={'gray'}
                                size={40}
                                style={{
                                  padding: 0,
                                  margin: 0,
                                }}
                              />
                            )}
                          </View>
                          <View style={{ rowGap: 4 }}>
                            <Text style={{ fontFamily: 'ir' }}>{eN.name}</Text>
                            <View>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  columnGap: 6,
                                  alignItems: 'center',
                                }}
                              >
                                <Text>{capitalizeFirstLetter(eN.status)}</Text>
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
                                  <AntDesign
                                    name="minussquareo"
                                    size={14}
                                    color="gray"
                                  />
                                )}
                                {next?.userId === eN.userId ? (
                                  <Text
                                    style={{
                                      color: 'lightgreen',
                                      fontFamily: 'ir',
                                    }}
                                  >
                                    Next
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                            {/* <Text style={{ fontFamily: "ir" }}>{id + 1}</Text> */}
                          </View>
                        </View>
                        {eN?.status !== 'in progress' &&
                        eN?.last_successful_round <
                          contribution?.current_count ? (
                          <Text style={{ fontSize: 10, color: 'red' }}>
                            Attention: {'Missed last contribution'}
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 10 }}>
                            Note: {'In good standing'}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
              <NextContributionDay
                contribution={contribution}
                parsed={parsed}
              />
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
          </>
        )}
      </View>
      <ContactModal
        visible={visible}
        setVisible={setVisible}
        invite_link={contribution?.invite_link}
      />
    </PageView>
  );
};

const NextContributionDay = ({ contribution, parsed }) => {
  const getNextContributionDay = () => {
    if (contribution?.status === 'open') {
      return 'Not running';
    }

    if (contribution?.status === 'completed') {
      return 'Completed';
    }

    if (
      contribution?.current_count !== 0 &&
      contribution?.current_count >= parsed.length
    ) {
      return '-';
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
      <Text style={styles.value}>{getNextContributionDay()}</Text>
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

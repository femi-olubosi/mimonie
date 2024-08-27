import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { PageView } from '@/components/Reusable';
import { useGlobalContext } from '@/store/StoreContext';
import { fetchInviteContributions } from '@/api/invite.service';
import { Colors } from '../../constants/Colors';
import { naira } from '@/constants/Currency';
import { statusCheck } from '@/utils/statusCheck';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { router } from 'expo-router';

const my_invites = () => {
  const { userProfile } = useGlobalContext();
  const [inviteArray, setInviteArray] = useState([]);

  useEffect(() => {
    const fetchContributions = async () => {
      const fetchedContributions = await fetchInviteContributions(
        userProfile?.invites
      );
      setInviteArray(fetchedContributions);
    };

    fetchContributions();
  }, [userProfile?.invites]);

  const renderContribution = ({ item }) => {
    const createdAtDate = new Date(item.createdAt);

    return (
      <TouchableOpacity
        style={styles.contributionContainer}
        onPress={() => router.push(`/protected/mimonie/${item.id}`)}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={styles.contributionName}>{item.name}</Text>
          <Text style={{ fontSize: 10 }}>{item.category}</Text>
        </View>
        <View style={styles.contributionInfo}>
          <Text style={styles.contributionAmount}>
            {naira}
            {item.amount.toLocaleString('en-US')}
          </Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: statusCheck(item.status),
            }}
          >
            <Text style={styles.contributionStatus}>
              {capitalizeFirstLetter(item.status)}
            </Text>
          </View>
        </View>
        {/* <View style={styles.contributionInfo}>
          <Text style={styles.contributionAmount}>
            Joined: {item.participant.length}
          </Text>
          <Text style={styles.contributionAmount}>Target: {item.target}</Text>
        </View> */}
        <View style={styles.contributionInfo}>
          <Text style={styles.contributionAmount}>
            {createdAtDate.toLocaleDateString()}
          </Text>
          <Text style={styles.contributionAmount}>By: {item.owner}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PageView title={'My Invites'}>
      <View style={{ padding: 20 }}>
        <FlatList
          data={inviteArray}
          renderItem={renderContribution}
          keyExtractor={(item, idx) => idx.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </PageView>
  );
};

export default my_invites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContent: {
    paddingVertical: 20,
  },
  contributionContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    rowGap: 10,
  },
  contributionName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  contributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributionAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  contributionStatus: {
    fontSize: 14,
    color: 'white',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: Colors.pri,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  inputSearch: {
    backgroundColor: 'white',
    height: '100%',
    flex: 1,
    fontSize: 11,
    color: 'gray',
  },
});

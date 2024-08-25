import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import { PageView } from '@/components/Reusable';
import { Colors } from '@/constants/Colors';
import * as Linking from 'expo-linking';
import {
  fetchUserContributions,
  findContributionByInviteLink,
} from '@/api/contributions.service';
import { naira } from '@/constants/Currency';
import { statusCheck } from '@/utils/statusCheck';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';

const Mimonie = () => {
  const { currentUser, contributions, setContributions, setIsLoading } =
    useGlobalContext();
  const router = useRouter();
  const [contributionSearch, setContributionSearch] = useState('');
  const [searchedContribution, setSearchedContribution] = useState(null);

  const handleSearchContribution = async (searchTerm) => {
    setIsLoading(true);
    try {
      const searchQuery =
        typeof searchTerm === 'string' && searchTerm.trim() !== ''
          ? searchTerm
          : contributionSearch;

      const res = await findContributionByInviteLink(searchQuery);
      setSearchedContribution(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      if (!searchTerm) {
        setContributionSearch('');
      }
    }
  };

  useEffect(() => {
    fetchUserContributions(currentUser.userId, setContributions);

    const fetchAndHandleDeepLink = (url) => {
      const { path, queryParams } = Linking.parse(url);

      if (path === 'mimonie' || path === 'protected/mimonie') {
        setContributionSearch(url);
        handleSearchContribution(url);
      }
    };

    const handleDeepLink = (event) => {
      console.log('Deep link received:', event.url);
      fetchAndHandleDeepLink(event.url);
    };

    // Check if the app was opened with a deep link initially
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App opened with URL:', url);
        fetchAndHandleDeepLink(url);
      }
    });

    // Add listener for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Cleanup the listener when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

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
    <PageView title={'My Contributions'} backIcon={false}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text
          style={{
            color: 'gray',
            fontSize: 11,
            fontFamily: 'ir',
            marginBottom: 4,
          }}
        >
          Do you have an invite link? Paste it below to search
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 4,
            borderWidth: 1,
            borderColor: '#9095A1',
            borderRadius: 12,
            paddingHorizontal: 15,
            height: 40,
            backgroundColor: 'white',
          }}
        >
          <TextInput
            style={styles.inputSearch}
            value={contributionSearch}
            onChangeText={setContributionSearch}
            placeholder="Search Contribution"
          />
          <AntDesign
            name="search1"
            size={16}
            color="gray"
            onPress={handleSearchContribution}
          />
        </View>
        {searchedContribution && (
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              marginTop: 10,
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
            onPress={() => {
              setSearchedContribution(null), setContributionSearch('');
            }}
          >
            <Text style={{ fontSize: 12 }}>Clear search</Text>
          </TouchableOpacity>
        )}
        <FlatList
          data={searchedContribution || contributions}
          renderItem={renderContribution}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/protected/create_contribution')}
        >
          <AntDesign name="plus" size={24} color="white" />
          <Text style={styles.buttonText}>Create New Contribution</Text>
        </TouchableOpacity>
      </View>
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

export default Mimonie;

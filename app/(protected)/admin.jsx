import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
// import { fetchAllUserProfile, fetchAllUserContributions } from '../../services/service'; // assuming it's inside a services folder
import { PageView } from '@/components/Reusable';
import { fetchAllUserProfile } from '../../api/user.service';
import { fetchAllUserContributions } from '../../api/contributions.service';
import { Colors } from '../../constants/Colors';

function Admin() {
  const [viewMode, setViewMode] = useState('users');
  const [users, setUsers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true); // Loader state

  // Fetch user profiles
  // useEffect(() => {
  //   async function fetchData() {
  //     setLoading(true); // Start loading
  //     if (viewMode === 'users') {
  //       const userProfileData = await fetchAllUserProfile();
  //       setUsers(userProfileData);
  //     } else {
  //       const contributionsData = await fetchAllUserContributions();
  //       setContributions(contributionsData);
  //     }
  //     setLoading(false); // End loading
  //   }
  //   fetchData();
  // }, [viewMode]);

  return (
    <PageView title={'Admin View'}>
      <View style={styles.switchContainer}>
        <Button
          title="View Users"
          onPress={() => setViewMode('users')}
          color={viewMode === 'users' ? Colors.pri : 'gray'}
        />
        <Button
          title="View Contributions"
          onPress={() => setViewMode('contributions')}
          color={viewMode === 'contributions' ? Colors.pri : 'gray'}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.pri} />
      ) : (
        <ScrollView>
          {viewMode === 'users' ? (
            <View style={styles.contentContainer}>
              {users.map((user) => (
                <View key={user.id} style={styles.card}>
                  <Text style={styles.title}>Name: {user.name}</Text>
                  <Text>Email: {user.email}</Text>
                  <Text>Phone: {user.phone_number}</Text>
                  <Text>
                    BVN Verified: {user.is_bvn_verified ? 'Yes' : 'No'}
                  </Text>
                  <Text>
                    NIN Verified: {user.is_nin_verified ? 'Yes' : 'No'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.contentContainer}>
              {contributions.map((contribution) => (
                <View key={contribution.id} style={styles.card}>
                  <Text style={styles.title}>Name: {contribution.name}</Text>
                  <Text>Category: {contribution.category}</Text>
                  <Text>Owner: {contribution.owner}</Text>
                  <Text>Target: {contribution.target}</Text>
                  <Text>Status: {contribution.status}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </PageView>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    elevation: 2,
    rowGap: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default Admin;

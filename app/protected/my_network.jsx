import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { PageView } from '@/components/Reusable';
import { Colors } from '../../constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import {
  removeConnection,
  acceptConnectionRequest,
  rejectConnectionRequest,
} from '@/api/network.service';
import { fetchUserProfile } from '@/api/user.service';
import { useGlobalContext } from '../../store/StoreContext';
import { triggerNotificationForUser } from '@/api/pushNotification.service';
import { router } from 'expo-router';

const connect = () => {
  const [activeTab, setActiveTab] = useState(1);
  const {
    currentUser,
    setUserProfile,
    userProfile,
    setIsLoading,
    parsed,
    setParsed,
  } = useGlobalContext();

  const handleRemoveRequest = async (data) => {
    setParsed((prevData) =>
      prevData.filter((item) => item.phone_number !== data.phone_number)
    );
    try {
      await rejectConnectionRequest(data, userProfile);
      await fetchUserProfile(setUserProfile, currentUser);

      Alert.alert(
        'Connection rejected',
        '',
        [
          {
            text: 'OK',
            onPress: () => {
              fetchUserProfile(setUserProfile, currentUser);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectRequest = async (data) => {
    try {
      if (activeTab === 1) {
        setParsed((prevData) =>
          prevData.filter((item) => item.phone_number !== data.phone_number)
        );
        await removeConnection(data, userProfile);
        Alert.alert(
          'Connection removed',
          '',
          [
            {
              text: 'OK',
              onPress: () => {
                fetchUserProfile(setUserProfile, currentUser);
              },
            },
          ],
          { cancelable: false }
        );
      } else if (activeTab === 2) {
        setParsed((prevData) =>
          prevData.map((item) =>
            item.phone_number === data.phone_number
              ? { ...item, status: 'accepted' }
              : item
          )
        );
        await acceptConnectionRequest(data, userProfile);
        await triggerNotificationForUser(
          data?.push_token,
          'Connect Request Accepted',
          `${userProfile.name} accepted your connect request`
        );
        Alert.alert(
          'Connection accepted',
          '',
          [
            {
              text: 'OK',
              onPress: () => {
                fetchUserProfile(setUserProfile, currentUser);
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Error handling connection request:', error);
    } finally {
      await fetchUserProfile(setUserProfile, currentUser);
      setIsLoading(false);
    }
  };

  const myConnections = parsed?.filter((e) => e.status === 'accepted');
  const pendingConnections = parsed?.filter(
    (e) => e.type === 'request' && e.status === 'pending'
  );

  const renderConnectionItem = ({ item }) => (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        styles.itemContainer,
      ]}
    >
      <View style={{ rowGap: 5 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemOccupation}>{item.occupation}</Text>
      </View>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}
      >
        {activeTab === 2 && (
          <Pressable
            style={{
              paddingHorizontal: 6,
              paddingVertical: 5,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: 'red',
            }}
            onPress={() => handleRemoveRequest(item)}
          >
            <FontAwesome6 name="times-circle" size={16} color={'red'} />
          </Pressable>
        )}
        <Pressable
          style={{
            paddingHorizontal: 6,
            paddingVertical: 5,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: activeTab === 1 ? 'red' : Colors.pri,
          }}
          onPress={() => handleConnectRequest(item)}
        >
          <Text
            style={{
              color: activeTab === 1 ? 'red' : Colors.pri,
              fontSize: 14,
            }}
          >
            {activeTab === 1 ? 'Remove' : 'Accept'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <PageView title={'My Network'}>
      <View style={{ padding: 20, flex: 1 }}>
        <Text style={{ fontSize: 13, marginBottom: 12, color: 'gray' }}>
          Only people in your network can be invited to join your contributions.
        </Text>
        <Pressable
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'flex-end',
            backgroundColor: Colors.pri,
            borderRadius: 4,
            marginBottom: 12,
          }}
          onPress={() => router.push('/protected/contact')}
        >
          <Text style={{ fontFamily: 'im', fontSize: 16, color: 'white' }}>
            Invite Friends
          </Text>
        </Pressable>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab(1)}
            style={{
              borderRadius: 4,
              paddingVertical: 4,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomWidth: activeTab === 1 ? 1 : 0,
              borderBottomColor: activeTab === 1 ? Colors.pri : 'gray',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: activeTab === 1 ? Colors.pri : 'gray',
                paddingRight: 10,
                fontFamily: activeTab === 1 ? 'ib' : 'ir',
              }}
            >
              Connections
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab(2)}
            style={{
              borderRadius: 4,
              paddingVertical: 4,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomWidth: activeTab === 2 ? 1 : 0,
              borderBottomColor: activeTab === 2 ? Colors.pri : 'gray',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: activeTab === 2 ? Colors.pri : 'gray',
                paddingRight: 10,
                fontFamily: activeTab === 2 ? 'ib' : 'ir',
              }}
            >
              Pending Requests
            </Text>
            <View
              style={{
                borderRadius: 100,
                width: 15,
                height: 15,
                backgroundColor: 'red',
                position: 'absolute',
                top: -5,
                right: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 10, fontFamily: 'im' }}>
                {pendingConnections?.length || 0}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {myConnections.length < 1 && activeTab === 1 && (
          <View style={styles.noConnectionsContainer}>
            <Text style={styles.noConnectionsText}>
              You do not have any connection, please click the button below to
              invite or connect with friends.
            </Text>
            <Text style={styles.noConnectionsText}>
              Note, that to create a group contribution, you must have at least
              4 connections, as only people in your network can be invited to
              join your contributions.
            </Text>
          </View>
        )}

        <FlatList
          data={activeTab === 1 ? myConnections : pendingConnections}
          renderItem={renderConnectionItem}
          keyExtractor={(item, idx) => idx.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </PageView>
  );
};

export default connect;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    columnGap: 10,
  },
  itemContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemOccupation: {
    fontSize: 14,
    color: 'grey',
  },
  noConnectionsContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  noConnectionsText: {
    fontSize: 14,
    color: 'grey',
    textAlign: 'center',
    marginVertical: 10,
  },
});
